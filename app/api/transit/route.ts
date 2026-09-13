import { NextResponse } from 'next/server'
import { ALL_STOPS } from '@/data/stops'

/**
 * Real transit legs, computed server-side.
 *
 * The key never reaches the browser: it is read from process.env here and the
 * client only ever sees the resulting legs. That is why the variable is
 * GOOGLE_MAPS_API_KEY and not NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — see CLAUDE.md.
 *
 * The client sends stop IDs rather than coordinates, and we look the coordinates
 * up from our own data. That keeps this endpoint from being a free
 * routing proxy for arbitrary lat/lngs.
 */

const ROUTES_ENDPOINT = 'https://routes.googleapis.com/directions/v2:computeRoutes'

export interface TransitStepOut {
  mode: 'WALK' | 'TRANSIT'
  minutes: number
  instruction: string
  /** Subway line short name, e.g. "6" or "L". Present on transit steps. */
  line?: string
  /** Line colour Google reports, used only as a hint; the UI keeps its own palette. */
  lineColor?: string
  headsign?: string
  departureStop?: string
  arrivalStop?: string
}

export interface TransitLegOut {
  fromId: string
  toId: string
  totalMinutes: number
  steps: TransitStepOut[]
}

interface GoogleStep {
  staticDuration?: string
  travelMode?: string
  navigationInstruction?: { instructions?: string }
  transitDetails?: {
    stopDetails?: {
      departureStop?: { name?: string }
      arrivalStop?: { name?: string }
    }
    headsign?: string
    transitLine?: { nameShort?: string; name?: string; color?: string }
  }
}

function seconds(v?: string): number {
  if (!v) return 0
  const n = Number.parseFloat(v.replace(/s$/, ''))
  return Number.isFinite(n) ? n : 0
}

export async function POST(request: Request) {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) {
    return NextResponse.json(
      { error: 'not-configured', message: 'GOOGLE_MAPS_API_KEY is not set. The deep links still work.' },
      { status: 501 },
    )
  }

  let ids: string[]
  try {
    const body = await request.json()
    ids = Array.isArray(body?.ids) ? body.ids.filter((v: unknown) => typeof v === 'string') : []
  } catch {
    return NextResponse.json({ error: 'bad-request' }, { status: 400 })
  }

  if (ids.length < 2) {
    return NextResponse.json({ legs: [] })
  }
  // A crawl is a handful of stops. Cap it so a bad request cannot fan out.
  if (ids.length > 12) {
    return NextResponse.json({ error: 'too-many-stops' }, { status: 400 })
  }

  const stops = ids.map((id) => ALL_STOPS.find((s) => s.id === id))
  if (stops.some((s) => !s)) {
    return NextResponse.json({ error: 'unknown-stop' }, { status: 400 })
  }

  const legs: TransitLegOut[] = []

  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i]!
    const to = stops[i + 1]!

    try {
      const res = await fetch(ROUTES_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': [
            'routes.duration',
            'routes.legs.steps.staticDuration',
            'routes.legs.steps.travelMode',
            'routes.legs.steps.navigationInstruction.instructions',
            'routes.legs.steps.transitDetails',
          ].join(','),
        },
        body: JSON.stringify({
          origin: { location: { latLng: { latitude: from.coords[0], longitude: from.coords[1] } } },
          destination: { location: { latLng: { latitude: to.coords[0], longitude: to.coords[1] } } },
          travelMode: 'TRANSIT',
          computeAlternativeRoutes: false,
          languageCode: 'en-US',
          units: 'IMPERIAL',
        }),
        // Legs between fixed venues change slowly; let the platform cache them.
        next: { revalidate: 3600 },
      })

      if (!res.ok) {
        const detail = await res.text()
        console.error(`Routes API ${res.status} for ${from.id}->${to.id}: ${detail.slice(0, 300)}`)
        continue
      }

      const data = await res.json()
      const route = data?.routes?.[0]
      if (!route) continue

      const rawSteps: GoogleStep[] = route.legs?.[0]?.steps ?? []
      const steps: TransitStepOut[] = rawSteps
        .map((s): TransitStepOut | null => {
          const minutes = Math.round(seconds(s.staticDuration) / 60)
          if (s.travelMode === 'TRANSIT') {
            const line = s.transitDetails?.transitLine
            return {
              mode: 'TRANSIT',
              minutes,
              instruction: s.navigationInstruction?.instructions ?? '',
              line: line?.nameShort ?? line?.name,
              lineColor: line?.color,
              headsign: s.transitDetails?.headsign,
              departureStop: s.transitDetails?.stopDetails?.departureStop?.name,
              arrivalStop: s.transitDetails?.stopDetails?.arrivalStop?.name,
            }
          }
          // Google emits a lot of one-minute walking fragments; they are noise here.
          if (minutes < 1) return null
          return {
            mode: 'WALK',
            minutes,
            instruction: s.navigationInstruction?.instructions ?? 'Walk',
          }
        })
        .filter((s): s is TransitStepOut => s !== null)
        // Google returns walking turn by turn — "head southwest", "continue onto
        // Bowery", "turn left". On a phone that is four rows saying "Walk". Fold
        // consecutive walks into one leg with the total.
        .reduce<TransitStepOut[]>((acc, step) => {
          const prev = acc[acc.length - 1]
          if (step.mode === 'WALK' && prev?.mode === 'WALK') {
            prev.minutes += step.minutes
            return acc
          }
          acc.push({ ...step })
          return acc
        }, [])

      legs.push({
        fromId: from.id,
        toId: to.id,
        totalMinutes: Math.round(seconds(route.duration) / 60),
        steps,
      })
    } catch (err) {
      console.error(`Routes API request failed for ${from.id}->${to.id}`, err)
    }
  }

  return NextResponse.json({ legs })
}
