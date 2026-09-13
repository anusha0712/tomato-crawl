'use client'

import { VinePlate } from '@/components/tomato/Botanical'
import { StyleSwitcher } from '@/components/StyleSwitcher/StyleSwitcher'
import styles from './Masthead.module.css'

interface Props {
  shipping: number
  held: number
  lastChecked: string
}

export function Masthead({ shipping, held, lastChecked }: Props) {
  return (
    <header className={styles.masthead}>
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <p className={styles.eyebrow}>Manhattan &amp; Brooklyn · vegetarian · summer 2026</p>
          <StyleSwitcher />
        </div>

        <div className={styles.titleBlock}>
          <h1 className={styles.title}>
            <span className={styles.titleThe}>The</span>
            <span className={styles.titleMain}>Tomato</span>
            <span className={styles.titleSub}>Crawl</span>
          </h1>

          <VinePlate className={styles.vine} size={240} />
        </div>

        <p className={styles.blurb}>
          Bakeries, walk-up windows and sweets counters running a tomato item this season. One good thing at each,
          then move on. Nothing here was taken from a round-up — every line was read off a menu or a post the venue
          itself controls.
        </p>

        <dl className={styles.stats}>
          <div>
            <dt>Stops</dt>
            <dd className="tabularNums">{shipping}</dd>
          </div>
          <div>
            <dt>Held back</dt>
            <dd className="tabularNums">{held}</dd>
          </div>
          <div>
            <dt>Meat or fish</dt>
            <dd>None</dd>
          </div>
          <div>
            <dt>Last checked</dt>
            <dd className="tabularNums">{lastChecked}</dd>
          </div>
        </dl>
      </div>
    </header>
  )
}
