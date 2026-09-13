'use client'

import type { Stop, Weekday } from '@/data/stops'
import { WEEK } from '@/data/stops'
import { buildItinerary, suggestOrder, formatDuration, googleTransitUrl, googleFullRouteUrl } from '@/lib/itinerary'
import { isOpenOn, hoursOn, prettyHoursShort, WEEKDAY_LABEL } from '@/lib/schedule'
import { useTransitLegs, legKey } from '@/lib/useTransitLegs'
import { Walk, Train, ArrowUp, ArrowDown, Minus, External, Flag, Clock } from '@/components/tomato/Glyphs'
import styles from './RouteTicket.module.css'

interface Props {
  route: Stop[]
  day: Weekday
  onDayChange: (d: Weekday) => void
  onMove: (id: string, dir: -1 | 1) => void
  onRemove: (id: string) => void
  onReorder: (ids: string[]) => void
  onFocus: (id: string) => void
}

export function RouteTicket({ route, day, onDayChange, onMove, onRemove, onReorder, onFocus }: Props) {
  const itinerary = buildItinerary(route)
  const closed = route.filter((s) => !isOpenOn(s, day))
  const fullRoute = googleFullRouteUrl(route)
  const transit = useTransitLegs(route.map((s) => s.id))

  // Real routed minutes replace the straight-line estimate wherever we have them.
  const routedTotal =
    transit.status === 'ready'
      ? itinerary.legs.reduce(
          (n, l) => n + (transit.legs[legKey(l.from.id, l.to.id)]?.totalMinutes ?? l.walkMinutes),
          0,
        )
      : null
  const travelMinutes = routedTotal ?? itinerary.travelMinutes
  const totalMinutes = travelMinutes + itinerary.dwellMinutes

  return (
    <section id="route-ticket" className={styles.ticket} aria-labelledby="route-heading">
      <span className={styles.perf} aria-hidden="true" />

      <header className={styles.head}>
        <h2 id="route-heading" className={styles.heading}>
          Your route
        </h2>
        <p className={styles.count}>{route.length === 0 ? 'empty' : `${route.length} stops`}</p>
      </header>

      <div className={styles.days} role="group" aria-label="Day of the week">
        {WEEK.map((d) => (
          <button
            key={d}
            type="button"
            className={styles.day}
            data-on={d === day || undefined}
            onClick={() => onDayChange(d)}
            aria-pressed={d === day}
          >
            {WEEKDAY_LABEL[d]}
          </button>
        ))}
      </div>

      {route.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyLead}>No stops yet</p>
          <p className={styles.emptyBody}>
            Add a few and they queue up here with walking times, a closed-today warning, and a hand-off to transit
            directions.
          </p>
        </div>
      ) : (
        <>
          {closed.length > 0 ? (
            <p className={styles.warning}>
              <Flag size={15} label="Warning" />
              <span>
                Shut on {WEEKDAY_LABEL[day]}: {closed.map((s) => s.venue).join(', ')}
              </span>
            </p>
          ) : null}

          <ol className={styles.list}>
            {route.map((stop, i) => {
              const leg = itinerary.legs[i]
              const open = isOpenOn(stop, day)
              const h = hoursOn(stop, day)
              return (
                <li key={stop.id} className={styles.row}>
                  <div className={styles.stop} data-shut={!open || undefined}>
                    <span className={styles.bullet} aria-hidden="true">
                      {i + 1}
                    </span>

                    <div className={styles.stopText}>
                      <button type="button" className={styles.stopName} onClick={() => onFocus(stop.id)}>
                        {stop.item}
                      </button>
                      <p className={styles.stopVenue}>
                        {stop.venue} · {stop.neighborhood}
                      </p>
                      <p className={styles.stopWhen}>
                        <Clock size={13} />
                        <span className={styles.whenText}>
                          {open && h ? (
                            <span className="tabularNums">{prettyHoursShort(h)}</span>
                          ) : (
                            <span className={styles.shut}>Shut {WEEKDAY_LABEL[day]}</span>
                          )}
                          <span className={styles.dwell}>{stop.dwellMinutes} min here</span>
                        </span>
                      </p>
                    </div>

                    <div className={styles.ctls}>
                      <button
                        type="button"
                        className={styles.ctl}
                        onClick={() => onMove(stop.id, -1)}
                        disabled={i === 0}
                        aria-label={`Move ${stop.item} earlier`}
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        className={styles.ctl}
                        onClick={() => onMove(stop.id, 1)}
                        disabled={i === route.length - 1}
                        aria-label={`Move ${stop.item} later`}
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        type="button"
                        className={styles.ctl}
                        data-danger="true"
                        onClick={() => onRemove(stop.id)}
                        aria-label={`Remove ${stop.item} from route`}
                      >
                        <Minus size={15} />
                      </button>
                    </div>
                  </div>

                  {leg ? (
                    (() => {
                      const routed = transit.status === 'ready' ? transit.legs[legKey(leg.from.id, leg.to.id)] : undefined
                      return (
                        <div className={styles.leg}>
                          <span className={styles.legIcon}>
                            {routed
                              ? routed.steps.some((s) => s.mode === 'TRANSIT')
                                ? <Train size={15} />
                                : <Walk size={15} />
                              : leg.walkable
                                ? <Walk size={15} />
                                : <Train size={15} />}
                          </span>

                          <span className={styles.legBody}>
                            <span className={styles.legText}>
                              {routed ? (
                                <>
                                  <strong className="tabularNums">{routed.totalMinutes} min</strong> door to door
                                </>
                              ) : leg.walkable ? (
                                <>
                                  <strong className="tabularNums">{leg.walkMinutes} min</strong> on foot
                                </>
                              ) : (
                                <>
                                  Take the train — <strong className="tabularNums">{leg.walkMinutes} min</strong> walking
                                </>
                              )}
                              {routed ? null : (
                                <span className={styles.est}>
                                  {transit.status === 'loading' ? 'checking…' : 'est'}
                                </span>
                              )}
                            </span>

                            {/* Real steps, once the Routes API has answered. */}
                            {routed && routed.steps.length ? (
                              <ol className={styles.steps}>
                                {routed.steps.map((s, si) => (
                                  <li key={si} className={styles.step} data-mode={s.mode.toLowerCase()}>
                                    {s.mode === 'TRANSIT' ? (
                                      <>
                                        <span className={styles.line}>{s.line ?? 'Train'}</span>
                                        <span className={styles.stepText}>
                                          {s.departureStop} → {s.arrivalStop}
                                          {s.headsign ? <span className={styles.headsign}>toward {s.headsign}</span> : null}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <span className={styles.walkDot} aria-hidden="true" />
                                        <span className={styles.stepText}>Walk</span>
                                      </>
                                    )}
                                    <span className={`${styles.stepMin} tabularNums`}>{s.minutes}m</span>
                                  </li>
                                ))}
                              </ol>
                            ) : null}
                          </span>

                          <a
                            className={styles.dirs}
                            href={googleTransitUrl(leg.from, leg.to)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open
                            <External size={12} />
                            <span className="srOnly">
                              directions from {leg.from.venue} to {leg.to.venue}, opens Google Maps in a new tab
                            </span>
                          </a>
                        </div>
                      )
                    })()
                  ) : null}
                </li>
              )
            })}
          </ol>

          <dl className={styles.totals}>
            <div>
              <dt>{routedTotal === null ? 'On foot' : 'Travel'}</dt>
              <dd className="tabularNums">{formatDuration(travelMinutes)}</dd>
            </div>
            <div>
              <dt>At counters</dt>
              <dd className="tabularNums">{formatDuration(itinerary.dwellMinutes)}</dd>
            </div>
            <div className={styles.grand}>
              <dt>Total</dt>
              <dd className="tabularNums">{formatDuration(totalMinutes)}</dd>
            </div>
          </dl>

          <div className={styles.actions}>
            {route.length > 2 ? (
              <button
                type="button"
                className={styles.secondary}
                onClick={() => onReorder(suggestOrder(route).map((s) => s.id))}
              >
                Sort by proximity
              </button>
            ) : null}
            {fullRoute ? (
              <a className={styles.primary} href={fullRoute} target="_blank" rel="noopener noreferrer">
                Open in Google Maps
                <External size={14} />
              </a>
            ) : null}
          </div>

          <p className={styles.fineprint}>
            {transit.status === 'ready'
              ? 'Transit legs are live from Google, using a typical departure. Check the app before you leave — weekend service changes are not reflected here.'
              : transit.status === 'unconfigured'
                ? 'Walking times are straight-line estimates. Add a Google key to get real subway legs; the links below already work.'
                : transit.status === 'error'
                  ? 'Could not reach the routing service, so these are straight-line estimates. The links still work.'
                  : 'Walking times are straight-line estimates with a detour factor, not routed directions.'}
          </p>
        </>
      )}
    </section>
  )
}
