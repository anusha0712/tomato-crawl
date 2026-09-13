'use client'

import { VinePlate } from '@/components/tomato/Botanical'
import { useImageFallback, hasArt } from '@/components/tomato/Art'
import styles from './Hero.module.css'

interface Props {
  shipping: number
  held: number
  lastChecked: string
}

/**
 * The banner. Styles that want a loud editorial hero paint it from --hero-*;
 * the austere styles inherit the page ground and it reads as a quiet masthead.
 *
 * The art slot takes an image if one is dropped at /public/art/hero.png, and
 * falls back to the hand-drawn vine when there is none. Nothing breaks either
 * way, so real illustration can land later without touching this file.
 */
/** Drops in /public/art/hero.png when it exists; draws the vine when it does not. */
function HeroArt() {
  const { ref, failed, onError } = useImageFallback('/art/hero.png')
  return (
    <div className={styles.art} aria-hidden="true">
      {failed || !hasArt('hero') ? (
        <VinePlate className={styles.vine} size={440} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- needs onError to fall back
        <img ref={ref} src="/art/hero.png" alt="" className={styles.heroImg} onError={onError} />
      )}
    </div>
  )
}

export function Hero({ shipping, held, lastChecked }: Props) {
  return (
    <header className={styles.hero}>
      <HeroArt />

      <p className={styles.scriptLeft} aria-hidden="true">
        Good food
        <br />
        riper days
      </p>

      <div className={styles.inner}>
        <h1 className={styles.title}>
          The Ultimate
          <br />
          Tomato Crawl
        </h1>
        <p className={styles.sub}>Seasonal tomato specials around the city.</p>
        <p className={styles.kicker}>
          {shipping} stops · {held} held back · vegetarian · checked {lastChecked}
        </p>
      </div>

      {/* A stamped seal, drawn rather than set — scalloped edge, ring of text. */}
      <div className={styles.seal} aria-hidden="true">
        <svg viewBox="0 0 120 120" className={styles.sealShape} aria-hidden="true" focusable="false">
          <path
            d={Array.from({ length: 28 }, (_, i) => {
              const a = (i / 28) * Math.PI * 2
              const r = i % 2 === 0 ? 56 : 51
              const x = 60 + Math.cos(a) * r
              const y = 60 + Math.sin(a) * r
              return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
            }).join(' ') + ' Z'}
            fill="var(--hero-seal-bg, #fdf3e3)"
          />
        </svg>
        <span className={styles.sealText}>
          Tomato
          <br />
          lovers
          <br />
          explore
          <br />
          together
        </span>
      </div>

      <p className={styles.scriptRight} aria-hidden="true">
        Same city
        <br />
        more tomatoes
      </p>
    </header>
  )
}
