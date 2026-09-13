'use client'

import { useState } from 'react'
import type { Stop } from '@/data/stops'
import { prettyDays, prettyHours, endsSoon, hasEnded } from '@/lib/schedule'
import { varietyOf, VARIETY_LABEL, BINOMIAL } from '@/lib/variety'
import { Art } from '@/components/tomato/Art'
import { Plus, Check } from '@/components/tomato/Glyphs'
import styles from './StopEntry.module.css'

interface Props {
  stop: Stop
  index: number
  inRoute: boolean
  onToggle: (id: string) => void
  onFocus?: (id: string) => void
  highlighted?: boolean
}

function dietPills(stop: Stop): { label: string; unsure: boolean }[] {
  const out: { label: string; unsure: boolean }[] = [{ label: 'Vegetarian', unsure: false }]
  // Dairy and egg are deliberately not shown: the rule is meat and fish only.
  if (stop.diet.fish === 'no') out.push({ label: 'No fish', unsure: false })
  else if (stop.diet.fish === 'unknown') out.push({ label: 'Fish?', unsure: true })
  if (stop.diet.nuts === 'yes') out.push({ label: 'Nuts', unsure: false })
  if (stop.diet.honey === 'yes') out.push({ label: 'Honey', unsure: false })
  return out
}

export function StopEntry({ stop, index, inRoute, onToggle, onFocus, highlighted }: Props) {
  const [showSources, setShowSources] = useState(false)
  const variety = varietyOf(stop)
  const lapsed = hasEnded(stop)
  const ending = endsSoon(stop) && !lapsed
  const held = stop.status !== 'confirmed'

  // One banner, one glyph per meaning, so the kinds are told apart without colour.
  const warning = lapsed
    ? {
        glyph: '×',
        label: 'Run has ended.',
        text: `The venue said this run ended ${stop.endsOn}. Treat it as gone unless they post otherwise.`,
        tone: 'urgent' as const,
      }
    : ending
      ? {
          glyph: '!',
          label: 'Ending soon.',
          text: `Run ends ${stop.endsOn}. Check before you go.`,
          tone: 'urgent' as const,
        }
      : stop.caveat
        ? { glyph: '?', label: 'Caveat.', text: stop.caveat, tone: held ? ('held' as const) : undefined }
        : null

  const igUrl = stop.sources.find((s) => s.kind === 'instagram')?.url

  return (
    <article
      className={styles.entry}
      data-lapsed={lapsed || undefined}
      data-held={held || undefined}
      data-lit={highlighted || undefined}
      id={`stop-${stop.id}`}
    >
      {/* Slot: tear strip, gold rule, chalk line — or nothing. */}
      <span className={styles.edge} aria-hidden="true" />

      <div className={styles.grid}>
        <div className={styles.rail}>
          <span className={styles.index} aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          {/* 3:4 thumbnail with the cultivar named along its bottom edge. */}
          <span className={styles.thumb}>
            <Art
              src={`/art/stops/${stop.id}.png`}
              stopId={stop.id}
              variety={variety}
              size={112}
              className={styles.plate}
            />
            <span className={styles.cultivar}>{VARIETY_LABEL[variety]}</span>
          </span>
        </div>

        <div className={styles.content}>
          <p className={styles.venueRow}>
            <span className={styles.venue}>{stop.venue}</span>
            {stop.handle ? (
              igUrl ? (
                <a className={styles.handle} href={igUrl} target="_blank" rel="noopener noreferrer">
                  {stop.handle}
                </a>
              ) : (
                <span className={styles.handle}>{stop.handle}</span>
              )
            ) : null}
          </p>

          <h3 className={styles.dish}>{stop.item}</h3>
          <p className={styles.binomial} aria-hidden="true">
            {BINOMIAL}
          </p>

          <button type="button" className={styles.place} onClick={() => onFocus?.(stop.id)}>
            <span className={styles.pin} aria-hidden="true" />
            <span className={styles.placeText}>
              {stop.neighborhood}, {stop.borough}
            </span>
          </button>

          {stop.hours.map((h, i) => (
            <p key={i} className={styles.hours}>
              <span className={styles.days}>{prettyDays(h.days)}</span> {prettyHours(h)}
              {h.note && h.opens ? <span className={styles.qualifier}> &middot; {h.note}</span> : null}
            </p>
          ))}

          {stop.season || stop.seasonNote ? (
            // Quotation marks mean the venue said it. Our own read is never quoted.
            <p className={styles.season} data-quoted={stop.season ? true : undefined}>
              {stop.season ? `“${stop.season}”` : stop.seasonNote}
            </p>
          ) : null}

          {warning ? (
            <p className={styles.warn} data-tone={warning.tone}>
              <span aria-hidden="true" className={styles.warnGlyph}>
                {warning.glyph}
              </span>
              <span>
                <span className="srOnly">{warning.label} </span>
                {warning.text}
              </span>
            </p>
          ) : null}

          {stop.diet.note ? <p className={styles.dietNote}>{stop.diet.note}</p> : null}

          <div className={styles.pills}>
            {dietPills(stop).map((p) => (
              <span key={p.label} className={styles.pill} data-unsure={p.unsure || undefined}>
                {p.label}
              </span>
            ))}
            {stop.price !== undefined ? (
              <span className={styles.pill} data-kind="price">
                ${stop.price}
              </span>
            ) : (
              <span className={styles.pill} data-unsure="true">
                Price not published ?
              </span>
            )}
            {stop.format === 'window' ? (
              <span className={styles.pill} data-kind="format">
                Walk-up window
              </span>
            ) : null}
            {stop.format === 'seated' ? (
              <span className={styles.pill} data-kind="format">
                Table service
              </span>
            ) : null}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cta}
              onClick={() => onToggle(stop.id)}
              data-on={inRoute || undefined}
              aria-pressed={inRoute}
            >
              {inRoute ? <Check size={15} /> : <Plus size={15} />}
              {inRoute ? 'On your crawl' : 'Add to crawl'}
            </button>

            <button
              type="button"
              className={styles.sourcesToggle}
              onClick={() => setShowSources((v) => !v)}
              aria-expanded={showSources}
            >
              {showSources ? 'Hide sources' : `Sources · checked ${stop.verifiedOn}`}
            </button>
          </div>

          {showSources ? (
            <div className={styles.sources}>
              {stop.sources.map((s) => (
                <div key={s.url} className={styles.source}>
                  {s.quote ? <p className={styles.quote}>&ldquo;{s.quote}&rdquo;</p> : null}
                  <p className={styles.sourceMeta}>
                    {s.kind} &middot; {s.label}
                    {s.postedOn ? ` · ${s.postedOn}` : ''} &middot;{' '}
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      view source
                    </a>
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
