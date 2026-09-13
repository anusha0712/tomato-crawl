'use client'

import { Plate } from '@/components/tomato/Botanical'
import { StyleSwitcher } from '@/components/StyleSwitcher/StyleSwitcher'
import { Search } from '@/components/tomato/Glyphs'
import styles from './NavBar.module.css'

interface Props {
  query: string
  onQuery: (v: string) => void
  routeCount: number
  onPlan: () => void
}

export function NavBar({ query, onQuery, routeCount, onPlan }: Props) {
  return (
    <nav className={styles.nav} aria-label="Site">
      <div className={styles.inner}>
        <a className={styles.brand} href="#stops">
          <Plate variety="heirloom" size={30} className={styles.mark} />
          <span className={styles.word}>Tomato Crawl</span>
        </a>

        <div className={styles.search}>
          <Search size={15} />
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search places, dishes, neighbourhoods…"
            aria-label="Search stops"
            className={styles.input}
          />
        </div>

        <div className={styles.right}>
          <StyleSwitcher />
          <button type="button" className={styles.cta} onClick={onPlan}>
            <span className={styles.ctaLabel}>Plan your crawl</span>
            <span className={styles.ctaShort} aria-hidden="true">
              Crawl
            </span>
            {routeCount > 0 ? <span className={styles.count}>{routeCount}</span> : null}
          </button>
        </div>
      </div>
    </nav>
  )
}
