/**
 * Journey audit — walks a real crawl end to end and checks the route maths,
 * the map, and the UI under load.
 *
 *   npm run audit:journey
 *
 * Where audit.mjs proves each control works in isolation, this one proves the
 * whole thing holds together: that leg N really connects stop N to stop N+1,
 * that reordering rebuilds the legs, that the map agrees with the list, and
 * that nothing breaks when every card is expanded at once.
 *
 * The crawl starts at Birdee in Williamsburg, per the brief.
 */
import { chromium } from 'playwright'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { ALL_STOPS, STOPS } from '../data/stops'
import { haversine } from '../lib/geo'

const BASE = process.env.AUDIT_URL ?? 'http://localhost:3000'
const START = 'birdee-danish'

const fails = []
const warns = []
const passes = []
const fail = (a, m) => fails.push(`${a}: ${m}`)
const warn = (a, m) => warns.push(`${a}: ${m}`)
const pass = (m) => passes.push(m)

function findBrowser() {
  for (const r of [
    'chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell',
    'chromium_headless_shell-1229/chrome-headless-shell-mac-arm64/chrome-headless-shell',
  ]) {
    const p = `${homedir()}/Library/Caches/ms-playwright/${r}`
    if (existsSync(p)) return p
  }
}

const stopById = (id) => ALL_STOPS.find((s) => s.id === id)

const browser = await chromium.launch({ executablePath: findBrowser() })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } })
const page = await ctx.newPage()
const consoleErrors = []
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text().slice(0, 160)))
page.on('pageerror', (e) => consoleErrors.push('PAGEERROR ' + e.message.slice(0, 160)))

async function setRoute(ids) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.evaluate(
    ([r]) => {
      localStorage.setItem('tomato-crawl:route', JSON.stringify(r))
      localStorage.setItem('tomato-crawl:style', 'catalogue')
    },
    [ids],
  )
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForSelector('article')
  await page.waitForTimeout(1400)
}

/** What the UI currently believes the route is, read back out of the DOM. */
async function readTicket() {
  return page.evaluate(() => {
    const ticket = document.querySelector('#route-ticket, [class*="RouteTicket_ticket"]')
    if (!ticket) return null
    const list = ticket.querySelector('[class*="RouteTicket_list"]')
    const rows = list ? [...list.children].filter((n) => n.tagName === 'LI') : []
    return {
      stops: rows.map((li) => (li.querySelector('[class*="stopName"]')?.textContent || '').trim()),
      legs: rows
        .map((li) => {
          const leg = li.querySelector('[class*="RouteTicket_leg__"]')
          if (!leg) return null
          const mins = (leg.querySelector('strong')?.textContent || '').match(/\d+/)
          const steps = [...leg.querySelectorAll('[class*="RouteTicket_step__"]')].map((s) => ({
            line: s.querySelector('[class*="RouteTicket_line"]')?.textContent?.trim() || null,
            text: (s.querySelector('[class*="stepText"]')?.textContent || '').trim().slice(0, 60),
            mins: +((s.querySelector('[class*="stepMin"]')?.textContent || '').match(/\d+/)?.[0] ?? 0),
          }))
          const href = leg.querySelector('a[href]')?.getAttribute('href') || ''
          return { minutes: mins ? +mins[0] : null, steps, href }
        })
        .filter(Boolean),
      totals: [...ticket.querySelectorAll('dl > div')].map((d) => ({
        label: (d.querySelector('dt')?.textContent || '').trim(),
        value: (d.querySelector('dd')?.textContent || '').trim(),
      })),
      warning: (ticket.querySelector('[class*="RouteTicket_warning"]')?.textContent || '').trim(),
    }
  })
}

console.log(`\n  Journey audit — ${BASE}\n  starting at ${stopById(START).venue}\n  ${'─'.repeat(58)}`)

/* ── 1. A single stop makes no legs and no nonsense totals ─────────────────── */
await setRoute([START])
let t = await readTicket()
if (!t) fail('ticket', 'route ticket not found in the DOM')
else {
  if (t.stops.length !== 1) fail('ticket', `1 stop added, ticket shows ${t.stops.length}`)
  if (t.legs.length !== 0) fail('ticket', `a single stop produced ${t.legs.length} legs`)
  const total = t.totals.find((x) => /total/i.test(x.label))
  if (!total || !/\d/.test(total.value)) fail('ticket', 'no total shown for a one-stop route')
  else pass(`a one-stop route shows no legs and a sane total (${total.value})`)
}

/* ── 2. Build the real crawl outward from Birdee ───────────────────────────── */
// Nearest-first from Birdee, across both boroughs, so the legs are a genuine mix
// of walks and rides rather than a tidy single-neighbourhood hop.
const start = stopById(START)
const rest = STOPS.filter((s) => s.id !== START)
  .map((s) => ({ s, d: haversine(start.coords, s.coords) }))
  .sort((a, b) => a.d - b.d)
  .slice(0, 4)
  .map((x) => x.s)
const route = [start, ...rest]
const routeIds = route.map((s) => s.id)

await setRoute(routeIds)
t = await readTicket()

if (!t) fail('ticket', 'ticket missing for the multi-stop route')
else {
  if (t.stops.length !== routeIds.length)
    fail('ticket', `route has ${routeIds.length} stops, ticket shows ${t.stops.length}`)
  if (t.legs.length !== routeIds.length - 1)
    fail('ticket', `${routeIds.length} stops should give ${routeIds.length - 1} legs, got ${t.legs.length}`)

  // The first row must be where we said the crawl starts.
  if (!t.stops[0] || !route[0].item.toLowerCase().startsWith(t.stops[0].toLowerCase().slice(0, 12)))
    fail('order', `first stop should be "${route[0].item}", ticket shows "${t.stops[0]}"`)
  else pass(`the crawl starts at ${route[0].venue} — ${route[0].item}`)

  /* ── 3. Every leg's Google link must carry the right coordinate pair ────── */
  //    This is the bug that hides: legs rendering fine while pointing at the
  //    wrong pair after a reorder.
  let legMismatch = 0
  t.legs.forEach((leg, i) => {
    const from = route[i]
    const to = route[i + 1]
    if (!from || !to) return
    const u = new URL(leg.href)
    const origin = u.searchParams.get('origin')
    const dest = u.searchParams.get('destination')
    if (origin !== from.coords.join(',') || dest !== to.coords.join(',')) {
      legMismatch++
      fail('route-map', `leg ${i + 1} should link ${from.venue}→${to.venue}, links ${origin}→${dest}`)
    }
    if (u.searchParams.get('travelmode') !== 'transit')
      fail('route-map', `leg ${i + 1} is not in transit mode`)
  })
  if (!legMismatch) pass(`all ${t.legs.length} legs link the correct coordinate pair in transit mode`)

  /* ── 4. Leg durations must be plausible for the real distance ───────────── */
  let implausible = 0
  t.legs.forEach((leg, i) => {
    const from = route[i]
    const to = route[i + 1]
    const km = haversine(from.coords, to.coords) / 1000
    if (leg.minutes == null) return
    // Nothing in NYC covers ground faster than ~1 km/min door to door, and
    // nothing reasonable takes over 25 min/km either.
    if (leg.minutes < km * 0.8) {
      implausible++
      fail('route-map', `leg ${i + 1} (${from.venue}→${to.venue}) claims ${leg.minutes} min for ${km.toFixed(1)} km`)
    }
    if (km > 0.3 && leg.minutes > km * 30) {
      implausible++
      warn('route-map', `leg ${i + 1} (${from.venue}→${to.venue}) is ${leg.minutes} min for ${km.toFixed(1)} km`)
    }
    // Steps should roughly account for the leg total.
    const stepSum = leg.steps.reduce((n, s) => n + s.mins, 0)
    if (leg.steps.length && Math.abs(stepSum - leg.minutes) > Math.max(6, leg.minutes * 0.5))
      warn('route-map', `leg ${i + 1} steps sum to ${stepSum} but the leg says ${leg.minutes}`)
  })
  if (!implausible) pass('every leg duration is plausible for the distance it covers')

  /* ── 5. Totals must equal the parts ─────────────────────────────────────── */
  const mins = (v) => {
    const h = v.match(/(\d+)\s*hr/)
    const m = v.match(/(\d+)\s*min/)
    return (h ? +h[1] * 60 : 0) + (m ? +m[1] : 0)
  }
  const travel = t.totals.find((x) => /travel|foot/i.test(x.label))
  const counter = t.totals.find((x) => /counter/i.test(x.label))
  const total = t.totals.find((x) => /^total$/i.test(x.label))
  if (travel && counter && total) {
    const sum = mins(travel.value) + mins(counter.value)
    if (Math.abs(sum - mins(total.value)) > 1)
      fail('totals', `travel ${travel.value} + counters ${counter.value} ≠ total ${total.value}`)
    else pass(`totals add up: ${travel.value} travelling + ${counter.value} at counters = ${total.value}`)
    const dwell = route.reduce((n, s) => n + s.dwellMinutes, 0)
    if (mins(counter.value) !== dwell)
      fail('totals', `counter time ${counter.value} does not match the ${dwell} min of dwell in the data`)
    const legSum = t.legs.reduce((n, l) => n + (l.minutes ?? 0), 0)
    if (t.legs.every((l) => l.minutes != null) && Math.abs(legSum - mins(travel.value)) > 1)
      fail('totals', `legs sum to ${legSum} min but travel shows ${travel.value}`)
  } else fail('totals', 'travel / counter / total rows not all present')
}

/* ── 6. The map must agree with the list ───────────────────────────────────── */
await page.waitForSelector('.leaflet-container')
await page.waitForTimeout(1200)
const mapState = await page.evaluate(() => {
  const numbered = [...document.querySelectorAll('.leaflet-marker-icon svg text')].map((t) => t.textContent.trim())
  const poly = document.querySelector('.leaflet-overlay-pane path')
  return {
    totalMarkers: document.querySelectorAll('.leaflet-marker-icon').length,
    numbered,
    polyPoints: poly ? (poly.getAttribute('d') || '').split(/(?=[ML])/).filter(Boolean).length : 0,
    polyHidden: document.querySelector('.leaflet-overlay-pane svg')?.getAttribute('aria-hidden'),
  }
})
if (mapState.totalMarkers < STOPS.length)
  fail('map', `${mapState.totalMarkers} markers for ${STOPS.length} stops`)
const expectedNums = route.map((_, i) => String(i + 1))
if (JSON.stringify(mapState.numbered.sort()) !== JSON.stringify([...expectedNums].sort()))
  fail('map', `numbered pins are [${mapState.numbered}], expected [${expectedNums}]`)
if (mapState.polyPoints !== route.length)
  fail('map', `route line has ${mapState.polyPoints} points for ${route.length} stops`)
if (mapState.polyHidden !== 'true') fail('map', 'route line svg is not hidden from assistive tech')
if (!fails.some((f) => f.startsWith('map')))
  pass(`map shows ${mapState.totalMarkers} pins, ${route.length} of them numbered, joined by a ${mapState.polyPoints}-point line`)

/* ── 7. Reordering must rebuild the legs, not just shuffle labels ──────────── */
const before = await readTicket()
await page.locator('button[aria-label^="Move"][aria-label$="later"]').first().click()
await page.waitForTimeout(1800)
const after = await readTicket()
if (after.stops[0] === before.stops[0])
  fail('reorder', 'moving the first stop later did not change the order')
else {
  const newFirst = route[1]
  const newSecond = route[0]
  const u = new URL(after.legs[0].href)
  if (u.searchParams.get('origin') !== newFirst.coords.join(',') ||
      u.searchParams.get('destination') !== newSecond.coords.join(','))
    fail('reorder', 'after reordering, leg 1 still points at the old pair — legs did not rebuild')
  else pass('reordering rebuilds the legs, and their links follow the new order')
}

/* ── 8. Proximity sort must actually shorten the walk ──────────────────────── */
// Deliberately worst-case: furthest-apart ordering, then sort.
const worst = [...STOPS].sort((a, b) => a.coords[1] - b.coords[1]).slice(0, 5)
await setRoute(worst.map((s) => s.id))
const beforeSort = await readTicket()
const sortBtn = page.getByRole('button', { name: /sort by proximity/i })
if (await sortBtn.count()) {
  const beforeSum = beforeSort.legs.reduce((n, l) => n + (l.minutes ?? 0), 0)
  await sortBtn.click()
  await page.waitForTimeout(1800)
  const afterSort = await readTicket()
  const afterSum = afterSort.legs.reduce((n, l) => n + (l.minutes ?? 0), 0)
  if (afterSum > beforeSum)
    fail('sort', `proximity sort made the route longer: ${beforeSum} → ${afterSum} min`)
  else pass(`proximity sort does not lengthen the route (${beforeSum} → ${afterSum} min)`)
} else warn('sort', 'proximity sort button not offered')

/* ── 9. Every card expanded at once must not break the layout ──────────────── */
await setRoute(routeIds)
await page.evaluate(() => {
  document.querySelectorAll('article button[aria-expanded]').forEach((b) => b.click())
})
await page.waitForTimeout(900)
const expanded = await page.evaluate(() => {
  const d = document.documentElement
  const open = document.querySelectorAll('article [aria-expanded="true"]').length
  const over = [...document.querySelectorAll('article *')].filter((e) => {
    const r = e.getBoundingClientRect()
    return r.width > 0 && r.right > d.clientWidth + 1
  }).length
  const quotes = document.querySelectorAll('article blockquote, article [class*="quote"]').length
  return { open, over, quotes, scrollW: d.scrollWidth, clientW: d.clientWidth }
})
if (expanded.open < 1) fail('ui', 'expanding every sources block opened none')
if (expanded.scrollW > expanded.clientW + 1) fail('ui', 'expanded sources caused horizontal scroll')
if (expanded.over > 0) fail('ui', `${expanded.over} elements overflow with sources expanded`)
if (!expanded.quotes) fail('ui', 'no verbatim quotes rendered with sources open')
if (!fails.some((f) => f.startsWith('ui')))
  pass(`all ${expanded.open} sources blocks expand with ${expanded.quotes} quotes and no overflow`)

/* ── 10. The whole crawl at once ───────────────────────────────────────────── */
await setRoute(STOPS.map((s) => s.id))
const full = await readTicket()
if (full.stops.length !== STOPS.length) fail('scale', `all-stops route shows ${full.stops.length} of ${STOPS.length}`)
if (full.legs.length !== STOPS.length - 1) fail('scale', `expected ${STOPS.length - 1} legs, got ${full.legs.length}`)
const unresolved = full.legs.filter((l) => l.minutes == null).length
if (unresolved) warn('scale', `${unresolved} legs had no duration on a ${STOPS.length}-stop route`)
if (!fails.some((f) => f.startsWith('scale')))
  pass(`a full ${STOPS.length}-stop crawl renders ${full.legs.length} legs without falling over`)

/* ── 11. Mobile: the same journey on a phone ───────────────────────────────── */
await page.setViewportSize({ width: 375, height: 812 })
await setRoute(routeIds)
const routeTab = page.locator('nav[aria-label="View"] button').nth(2)
await routeTab.click()
await page.waitForTimeout(1400)
const mob = await page.evaluate(() => {
  const d = document.documentElement
  const ticket = document.querySelector('[class*="RouteTicket_ticket"]')
  const small = [...document.querySelectorAll('[class*="RouteTicket"] button, [class*="RouteTicket"] a')]
    .filter((e) => {
      const r = e.getBoundingClientRect()
      if (!r.width) return false
      const cs = getComputedStyle(e, '::after')
      const g = cs.content && cs.content !== 'none' && cs.position === 'absolute' ? Math.abs(parseFloat(cs.top) || 0) : 0
      return r.height + g * 2 < 44
    }).length
  return {
    ticketVisible: !!ticket && ticket.getBoundingClientRect().height > 100,
    overflow: d.scrollWidth > d.clientWidth + 1,
    smallTargets: small,
    legs: document.querySelectorAll('[class*="RouteTicket_leg__"]').length,
  }
})
if (!mob.ticketVisible) fail('mobile', 'route tab does not show the ticket')
if (mob.overflow) fail('mobile', 'route view scrolls horizontally at 375px')
if (mob.smallTargets) fail('mobile', `${mob.smallTargets} route controls under 44px on a phone`)
if (mob.legs !== routeIds.length - 1) fail('mobile', `phone shows ${mob.legs} legs, expected ${routeIds.length - 1}`)
if (!fails.some((f) => f.startsWith('mobile')))
  pass(`the same ${routeIds.length}-stop crawl works on a 375px phone with ${mob.legs} legs and no cramped controls`)

if (consoleErrors.length) for (const e of [...new Set(consoleErrors)].slice(0, 4)) fail('console', e)
else pass('no console errors across the entire journey')

await browser.close()

console.log('')
for (const p of passes) console.log(`  ✓ ${p}`)
if (warns.length) {
  console.log(`\n  ${warns.length} warning(s):`)
  for (const w of warns) console.log(`    ~ ${w}`)
}
if (fails.length) {
  console.log(`\n  ${fails.length} FAILURE(S):`)
  for (const f of fails) console.log(`    ✗ ${f}`)
  console.log('')
  process.exit(1)
}
console.log(`\n  ${'─'.repeat(58)}\n  Journey clean. ${passes.length} checks passed, ${warns.length} warnings.\n`)
