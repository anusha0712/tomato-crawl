/**
 * Full audit. Run against a live dev or prod server:
 *
 *   npm run audit
 *
 * Covers rendering across every style, responsive behaviour down to 320px,
 * every interaction the UI exposes, accessibility, the transit API, and data
 * integrity. Failures are listed with enough detail to act on; warnings are
 * things worth knowing that do not block.
 */
import { chromium } from 'playwright'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'

const BASE = process.env.AUDIT_URL ?? 'http://localhost:3000'
/** Next's dev overlay is not part of the product; never let it into a measurement. */
const NOT_DEVTOOLS = ':not([data-nextjs-dev-tools-button]):not([data-next-mark])'
const DEV_SEL = '[data-nextjs-dev-tools-button], [data-next-mark], nextjs-portal, #nextjs-dev-tools-menu'
const STYLES = ['catalogue', 'orchard', 'packet', 'transit', 'chalk', 'herbarium', 'conserva']
const WIDTHS = [320, 375, 414, 768, 1024, 1440]

const fails = []
const warns = []
const passes = []
const fail = (area, msg) => fails.push(`${area}: ${msg}`)
const warn = (area, msg) => warns.push(`${area}: ${msg}`)
const pass = (msg) => passes.push(msg)

function findBrowser() {
  const roots = [
    'chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell',
    'chromium_headless_shell-1229/chrome-headless-shell-mac-arm64/chrome-headless-shell',
  ]
  for (const r of roots) {
    const p = `${homedir()}/Library/Caches/ms-playwright/${r}`
    if (existsSync(p)) return p
  }
  return undefined
}

/* --- helpers injected into the page --------------------------------------- */

const CONTRAST_FN = `
(() => {
  function parse(v){
    v = (v||'').trim();
    if (v.startsWith('#')) { let h=v.slice(1); if(h.length===3)h=h.split('').map(c=>c+c).join('');
      return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16),1]; }
    const m = v.match(/[\\d.]+/g); if(!m) return null;
    return [ +m[0], +m[1], +m[2], m[3]!==undefined ? +m[3] : 1 ];
  }
  function srgb(c){ c/=255; return c<=0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4); }
  function lum(c){ return 0.2126*srgb(c[0])+0.7152*srgb(c[1])+0.0722*srgb(c[2]); }
  function over(fg,bg){ const a=fg[3]; return [0,1,2].map(i=>fg[i]*a+bg[i]*(1-a)).concat(1); }
  function effBg(el){
    let n = el;
    while (n && n !== document.documentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c[3] > 0.85) return c;
      n = n.parentElement;
    }
    return parse(getComputedStyle(document.body).backgroundColor) || [255,255,255,1];
  }
  const out = [];
  const els = [...document.querySelectorAll('body *')].filter(e => {
    if (!e.childNodes.length) return false;
    const hasText = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!hasText) return false;
    const cs = getComputedStyle(e);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.15) return false;
    const r = e.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    if (e.closest('.leaflet-container')) return false;
    if (e.closest('nextjs-portal') || e.closest('#nextjs-dev-tools-menu')) return false;
    return true;
  });
  for (const e of els) {
    const cs = getComputedStyle(e);
    let fg = parse(cs.color); if (!fg) continue;
    const bg = effBg(e);
    if (fg[3] < 1) fg = over(fg, bg);
    const L1 = lum(fg), L2 = lum(bg);
    const ratio = (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
    const size = parseFloat(cs.fontSize);
    const bold = (parseInt(cs.fontWeight,10) || 400) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    if (ratio < need) {
      out.push({
        text: (e.textContent||'').trim().slice(0,42),
        cls: String(e.className).slice(0,30),
        ratio: +ratio.toFixed(2), need, size: +size.toFixed(1),
      });
    }
  }
  return out;
})()
`

const TAP_FN = `
(() => {
  const out = [];
  for (const e of document.querySelectorAll('a[href], button, input, select, [role="menuitemradio"]')) {
    const r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (e.closest('.leaflet-control-attribution')) continue;
    if (e.hasAttribute('data-nextjs-dev-tools-button') || e.hasAttribute('data-next-mark')) continue;
    if (e.closest('nextjs-portal') || e.closest('#nextjs-dev-tools-menu')) continue;
    const cs = getComputedStyle(e, '::after');
    let gx = 0, gy = 0;
    if (cs.content && cs.content !== 'none' && cs.position === 'absolute') {
      gy = Math.abs(parseFloat(cs.top) || 0); gx = Math.abs(parseFloat(cs.left) || 0);
    }
    const h = r.height + gy*2, w = r.width + gx*2;
    if (h < 44 || w < 24) {
      out.push({ label: (e.textContent||e.getAttribute('aria-label')||e.tagName).trim().slice(0,34),
                 h: Math.round(h), w: Math.round(w) });
    }
  }
  return out;
})()
`

const OVERFLOW_FN = `
(() => {
  const d = document.documentElement;
  const offenders = [...document.querySelectorAll('body *')]
    .filter(e => { const r = e.getBoundingClientRect();
      return r.width > 0 && r.right > d.clientWidth + 1 && !e.closest('.leaflet-container')
        && !e.closest('nextjs-portal'); })
    .map(e => {
      // Clipped by an ancestor with overflow hidden is fine — art bleeding off a banner.
      let n = e.parentElement, clipped = false;
      while (n && n !== document.documentElement) {
        const o = getComputedStyle(n).overflowX;
        if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') { clipped = true; break; }
        n = n.parentElement;
      }
      return clipped ? null : (e.tagName + '.' + String(e.className).slice(0,24) + ' right=' + Math.round(e.getBoundingClientRect().right));
    })
    .filter(Boolean);
  return { scrollW: d.scrollWidth, clientW: d.clientWidth, offenders: [...new Set(offenders)].slice(0,6) };
})()
`

/* --- the run --------------------------------------------------------------- */

const browser = await chromium.launch({ executablePath: findBrowser() })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 } })
const page = await ctx.newPage()

const consoleErrors = []
/** The audit deliberately probes the API with bad input; those 4xx are expected. */
let expectingApiErrors = false
page.on('console', (m) => {
  if (m.type() !== 'error') return
  const txt = m.text()
  if (expectingApiErrors && /\b(400|Bad Request)\b/.test(txt)) return
  consoleErrors.push(txt.slice(0, 180))
})
page.on('pageerror', (e) => consoleErrors.push('PAGEERROR ' + e.message.slice(0, 180)))

async function load(style) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  if (style) {
    await page.evaluate((s) => localStorage.setItem('tomato-crawl:style', s), style)
    await page.reload({ waitUntil: 'domcontentloaded' })
  }
  await page.waitForSelector('article', { timeout: 20000 })
  await page.waitForTimeout(450)
}

console.log(`\n  Auditing ${BASE}\n  ${'─'.repeat(58)}`)

/* 1 — every style renders, with real fonts and no console errors */
for (const style of STYLES) {
  await load(style)
  const info = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement)
    const h1 = document.querySelector('h1')
    const dish = document.querySelector('article h3')
    return {
      style: document.documentElement.getAttribute('data-style'),
      stops: document.querySelectorAll('article').length,
      display: h1 ? getComputedStyle(h1).fontFamily.split(',')[0].replace(/"/g, '') : null,
      body: getComputedStyle(document.body).fontFamily.split(',')[0].replace(/"/g, ''),
      dishColor: dish ? getComputedStyle(dish).color : null,
      tokensMissing: ['--bg','--ink','--accent','--card-bg','--well-bg','--bg-ink','--rail-w','--line','--pin-r','--hero-bg','--footer-bg']
        .filter((t) => !cs.getPropertyValue(t).trim()),
    }
  })
  if (info.style !== style) fail('style', `${style} did not apply (got ${info.style})`)
  if (info.stops !== 10) fail('style', `${style} rendered ${info.stops} stops, expected 10`)
  if (!info.display || /^(Times|serif)$/i.test(info.display)) fail('fonts', `${style} display font fell back to ${info.display}`)
  if (info.tokensMissing.length) fail('tokens', `${style} missing ${info.tokensMissing.join(', ')}`)

  const bad = await page.evaluate(CONTRAST_FN)
  if (bad.length) {
    for (const b of bad.slice(0, 4)) fail('contrast', `${style} "${b.text}" ${b.ratio}:1 (needs ${b.need}, ${b.size}px)`)
    if (bad.length > 4) fail('contrast', `${style} +${bad.length - 4} more below threshold`)
  }
  const taps = await page.evaluate(TAP_FN)
  if (taps.length) for (const t of taps.slice(0, 3)) warn('tap-target', `${style} "${t.label}" ${t.w}×${t.h}`)
}
if (!fails.some((f) => f.startsWith('style') || f.startsWith('fonts') || f.startsWith('tokens')))
  pass(`all ${STYLES.length} styles render with 10 stops, correct fonts and a complete token set`)
if (!fails.some((f) => f.startsWith('contrast'))) pass('computed text contrast passes WCAG AA in every style')

/* 2 — responsive */
await load('catalogue')
for (const w of WIDTHS) {
  await page.setViewportSize({ width: w, height: 900 })
  await page.waitForTimeout(320)
  const r = await page.evaluate(OVERFLOW_FN)
  if (r.scrollW > r.clientW + 1) fail('responsive', `${w}px horizontal scroll (${r.scrollW} > ${r.clientW}) ${r.offenders.join('; ')}`)
  else if (r.offenders.length) warn('responsive', `${w}px unclipped overhang: ${r.offenders.join('; ')}`)
}
// A nav that wraps to three rows on a phone eats the fold. Two is the budget.
for (const w of [320, 375, 414]) {
  await page.setViewportSize({ width: w, height: 900 })
  await page.waitForTimeout(280)
  const navH = await page.evaluate(() => Math.round(document.querySelector('nav').getBoundingClientRect().height))
  if (navH > 130) fail('responsive', `${w}px nav is ${navH}px tall — wrapping to three rows`)
}
if (!fails.some((f) => f.startsWith('responsive'))) pass(`no horizontal scroll at ${WIDTHS.join(', ')}px, and the nav stays within two rows on a phone`)
await page.setViewportSize({ width: 1440, height: 940 })

/* 3 — interactions */
await load('catalogue')
await page.evaluate(() => localStorage.removeItem('tomato-crawl:route'))
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForSelector('article')

const addBtns = page.locator('article button[aria-pressed]')
await addBtns.first().click()
await page.waitForTimeout(250)
if ((await page.locator('article button[aria-pressed="true"]').count()) !== 1) fail('route', 'adding a stop did not set aria-pressed')

await addBtns.nth(1).click()
await addBtns.nth(2).click()
await page.waitForTimeout(350)
let count = await page.evaluate(() => JSON.parse(localStorage.getItem('tomato-crawl:route') || '[]').length)
if (count !== 3) fail('route', `expected 3 stops persisted, got ${count}`)

// reorder
const before = await page.evaluate(() => JSON.parse(localStorage.getItem('tomato-crawl:route')))
const down = page.locator('button[aria-label^="Move"][aria-label$="later"]').first()
if (await down.count()) {
  await down.click()
  await page.waitForTimeout(300)
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('tomato-crawl:route')))
  if (after[0] === before[0]) fail('route', 'move-later did not reorder the route')
} else fail('route', 'no reorder control found')

// remove
const rm = page.locator('button[aria-label^="Remove"]').first()
await rm.click()
await page.waitForTimeout(300)
count = await page.evaluate(() => JSON.parse(localStorage.getItem('tomato-crawl:route') || '[]').length)
if (count !== 2) fail('route', `remove left ${count} stops, expected 2`)

// persistence across reload
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForSelector('article')
await page.waitForTimeout(400)
if ((await page.locator('article button[aria-pressed="true"]').count()) !== 2)
  fail('route', 'route did not survive a reload')
else pass('route: add, reorder, remove and reload-persistence all work')

// toggling the same stop twice returns to empty state
const first = addBtns.first()
const wasOn = (await first.getAttribute('aria-pressed')) === 'true'
await first.click(); await page.waitForTimeout(200)
const nowOn = (await first.getAttribute('aria-pressed')) === 'true'
if (wasOn === nowOn) fail('route', 'toggling a stop did not flip its state')

/* filters */
await load('catalogue')
const total = await page.locator('article').count()
await page.getByRole('button', { name: 'Brooklyn', exact: true }).click()
await page.waitForTimeout(280)
const bk = await page.locator('article').count()
if (bk >= total || bk === 0) fail('filter', `Brooklyn filter returned ${bk} of ${total}`)
const allBk = await page.evaluate(() =>
  [...document.querySelectorAll('article')].every((a) => /Brooklyn/.test(a.textContent || '')))
if (!allBk) fail('filter', 'Brooklyn filter leaked a non-Brooklyn stop')

await page.getByRole('button', { name: 'All', exact: true }).click()
await page.waitForTimeout(250)
if ((await page.locator('article').count()) !== total) fail('filter', 'All did not restore every stop')

await page.getByRole('button', { name: 'Show held back' }).click()
await page.waitForTimeout(280)
if ((await page.locator('article').count()) <= total) fail('filter', 'held-back toggle did not add stops')
await page.getByRole('button', { name: 'Show held back' }).click()
await page.waitForTimeout(250)

/* search */
await page.locator('input[type="search"]').fill('bialy')
await page.waitForTimeout(400)
const hits = await page.locator('article').count()
if (hits !== 1) fail('search', `"bialy" matched ${hits} stops, expected 1`)
await page.locator('input[type="search"]').fill('zzzznothing')
await page.waitForTimeout(400)
if ((await page.locator('article').count()) !== 0) fail('search', 'no-match search still showed stops')
const empty = await page.locator('text=Nothing matches').count()
if (!empty) fail('search', 'no empty state shown for a no-match search')
await page.locator('input[type="search"]').fill('')
await page.waitForTimeout(350)
if ((await page.locator('article').count()) !== total) fail('search', 'clearing search did not restore stops')
if (!fails.some((f) => f.startsWith('filter') || f.startsWith('search')))
  pass('filters and search narrow, restore and show an empty state correctly')

/* sources disclosure */
await load('catalogue')
const srcToggle = page.locator('article button[aria-expanded]').first()
if ((await srcToggle.getAttribute('aria-expanded')) !== 'false') fail('a11y', 'sources toggle starts expanded')
await srcToggle.click(); await page.waitForTimeout(250)
if ((await srcToggle.getAttribute('aria-expanded')) !== 'true') fail('a11y', 'sources toggle did not set aria-expanded')
const quoted = await page.locator('article blockquote, article p').filter({ hasText: '“' }).count()
if (!quoted) warn('sources', 'no quoted caption visible after expanding')
await srcToggle.click(); await page.waitForTimeout(200)

/* day picker + closed warning */
await load('catalogue')
await page.evaluate(() =>
  localStorage.setItem('tomato-crawl:route', JSON.stringify(['hanis-sundae', 'elbow-bialy'])))
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForSelector('article'); await page.waitForTimeout(500)
await page.getByRole('button', { name: 'Thu', exact: true }).click()
await page.waitForTimeout(300)
const shutThu = await page.locator('text=/Shut on Thu/i').count()
if (!shutThu) fail('route', "Hani's window is Fri–Sun but no closed warning appeared for Thursday")
await page.getByRole('button', { name: 'Sat', exact: true }).click()
await page.waitForTimeout(300)
if ((await page.locator('text=/Shut on Sat/i').count()) > 0) fail('route', 'false closed warning on Saturday')
if (!fails.some((f) => f.includes('closed warning') || f.includes('false closed')))
  pass('day picker correctly flags stops that are shut on the chosen day')

/* map interaction */
await load('catalogue')
await page.waitForSelector('.leaflet-container', { timeout: 15000 })
await page.waitForTimeout(1200)
const markers = await page.locator('.leaflet-marker-icon').count()
if (markers < 10) fail('map', `only ${markers} markers rendered, expected 10+`)
const placeBtn = page.locator('article').first().locator('button').filter({ hasText: /,/ }).first()
if (await placeBtn.count()) {
  await placeBtn.click(); await page.waitForTimeout(900)
  const popup = await page.locator('.leaflet-popup').count()
  if (!popup) warn('map', 'clicking a neighbourhood did not open its map popup')
  else pass('map: markers render and the list drives the map')
} else warn('map', 'could not find the neighbourhood button on the first card')

/* transit API */
const api = await page.evaluate(async () => {
  const res = await fetch('/api/transit', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: ['hanis-sundae', 'elbow-bialy'] }),
  })
  return { status: res.status, body: await res.json().catch(() => null) }
})
if (api.status === 501) warn('api', 'GOOGLE_MAPS_API_KEY not set — falling back to estimates')
else if (api.status !== 200) fail('api', `/api/transit returned ${api.status}`)
else {
  const leg = api.body?.legs?.[0]
  if (!leg) fail('api', 'no legs returned for a valid pair')
  else {
    if (!(leg.totalMinutes > 0)) fail('api', 'leg has no positive duration')
    if (!leg.steps?.length) fail('api', 'leg has no steps')
    const walkRuns = (leg.steps || []).filter((s, i, a) => s.mode === 'WALK' && a[i - 1]?.mode === 'WALK')
    if (walkRuns.length) fail('api', 'consecutive walking steps were not collapsed')
    else pass(`transit API returns real legs (${leg.totalMinutes} min, ${leg.steps.length} steps, walks collapsed)`)
  }
}
expectingApiErrors = true
const apiBad = await page.evaluate(async () => {
  const one = await fetch('/api/transit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: ['hanis-sundae'] }) })
  const bogus = await fetch('/api/transit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: ['nope', 'nah'] }) })
  const flood = await fetch('/api/transit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: Array(40).fill('hanis-sundae') }) })
  return { one: one.status, bogus: bogus.status, flood: flood.status }
})
if (apiBad.one !== 200) fail('api', `single-stop request returned ${apiBad.one}, expected 200 with empty legs`)
if (apiBad.bogus !== 400) fail('api', `unknown stop id returned ${apiBad.bogus}, expected 400`)
if (apiBad.flood !== 400) fail('api', `40-stop request returned ${apiBad.flood}, expected 400`)
if (apiBad.one === 200 && apiBad.bogus === 400 && apiBad.flood === 400)
  pass('transit API rejects unknown ids and oversized requests')
expectingApiErrors = false

/* accessibility structure */
await load('catalogue')
const a11y = await page.evaluate(() => {
  const hs = [...document.querySelectorAll('h1,h2,h3,h4')].map((e) => +e.tagName[1])
  let skip = null
  for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) { skip = `${hs[i - 1]}→${hs[i]}`; break }
  const unnamed = [...document.querySelectorAll('button, a[href]')]
    .filter((e) => !e.closest('nextjs-portal') && !e.hasAttribute('data-next-mark'))
    .filter((e) => !(e.textContent || '').trim() && !e.getAttribute('aria-label') && !e.querySelector('title')).length
  const imgNoAlt = [...document.querySelectorAll('img')]
    .filter((i) => !i.closest('nextjs-portal'))
    .filter((i) => i.getAttribute('alt') === null).length
  const svgExposed = [...document.querySelectorAll('svg')].filter((s) => !s.closest('nextjs-portal'))
    .filter((s) => !s.closest('[aria-hidden="true"]') && !s.querySelector('title') && s.getAttribute('role') !== 'img')
    .map((s) => `${s.getAttribute('class') || '(no class)'} in ${s.parentElement?.tagName}.${String(s.parentElement?.className || '').slice(0, 28)}`)
  return { h1s: document.querySelectorAll('h1').length, skip, unnamed, imgNoAlt, svgExposed,
           landmarks: { nav: document.querySelectorAll('nav').length, main: document.querySelectorAll('main').length,
                        footer: document.querySelectorAll('footer').length } }
})
if (a11y.h1s !== 1) fail('a11y', `${a11y.h1s} h1 elements, expected exactly 1`)
if (a11y.skip) fail('a11y', `heading level skipped ${a11y.skip}`)
if (a11y.unnamed) fail('a11y', `${a11y.unnamed} interactive elements have no accessible name`)
if (a11y.imgNoAlt) fail('a11y', `${a11y.imgNoAlt} images missing an alt attribute`)
if (a11y.svgExposed.length) warn('a11y', `svg exposed without a title: ${a11y.svgExposed.join(' | ')}`)
if (a11y.landmarks.main !== 1) warn('a11y', `${a11y.landmarks.main} main landmarks`)
if (!a11y.skip && a11y.h1s === 1 && !a11y.unnamed && !a11y.imgNoAlt)
  pass('heading order, landmarks, accessible names and image alts are sound')

/* keyboard */
const kb = await page.evaluate(() => {
  const els = [...document.querySelectorAll('a[href],button,input,select,[tabindex]:not([tabindex="-1"])')]
    .filter((e) => e.getBoundingClientRect().width > 0 && !e.hasAttribute('disabled'))
    .filter((e) => !e.closest('nextjs-portal') && !e.hasAttribute('data-next-mark'))
  let noRing = 0
  const shows = (el) => {
    const cs = getComputedStyle(el)
    return (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none'
  }
  for (const e of els) {
    e.focus()
    // A ring drawn on a wrapper (a search pill, say) is still a visible ring.
    let n = e, ok = false
    for (let i = 0; n && i < 3; i++, n = n.parentElement) if (shows(n)) { ok = true; break }
    if (!ok) noRing++
  }
  document.activeElement?.blur()
  return { total: els.length, noRing, firstIsSkip: /skip/i.test((els[0]?.textContent || '')) }
})
await page.keyboard.press('Tab')
if (kb.noRing > 0) fail('a11y', `${kb.noRing} of ${kb.total} focusable elements show no focus indicator`)
if (!kb.firstIsSkip) warn('a11y', 'first tab stop is not the skip link')
if (!kb.noRing) pass(`all ${kb.total} focusable elements keep a visible focus ring`)

/* escape closes the style menu */
await load('catalogue')
await page.locator(`button[aria-haspopup="menu"]${NOT_DEVTOOLS}`).click()
await page.waitForTimeout(250)
if (!(await page.locator('[role="menu"]').count())) fail('ui', 'style menu did not open')
await page.keyboard.press('Escape')
await page.waitForTimeout(250)
if (await page.locator('[role="menu"]').count()) fail('ui', 'Escape did not close the style menu')
else pass('style menu opens and closes on Escape')

/* switching style through the UI persists */
await page.locator(`button[aria-haspopup="menu"]${NOT_DEVTOOLS}`).click()
await page.waitForTimeout(250)
await page.locator('[role="menuitemradio"]').filter({ hasText: 'Transit' }).click()
await page.waitForTimeout(350)
const applied = await page.evaluate(() => ({
  attr: document.documentElement.getAttribute('data-style'),
  stored: localStorage.getItem('tomato-crawl:style'),
}))
if (applied.attr !== 'transit' || applied.stored !== 'transit')
  fail('ui', `style switch applied=${applied.attr} stored=${applied.stored}`)
else pass('style switcher applies and persists the chosen style')

/* reduced motion */
const rm2 = await ctx.newPage()
await rm2.emulateMedia({ reducedMotion: 'reduce' })
await rm2.goto(BASE, { waitUntil: 'domcontentloaded' })
await rm2.waitForSelector('article')
const longAnim = await rm2.evaluate(() =>
  [...document.querySelectorAll('body *')].filter((e) => {
    if (e.closest('nextjs-portal')) return false
    const cs = getComputedStyle(e)
    return parseFloat(cs.transitionDuration) > 0.05 || parseFloat(cs.animationDuration) > 0.05
  }).length)
if (longAnim > 0) fail('a11y', `${longAnim} elements still animate under prefers-reduced-motion`)
else pass('prefers-reduced-motion collapses every transition')
await rm2.close()

/* console */
if (consoleErrors.length) for (const e of [...new Set(consoleErrors)].slice(0, 5)) fail('console', e)
else pass('no console errors or uncaught exceptions across the whole run')

await browser.close()

/* --- report ---------------------------------------------------------------- */
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
console.log(`\n  ${'─'.repeat(58)}\n  Audit clean. ${passes.length} checks passed, ${warns.length} warnings.\n`)
