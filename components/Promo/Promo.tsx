'use client'

import { Plate } from '@/components/tomato/Botanical'
import { ArrowRight } from '@/components/tomato/Glyphs'
import styles from './Promo.module.css'

/**
 * The two rail panels from the reference. Only styles that switch on
 * --script-display render the second, decorative one — the austere styles have
 * no business with a pink card that says "same city, more tomatoes".
 */
export function PlanPromo({ onPlan, count }: { onPlan: () => void; count: number }) {
  return (
    <section className={styles.plan} aria-labelledby="promo-plan">
      <Plate variety="sungold" size={78} className={styles.planArt} />
      <h2 id="promo-plan" className={styles.planTitle}>
        Plan
        <br />
        your crawl
      </h2>
      <ul className={styles.points}>
        <li>Save places</li>
        <li>Build your route</li>
        <li>Make it a day</li>
      </ul>
      <button type="button" className={styles.planCta} onClick={onPlan}>
        {count > 0 ? `Open your ${count} stops` : 'Start planning'}
        <ArrowRight size={15} />
      </button>
    </section>
  )
}

export function SeasonPromo() {
  return (
    <section className={styles.season} aria-hidden="true">
      <p className={styles.seasonScript}>
        Same city
        <br />
        more tomatoes
      </p>
      <p className={styles.seasonKicker}>Seasonal flavours · stronger together</p>
      <Plate variety="heirloom" size={64} className={styles.seasonArt} />
    </section>
  )
}
