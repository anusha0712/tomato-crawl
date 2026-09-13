import type { Stop } from '@/data/stops'

const EARTH_RADIUS_M = 6_371_000

/** Great-circle distance in metres. */
export function haversine(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const [lat1, lon1] = a
  const [lat2, lon2] = b
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(s))
}

/**
 * Streets are not straight lines. 1.25 is the usual detour factor for a
 * gridded city, and 80 m/min is an unhurried walking pace.
 *
 * This is an ESTIMATE and the UI labels it as one. Real transit legs come from
 * the Directions API once a key is configured.
 */
export function walkMinutes(a: [number, number], b: [number, number]): number {
  return Math.round((haversine(a, b) * 1.25) / 80)
}

/** Straight-line kilometres, for the "is this even the same trip" sanity check. */
export function km(a: [number, number], b: [number, number]): number {
  return haversine(a, b) / 1000
}

/**
 * Anything past this is a subway ride, not a walk, and the UI should say so
 * rather than quietly claiming a 90-minute stroll.
 */
export const WALKABLE_MAX_MIN = 25

export function legIsWalkable(a: Stop, b: Stop): boolean {
  return walkMinutes(a.coords, b.coords) <= WALKABLE_MAX_MIN
}
