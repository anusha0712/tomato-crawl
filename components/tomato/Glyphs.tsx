/**
 * Every glyph in this project is drawn here by hand.
 *
 * Rules: no emoji, no icon font, no stock set. One visual language — 1.5px
 * strokes, round caps, 24×24 box — so nothing looks borrowed from a different
 * product. Everything inherits `currentColor`, which is how these keep working
 * across all five themes without a single theme-name check.
 *
 * If you later want to swap in your own drawings, replace the path data and
 * leave the component signatures alone.
 */

export interface GlyphProps {
  size?: number
  className?: string
  /** Decorative by default. Pass a label when the glyph carries meaning on its own. */
  label?: string
}

function svgProps(size: number, label?: string) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': label ? undefined : true,
    role: label ? ('img' as const) : undefined,
    focusable: false,
  }
}

/* --- The mark ------------------------------------------------------------- */

/**
 * The project's tomato. Drawn with a real shoulder and a five-point calyx
 * rather than a red circle with a leaf on it.
 */
export function TomatoMark({ size = 40, className, label }: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role={label ? 'img' : undefined}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {label ? <title>{label}</title> : null}
      {/* body */}
      <path
        d="M24 14.5c9.2 0 16.6 6.2 16.6 14.2S33.4 43.5 24 43.5 7.4 36.7 7.4 28.7 14.8 14.5 24 14.5Z"
        fill="var(--accent)"
      />
      {/* the crease that stops it reading as a ball */}
      <path
        d="M15.4 20.8c-2.1 2.2-3.2 4.9-3.2 7.6"
        fill="none"
        stroke="var(--accent-ink)"
        strokeWidth={1.6}
        strokeLinecap="round"
        opacity={0.42}
      />
      {/* calyx — five leaves around the stem */}
      <g fill="var(--ok)">
        {[0, 72, 144, 216, 288].map((deg) => (
          <path
            key={deg}
            d="M24 15.2c-2.6-1.2-5.6-4.2-6.6-7.4 3.4.2 6.2 2.4 7.6 5.1Z"
            transform={`rotate(${deg} 24 15.2)`}
          />
        ))}
      </g>
      {/* stem */}
      <path
        d="M24 14.2V8.4"
        fill="none"
        stroke="var(--ok)"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </svg>
  )
}

/** A trailing vine. Purely decorative, used to break up long stretches of list. */
export function Vine({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 16"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 8c20 0 24-6 40-6s20 12 40 12 24-12 40-12 20 12 40 12 24-6 40-6h40"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        opacity={0.55}
      />
      {[40, 120, 200].map((x, i) => (
        <circle key={x} cx={x} cy={i % 2 === 0 ? 3 : 13} r={2.4} fill="currentColor" opacity={0.65} />
      ))}
    </svg>
  )
}

/* --- Interface glyphs ----------------------------------------------------- */

export function Clock({ size = 16, className, label }: GlyphProps) {
  return (
    <svg {...svgProps(size, label)} className={className}>
      {label ? <title>{label}</title> : null}
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

export function Pin({ size = 16, className, label }: GlyphProps) {
  return (
    <svg {...svgProps(size, label)} className={className}>
      {label ? <title>{label}</title> : null}
      <path d="M12 21s6.5-6.1 6.5-11a6.5 6.5 0 1 0-13 0c0 4.9 6.5 11 6.5 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  )
}

/** Walking leg. */
export function Walk({ size = 16, className, label }: GlyphProps) {
  return (
    <svg {...svgProps(size, label)} className={className}>
      {label ? <title>{label}</title> : null}
      <circle cx="13.2" cy="4.6" r="1.9" />
      <path d="M11 21l1.6-5.4-2.6-2.3.9-4.6 3.1 2 2.6 1.1" />
      <path d="M10.9 8.7 8.2 10l-1 3.1" />
      <path d="m14.6 15.6 1.7 5.4" />
    </svg>
  )
}

/** Subway leg — anything past a comfortable walk. */
export function Train({ size = 16, className, label }: GlyphProps) {
  return (
    <svg {...svgProps(size, label)} className={className}>
      {label ? <title>{label}</title> : null}
      <rect x="5" y="3.5" width="14" height="13" rx="3.5" />
      <path d="M5 10.5h14" />
      <path d="m8 20 1.8-3.5M16 20l-1.8-3.5" />
      <circle cx="9" cy="13.6" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** A walk-up window — the format this crawl is built around. */
export function Window({ size = 16, className, label }: GlyphProps) {
  return (
    <svg {...svgProps(size, label)} className={className}>
      {label ? <title>{label}</title> : null}
      <path d="M4 20V8.5L12 4l8 4.5V20" />
      <rect x="8" y="11.5" width="8" height="5.5" rx="1" />
      <path d="M3 20h18" />
    </svg>
  )
}

export function Check({ size = 16, className, label }: GlyphProps) {
  return (
    <svg {...svgProps(size, label)} className={className}>
      {label ? <title>{label}</title> : null}
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  )
}

export function Plus({ size = 16, className, label }: GlyphProps) {
  return (
    <svg {...svgProps(size, label)} className={className}>
      {label ? <title>{label}</title> : null}
      <path d="M12 5.5v13M5.5 12h13" />
    </svg>
  )
}

export function Minus({ size = 16, className, label }: GlyphProps) {
  return (
    <svg {...svgProps(size, label)} className={className}>
      {label ? <title>{label}</title> : null}
      <path d="M5.5 12h13" />
    </svg>
  )
}

/** Caveats and held-back stops. Never used decoratively. */
export function Flag({ size = 16, className, label }: GlyphProps) {
  return (
    <svg {...svgProps(size, label)} className={className}>
      {label ? <title>{label}</title> : null}
      <path d="M12 8.5v4.2" />
      <path d="M12 16.4h.01" />
      <path d="M10.3 4.3 2.6 17.6a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
    </svg>
  )
}

export function External({ size = 16, className, label }: GlyphProps) {
  return (
    <svg {...svgProps(size, label)} className={className}>
      {label ? <title>{label}</title> : null}
      <path d="M13.5 5.5H19V11" />
      <path d="M19 5.5 11.5 13" />
      <path d="M18 14.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.5" />
    </svg>
  )
}

export function Drag({ size = 16, className, label }: GlyphProps) {
  return (
    <svg {...svgProps(size, label)} className={className}>
      {label ? <title>{label}</title> : null}
      <path d="M9 7h.01M15 7h.01M9 12h.01M15 12h.01M9 17h.01M15 17h.01" strokeWidth={2.4} />
    </svg>
  )
}

export function ArrowUp({ size = 16, className, label }: GlyphProps) {
  return (
    <svg {...svgProps(size, label)} className={className}>
      {label ? <title>{label}</title> : null}
      <path d="M12 19V5.5M6 11.5 12 5.5l6 6" />
    </svg>
  )
}

export function ArrowDown({ size = 16, className, label }: GlyphProps) {
  return (
    <svg {...svgProps(size, label)} className={className}>
      {label ? <title>{label}</title> : null}
      <path d="M12 5v13.5M18 12.5 12 18.5l-6-6" />
    </svg>
  )
}

export function Search({ size = 16, className, label }: GlyphProps) {
  return (
    <svg {...svgProps(size, label)} className={className}>
      {label ? <title>{label}</title> : null}
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m15.8 15.8 4.2 4.2" />
    </svg>
  )
}

/** Palette, for the theme switcher. */
export function ArrowRight({ size = 16, className, label }: GlyphProps) {
  return (
    <svg {...svgProps(size, label)} className={className}>
      {label ? <title>{label}</title> : null}
      <path d="M4.5 12h14M13 6.5l5.5 5.5-5.5 5.5" />
    </svg>
  )
}

export function Palette({ size = 16, className, label }: GlyphProps) {
  return (
    <svg {...svgProps(size, label)} className={className}>
      {label ? <title>{label}</title> : null}
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.9-.9 1.9-1.8 0-1.6-1.2-1.8-1.2-2.9 0-.8.7-1.4 1.6-1.4h1.4a4.8 4.8 0 0 0 4.8-4.8c0-3.6-3.8-6.1-8.5-6.1Z" />
      <circle cx="8.2" cy="10.4" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.9" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="15.8" cy="10" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Sits beside anything seasonal. */
export function Season({ size = 16, className, label }: GlyphProps) {
  return (
    <svg {...svgProps(size, label)} className={className}>
      {label ? <title>{label}</title> : null}
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.8v2.4M12 18.8v2.4M4.5 12H2.1M21.9 12h-2.4M6.7 6.7 5 5M19 19l-1.7-1.7M6.7 17.3 5 19M19 5l-1.7 1.7" />
    </svg>
  )
}
