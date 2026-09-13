import styles from './SiteFooter.module.css'

export function SiteFooter({ lastChecked }: { lastChecked: string }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.word}>Tomato Crawl</p>
        <p className={styles.tag}>A tastier city, one tomato at a time</p>
        <p className={styles.note}>
          Every stop read off a menu or post the venue controls · last checked {lastChecked}
        </p>
      </div>
    </footer>
  )
}
