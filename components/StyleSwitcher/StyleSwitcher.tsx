'use client'

import { useEffect, useRef, useState } from 'react'
import { STYLES, STYLE_KEY, DEFAULT_STYLE, isStyle } from '@/lib/styles'
import { Plate } from '@/components/tomato/Botanical'
import { Check } from '@/components/tomato/Glyphs'
import styles from './StyleSwitcher.module.css'

/**
 * These are five styles, not five palettes, so the switcher shows a real
 * preview of each — its typeface, its ground, its ornament — rather than a
 * colour dot that tells you nothing about what you are about to get.
 */
export function StyleSwitcher() {
  const [current, setCurrent] = useState(DEFAULT_STYLE)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STYLE_KEY)
      if (isStyle(stored)) setCurrent(stored)
    } catch {
      /* blocked storage — the default stands */
    }
  }, [])

  function choose(id: string) {
    setCurrent(id)
    document.documentElement.setAttribute('data-style', id)
    try {
      localStorage.setItem(STYLE_KEY, id)
    } catch {
      /* the choice just will not survive a reload */
    }
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const active = STYLES.find((s) => s.id === current) ?? STYLES[0]

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className={styles.triggerLabel}>Style</span>
        <span className={styles.triggerName}>{active.name}</span>
      </button>

      {open ? (
        <div className={styles.menu} role="menu" aria-label="Visual style">
          <p className={styles.menuNote}>Five styles. Each one rebuilds the page, not just the colours.</p>
          {STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="menuitemradio"
              aria-checked={s.id === current}
              className={styles.item}
              onClick={() => choose(s.id)}
            >
              {/* A live scope of the style: it renders under its own tokens. */}
              <span className={styles.preview} data-style={s.id} aria-hidden="true">
                <Plate variety={s.plate} size={30} />
                <span className={styles.previewType}>Aa</span>
              </span>
              <span className={styles.itemText}>
                <span className={styles.itemName}>
                  {s.name}
                  {s.id === current ? <Check size={13} /> : null}
                </span>
                <span className={styles.itemNote}>{s.note}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
