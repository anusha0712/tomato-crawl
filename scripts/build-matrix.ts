/**
 * Generates data/matrix.json — pairwise walking estimates between every stop.
 *
 * Generated file. Do not hand-edit it; regenerate with `npm run matrix`.
 *
 * This used to need a Mapbox token. It no longer does: the estimate is a
 * great-circle distance with a street-detour factor, which is honest about
 * being an estimate. Real routed timings come from the Google Directions
 * hand-off in the UI.
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ALL_STOPS } from '../data/stops'
import { haversine, walkMinutes } from '../lib/geo'

interface Cell { meters: number; walkMinutes: number }

const matrix: Record<string, Record<string, Cell>> = {}

for (const a of ALL_STOPS) {
  matrix[a.id] = {}
  for (const b of ALL_STOPS) {
    if (a.id === b.id) continue
    matrix[a.id][b.id] = {
      meters: Math.round(haversine(a.coords, b.coords)),
      walkMinutes: walkMinutes(a.coords, b.coords),
    }
  }
}

const out = {
  generatedBy: 'scripts/build-matrix.ts',
  generatedOn: new Date().toISOString().slice(0, 10),
  method: 'great-circle distance x 1.25 detour factor, 80 m/min walking pace',
  stops: ALL_STOPS.length,
  matrix,
}

const path = join(process.cwd(), 'data', 'matrix.json')
writeFileSync(path, JSON.stringify(out, null, 2) + '\n')
console.log(`  wrote ${path} — ${ALL_STOPS.length} stops`)
