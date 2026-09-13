'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { STOPS, HELD_BACK, ALL_STOPS, type Stop, type Weekday, type Borough } from '@/data/stops'
import { ROUTE_KEY } from '@/lib/styles'
import { weekdayOf, isOpenOn } from '@/lib/schedule'
import { NavBar } from '@/components/NavBar/NavBar'
import { Hero } from '@/components/Hero/Hero'
import { StopEntry } from '@/components/StopEntry/StopEntry'
import { RouteTicket } from '@/components/RouteTicket/RouteTicket'
import { PlanPromo, SeasonPromo } from '@/components/Promo/Promo'
import { SiteFooter } from '@/components/SiteFooter/SiteFooter'
import styles from './page.module.css'

const MapView = dynamic(() => import('@/components/MapView/MapView'), {
  ssr: false,
  loading: () => <div className={styles.mapSkeleton} aria-hidden="true" />,
})

type View = 'stops' | 'map' | 'route'
type BoroughFilter = 'all' | Borough

const LAST_CHECKED = ALL_STOPS.map((s) => s.verifiedOn).sort().reverse()[0]

/** Matches the venue, the item, the neighbourhood — the three things people search by. */
function matches(stop: Stop, q: string): boolean {
  if (!q) return true
  const hay = `${stop.venue} ${stop.item} ${stop.neighborhood} ${stop.borough}`.toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => hay.includes(term))
}

export default function Page() {
  const [routeIds, setRouteIds] = useState<string[]>([])
  const [view, setView] = useState<View>('stops')
  const [day, setDay] = useState<Weekday>(() => weekdayOf(new Date()))
  const [borough, setBorough] = useState<BoroughFilter>('all')
  const [openOnly, setOpenOnly] = useState(false)
  const [showHeld, setShowHeld] = useState(false)
  const [query, setQuery] = useState('')
  const [focusId, setFocusId] = useState<string | undefined>()
  const [hydrated, setHydrated] = useState(false)
  const routeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ROUTE_KEY)
      if (raw) {
        const ids = JSON.parse(raw)
        if (Array.isArray(ids)) {
          setRouteIds(ids.filter((id) => typeof id === 'string' && ALL_STOPS.some((s) => s.id === id)))
        }
      }
    } catch {
      /* no saved route, or storage unavailable */
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(ROUTE_KEY, JSON.stringify(routeIds))
    } catch {
      /* the route just will not survive a reload */
    }
  }, [routeIds, hydrated])

  const visible = useMemo(() => {
    const pool: Stop[] = showHeld ? [...STOPS, ...HELD_BACK] : STOPS
    return pool.filter((s) => {
      if (borough !== 'all' && s.borough !== borough) return false
      if (openOnly && !isOpenOn(s, day)) return false
      return matches(s, query)
    })
  }, [borough, openOnly, day, showHeld, query])

  const route = useMemo(
    () => routeIds.map((id) => ALL_STOPS.find((s) => s.id === id)).filter((s): s is Stop => Boolean(s)),
    [routeIds],
  )

  const toggle = useCallback((id: string) => {
    setRouteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const move = useCallback((id: string, dir: -1 | 1) => {
    setRouteIds((prev) => {
      const i = prev.indexOf(id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }, [])

  const focus = useCallback((id: string) => {
    setFocusId(id)
    if (window.matchMedia('(max-width: 1059px)').matches) setView('map')
  }, [])

  const goToRoute = useCallback(() => {
    if (window.matchMedia('(max-width: 1059px)').matches) {
      setView('route')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      routeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  const mapStops = showHeld ? ALL_STOPS : STOPS

  return (
    <>
      <a className="skipLink" href="#stops">
        Skip to stops
      </a>

      <NavBar query={query} onQuery={setQuery} routeCount={route.length} onPlan={goToRoute} />
      <Hero shipping={STOPS.length} held={HELD_BACK.length} lastChecked={LAST_CHECKED} />

      <nav className={styles.tabs} aria-label="View">
        {(['stops', 'map', 'route'] as View[]).map((v) => (
          <button
            key={v}
            type="button"
            className={styles.tab}
            data-on={view === v || undefined}
            onClick={() => setView(v)}
            aria-pressed={view === v}
          >
            {v}
            {v === 'route' && route.length > 0 ? <span className={styles.tabCount}>{route.length}</span> : null}
          </button>
        ))}
      </nav>

      <main className={styles.main} data-view={view}>
        <section className={styles.listPane} id="stops" aria-labelledby="stops-heading">
          <h2 id="stops-heading" className="srOnly">
            Stops
          </h2>

          <div className={styles.filters}>
            <div className={styles.filterRow} role="group" aria-label="Borough">
              {(['all', 'Manhattan', 'Brooklyn'] as BoroughFilter[]).map((b) => (
                <button
                  key={b}
                  type="button"
                  className={styles.chip}
                  data-on={borough === b || undefined}
                  onClick={() => setBorough(b)}
                  aria-pressed={borough === b}
                >
                  {b === 'all' ? 'All' : b}
                </button>
              ))}
              <button
                type="button"
                className={styles.chip}
                data-on={openOnly || undefined}
                onClick={() => setOpenOnly((v) => !v)}
                aria-pressed={openOnly}
              >
                Open that day
              </button>
              <button
                type="button"
                className={styles.chip}
                data-on={showHeld || undefined}
                onClick={() => setShowHeld((v) => !v)}
                aria-pressed={showHeld}
              >
                Show held back
              </button>
            </div>
          </div>

          <div className={styles.countRow}>
            <p className={styles.count} aria-live="polite">
              <span className="tabularNums">{visible.length}</span>{' '}
              {visible.length === 1 ? 'delicious stop' : 'delicious stops'}
            </p>
            <p className={styles.countScript} aria-hidden="true">
              Good things are in season
            </p>
          </div>

          <div className={styles.entries}>
            <span className={styles.spine} aria-hidden="true" />
            {visible.map((stop, i) => (
              <StopEntry
                key={stop.id}
                stop={stop}
                index={i}
                inRoute={routeIds.includes(stop.id)}
                onToggle={toggle}
                onFocus={focus}
                highlighted={focusId === stop.id}
              />
            ))}
            {visible.length === 0 ? (
              <p className={styles.none}>
                Nothing matches{query ? ` “${query}”` : ''}. Try another day, or widen the borough.
              </p>
            ) : null}
          </div>

          <footer className={styles.colophon}>
            <p>
              Every line above was read off a menu or a post the venue itself controls. Where a price or an opening
              time is missing, it is missing because no source stated it — not because it was trimmed for tidiness.
            </p>
          </footer>
        </section>

        <div className={styles.sidePane}>
          <div className={styles.mapWrap}>
            <MapView stops={mapStops} routeIds={routeIds} focusId={focusId} onSelect={focus} />
          </div>
          <PlanPromo onPlan={goToRoute} count={route.length} />
          <div ref={routeRef}>
            <RouteTicket
              route={route}
              day={day}
              onDayChange={setDay}
              onMove={move}
              onRemove={toggle}
              onReorder={setRouteIds}
              onFocus={focus}
            />
          </div>
          <SeasonPromo />
        </div>
      </main>

      <SiteFooter lastChecked={LAST_CHECKED} />
    </>
  )
}
