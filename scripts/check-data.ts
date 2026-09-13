/**
 * Runs inside `npm run build`. A stop missing `verifiedOn` or a venue-owned
 * source fails it. That is the point — a fabricated stop should break the
 * build, not reach someone standing on a corner in Greenpoint.
 */
import { STOPS, HELD_BACK, ALL_STOPS, type Stop } from '../data/stops'

const problems: string[] = []
const warnings: string[] = []

const ISO = /^\d{4}-\d{2}-\d{2}$/

function check(stop: Stop, shipping: boolean) {
  const at = `${stop.id} (${stop.venue})`

  if (!ISO.test(stop.verifiedOn)) problems.push(`${at}: verifiedOn is missing or not an ISO date`)
  if (stop.sources.length === 0) problems.push(`${at}: no sources at all`)
  for (const s of stop.sources) {
    if (!/^https?:\/\//.test(s.url)) problems.push(`${at}: source url is not a URL — ${s.url}`)
  }

  const venueOwned = stop.sources.some((s) => s.kind === 'menu' || s.kind === 'instagram')

  if (shipping) {
    if (stop.status !== 'confirmed') problems.push(`${at}: ships but its status is "${stop.status}"`)
    if (!venueOwned) problems.push(`${at}: ships on press alone, which the rules cap at "likely"`)
    if (!stop.sources.some((s) => s.quote)) {
      problems.push(`${at}: ships without a single verbatim quote`)
    }
  } else {
    if (stop.status === 'confirmed') problems.push(`${at}: held back, yet marked confirmed`)
    if (!stop.caveat) problems.push(`${at}: held back without a visible caveat`)
  }

  if (!Number.isFinite(stop.coords[0]) || !Number.isFinite(stop.coords[1])) {
    problems.push(`${at}: coordinates are not numbers`)
  }
  // Rough NYC envelope — catches a transposed lat/lng, which is easy to do by hand.
  const [lat, lng] = stop.coords
  if (lat < 40.4 || lat > 41.0 || lng < -74.3 || lng > -73.6) {
    problems.push(`${at}: coordinates are outside New York City — ${lat}, ${lng}`)
  }

  if (stop.hours.length === 0) problems.push(`${at}: no hours recorded`)
  if (stop.price !== undefined && !(stop.price > 0)) problems.push(`${at}: price is not a positive number`)

  // Dairy and egg are not part of the rule, so their being unknown is not a gap.
  if (stop.diet.fish === 'unknown') {
    warnings.push(`${at}: fish is unconfirmed — anchovy is the one to rule out`)
  }
}

STOPS.forEach((s) => check(s, true))
HELD_BACK.forEach((s) => check(s, false))

const ids = ALL_STOPS.map((s) => s.id)
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i)
if (dupes.length) problems.push(`duplicate stop ids: ${[...new Set(dupes)].join(', ')}`)

if (warnings.length) {
  console.log(`\n  ${warnings.length} thing(s) worth chasing, not blocking:`)
  warnings.forEach((w) => console.log(`    - ${w}`))
}

if (problems.length) {
  console.error(`\n  check-data failed with ${problems.length} problem(s):\n`)
  problems.forEach((p) => console.error(`    x ${p}`))
  console.error('')
  process.exit(1)
}

console.log(`\n  check-data passed. ${STOPS.length} shipping, ${HELD_BACK.length} held back.\n`)
