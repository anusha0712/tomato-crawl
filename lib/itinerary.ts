import type { Stop, Weekday } from '@/data/stops'
import { walkMinutes, legIsWalkable } from './geo'
import { hoursOn } from './schedule'

export interface Leg {
  from: Stop
  to: Stop
  /** Estimated walking minutes. Replaced by a real transit leg when the API is wired up. */
  walkMinutes: number
  walkable: boolean
}

export interface Itinerary {
  stops: Stop[]
  legs: Leg[]
  /** Dwell time plus travel, in minutes. */
  totalMinutes: number
  travelMinutes: number
  dwellMinutes: number
}

export function buildLegs(stops: Stop[]): Leg[] {
  const legs: Leg[] = []
  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i]
    const to = stops[i + 1]
    legs.push({ from, to, walkMinutes: walkMinutes(from.coords, to.coords), walkable: legIsWalkable(from, to) })
  }
  return legs
}

export function buildItinerary(stops: Stop[]): Itinerary {
  const legs = buildLegs(stops)
  const travelMinutes = legs.reduce((n, l) => n + l.walkMinutes, 0)
  const dwellMinutes = stops.reduce((n, s) => n + s.dwellMinutes, 0)
  return { stops, legs, travelMinutes, dwellMinutes, totalMinutes: travelMinutes + dwellMinutes }
}

/**
 * Nearest-neighbour ordering from whichever stop is furthest north. Not optimal,
 * but a crawl of eight stops does not need a travelling-salesman solver, and a
 * predictable order is easier to argue with than a clever one.
 */
export function suggestOrder(stops: Stop[]): Stop[] {
  if (stops.length < 3) return stops
  const remaining = [...stops]
  remaining.sort((a, b) => b.coords[0] - a.coords[0])
  const ordered: Stop[] = [remaining.shift()!]
  while (remaining.length) {
    const last = ordered[ordered.length - 1]
    let bestIdx = 0
    let best = Infinity
    remaining.forEach((s, i) => {
      const d = walkMinutes(last.coords, s.coords)
      if (d < best) { best = d; bestIdx = i }
    })
    ordered.push(remaining.splice(bestIdx, 1)[0])
  }
  return ordered
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

/**
 * Hands the leg to Google Maps in transit mode. A deep link needs no API key and
 * opens in whatever Maps app the person already has.
 */
export function googleTransitUrl(from: Stop, to: Stop): string {
  const p = new URLSearchParams({
    api: '1',
    origin: from.coords.join(','),
    destination: to.coords.join(','),
    travelmode: 'transit',
  })
  return `https://www.google.com/maps/dir/?${p.toString()}`
}

/** The whole crawl as one Google Maps route, origin to destination via the rest. */
export function googleFullRouteUrl(stops: Stop[]): string | undefined {
  if (stops.length < 2) return undefined
  const p = new URLSearchParams({
    api: '1',
    origin: stops[0].coords.join(','),
    destination: stops[stops.length - 1].coords.join(','),
    travelmode: 'transit',
  })
  const via = stops.slice(1, -1)
  if (via.length) p.set('waypoints', via.map((s) => s.coords.join(',')).join('|'))
  return `https://www.google.com/maps/dir/?${p.toString()}`
}

/* --- Scheduling ------------------------------------------------------------ */

/**
 * Running the clock over a route.
 *
 * Knowing a stop is open on Tuesday is not the same as being able to reach it
 * while it is open. A Birdee-first crawl puts you outside Unnecessary at 9am,
 * six hours before it opens — every stop "open on Tuesday", the itinerary
 * unwalkable. This works out when you would actually arrive.
 */
export interface ScheduledStop {
  stop: Stop
  /** Minutes past midnight when you would arrive. */
  arriveAt: number
  /** Minutes spent waiting for the door to open. */
  waitMinutes: number
  /** True when you would arrive after it has shut for the day. */
  afterClosing: boolean
  /** True when the venue never stated hours for this day. */
  unknownHours: boolean
}

export interface Schedule {
  startAt: number
  endAt: number
  stops: ScheduledStop[]
  conflicts: number
}

function toMinutes(hhmm?: string): number | null {
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map(Number)
  return Number.isFinite(h) ? h * 60 + (m || 0) : null
}

export function formatClock(mins: number): string {
  const h24 = Math.floor(mins / 60) % 24
  const m = mins % 60
  const suffix = h24 >= 12 ? 'pm' : 'am'
  const h = h24 % 12 === 0 ? 12 : h24 % 12
  return m === 0 ? `${h}${suffix}` : `${h}:${String(m).padStart(2, '0')}${suffix}`
}

/**
 * @param travelFor minutes between consecutive stops — routed times when the
 *        Directions API has answered, the walking estimate otherwise.
 */
export function scheduleRoute(
  stops: Stop[],
  day: Weekday,
  travelFor: (from: Stop, to: Stop) => number,
  startAt?: number,
): Schedule {
  const first = stops[0] ? hoursOn(stops[0], day) : undefined
  // Default to the first stop's opening time, or 10am when it never stated one.
  let clock = startAt ?? toMinutes(first?.opens) ?? 10 * 60
  const begin = clock
  const out: ScheduledStop[] = []
  let conflicts = 0

  stops.forEach((stop, i) => {
    const h = hoursOn(stop, day)
    const opens = toMinutes(h?.opens)
    const closes = toMinutes(h?.closes)
    let wait = 0
    let afterClosing = false

    if (opens != null && clock < opens) {
      wait = opens - clock
      clock = opens
    }
    if (closes != null && clock > closes) {
      afterClosing = true
    }
    if (wait > 20 || afterClosing) conflicts++

    out.push({
      stop,
      arriveAt: clock,
      waitMinutes: wait,
      afterClosing,
      unknownHours: !h || (opens == null && closes == null),
    })

    clock += stop.dwellMinutes
    const next = stops[i + 1]
    if (next) clock += travelFor(stop, next)
  })

  return { startAt: begin, endAt: clock, stops: out, conflicts }
}
