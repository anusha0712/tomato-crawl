'use client'

import { useId } from 'react'
import type { Variety } from '@/lib/variety'
import { VARIETY_LABEL } from '@/lib/variety'

/**
 * Hand-drawn botanical plates. Six cultivars, one shared 100×100 box.
 *
 * These are line drawings first and filled shapes second, because the styles
 * disagree about which they want: the herbarium and packet styles want an
 * engraved plate with no fill, chalk wants a white stroke on slate, conserva
 * wants a solid tin-label silhouette. So every plate paints from four tokens —
 * --illo-fill, --illo-stroke, --illo-stroke-w, --illo-accent — and the style
 * decides. No component here knows which style is active.
 */

export interface PlateProps {
  variety: Variety
  size?: number
  className?: string
  /** Plates are decorative beside a text label; pass a title only when they stand alone. */
  titled?: boolean
}

function frame(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 100 100',
    className,
    fill: 'none' as const,
    stroke: 'var(--illo-stroke, currentColor)',
    strokeWidth: 'var(--illo-stroke-w, 1.6)',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    focusable: false,
  }
}

/**
 * Five sepals plus stem. Drawn as narrow pointed lenses rather than fat petals,
 * offset so they do not sit in a perfectly symmetrical star — a tomato calyx is
 * a calyx, not a flower.
 */
function Calyx({ cx = 50, cy = 30, spread = 1, stem = 15 }: { cx?: number; cy?: number; spread?: number; stem?: number }) {
  const L = 18 * spread
  const W = 3.6 * spread
  return (
    <g>
      {[20, 92, 164, 236, 308].map((deg) => (
        <path
          key={deg}
          d={`M0 0 Q${L * 0.45} ${-W} ${L} 0 Q${L * 0.45} ${W} 0 0 Z`}
          transform={`translate(${cx} ${cy}) rotate(${deg})`}
          fill="var(--illo-accent, var(--illo-stroke, currentColor))"
          stroke="none"
        />
      ))}
      <path
        d={`M${cx} ${cy} V${cy - stem}`}
        stroke="var(--illo-accent, var(--illo-stroke, currentColor))"
        strokeWidth={2.4 * spread}
        strokeLinecap="round"
      />
    </g>
  )
}

/** Ribbed beefsteak. Wide, but not flat — two soft lobes and shoulder creases. */
function Heirloom() {
  return (
    <g>
      <path
        d="M50 30c16 0 29 6 34 15 4 8 3 18-3 24-6 7-17 11-31 11s-25-4-31-11c-6-6-7-16-3-24 5-9 18-15 34-15Z"
        fill="var(--illo-fill, none)"
      />
      {/* lobing is implied by creases, so the outline stays a tomato */}
      <path d="M34 38c-2 6-3 11-2 16" opacity=".42" />
      <path d="M66 38c2 6 3 11 2 16" opacity=".42" />
      <path d="M50 68c0 4 0 6 0 8" opacity=".3" />
      <Calyx cy={34} spread={1} stem={14} />
    </g>
  )
}

/** A truss of small fruits — how sungolds actually arrive. */
function Sungold() {
  const node: [number, number] = [50, 27]
  const fruit: [number, number, number][] = [
    [31, 55, 10],
    [50, 63, 11],
    [69, 54, 9.5],
    [36, 39, 8],
    [64, 39, 7.5],
  ]
  return (
    <g>
      <path d="M50 8v19" strokeWidth="calc(var(--illo-stroke-w, 1.6) * 1.8)" />
      {/* one pedicel per fruit, each ending on the fruit's shoulder */}
      {fruit.map(([cx, cy, r], i) => (
        <path
          key={`p${i}`}
          d={`M${node[0]} ${node[1]} L${cx + (node[0] - cx) * 0.12} ${cy - r + 1}`}
          opacity=".7"
          strokeWidth="calc(var(--illo-stroke-w, 1.6) * 0.9)"
        />
      ))}
      {fruit.map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="var(--illo-fill, none)" />
      ))}
    </g>
  )
}

/** Halved fruit: pericarp wall, columella, locules, seeds. */
function CrossSection() {
  const seeds: [number, number, number][] = [
    [39, 43, -28], [45, 37, -14], [56, 37, 14], [62, 43, 28],
    [36, 60, -52], [65, 60, 52], [44, 69, -8], [57, 69, 8],
    [33, 51, -76], [68, 51, 76],
  ]
  return (
    <g>
      <circle cx="50" cy="53" r="33" fill="var(--illo-fill, none)" />
      <circle cx="50" cy="53" r="26.5" opacity=".65" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <path key={deg} d="M50 53c-11-1-18-8-20-17 8 3 15 8 20 17Z" transform={`rotate(${deg} 50 53)`} opacity=".38" />
      ))}
      {seeds.map(([cx, cy, rot], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx="3.2"
          ry="2"
          transform={`rotate(${rot} ${cx} ${cy})`}
          fill="var(--illo-accent, var(--illo-stroke, currentColor))"
          stroke="none"
          opacity=".8"
        />
      ))}
      <circle cx="50" cy="53" r="2.6" fill="var(--illo-accent, var(--illo-stroke, currentColor))" stroke="none" opacity=".45" />
    </g>
  )
}

/** San Marzano — long, shouldered, blunt-tipped. One crease, off centre. */
function Plum() {
  return (
    <g>
      <path
        d="M50 27c11 0 18 12 18 29 0 18-7 29-18 29s-18-11-18-29c0-17 7-29 18-29Z"
        fill="var(--illo-fill, none)"
      />
      <Calyx cy={28} spread={0.7} stem={12} />
    </g>
  )
}

/** Green Zebra keeps its stripes when ripe, which is the whole point of it. */
function Zebra() {
  const clip = useId().replace(/:/g, '')
  const body = 'M50 31c19 0 33 11 33 25s-14 25-33 25-33-11-33-25 14-25 33-25Z'
  return (
    <g>
      <clipPath id={clip}>
        <path d={body} />
      </clipPath>
      <path d={body} fill="var(--illo-fill, none)" />
      <g clipPath={`url(#${clip})`}>
        {[26, 44, 62, 80].map((x) => (
          <path
            key={x}
            d={`M${x} 26c-4 12-4 32 0 46`}
            strokeWidth="6"
            stroke="var(--illo-accent, var(--illo-stroke, currentColor))"
            fill="none"
            opacity=".42"
            strokeLinecap="butt"
          />
        ))}
      </g>
      <path d={body} fill="none" />
      <Calyx cy={32} spread={0.88} stem={14} />
    </g>
  )
}

/** Plain round fruit, for stops where the venue never named a cultivar. */
function Round() {
  return (
    <g>
      <path
        d="M50 31c17 0 30 11 30 25s-13 25-30 25-30-11-30-25 13-25 30-25Z"
        fill="var(--illo-fill, none)"
      />
      <path d="M32 47c-3 4-5 8-5 12" opacity=".35" strokeWidth="calc(var(--illo-stroke-w, 1.6) * 0.8)" />
      <Calyx cy={32} spread={0.92} stem={15} />
    </g>
  )
}

export function Plate({ variety, size = 56, className, titled }: PlateProps) {
  const Body =
    variety === 'heirloom'
      ? Heirloom
      : variety === 'sungold'
        ? Sungold
        : variety === 'plum'
          ? Plum
          : variety === 'zebra'
            ? Zebra
            : variety === 'cherry'
              ? CrossSection
              : Round

  return (
    <svg {...frame(size, className)} role={titled ? 'img' : undefined} aria-hidden={titled ? undefined : true}>
      {titled ? <title>{VARIETY_LABEL[variety]}</title> : null}
      <Body />
    </svg>
  )
}

/**
 * The masthead plate: a vine with pinnate leaves, a truss, and a tendril.
 * Tomato leaves are compound with serrated leaflets, which is what stops this
 * reading as a generic houseplant.
 */
export function VinePlate({ className, size = 190 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.72}
      viewBox="0 0 260 190"
      className={className}
      fill="none"
      stroke="var(--illo-stroke, currentColor)"
      strokeWidth="var(--illo-stroke-w, 1.6)"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* main stem */}
      <path d="M14 176c34-6 58-24 74-52 14-25 30-44 56-56 20-9 44-12 72-10" strokeWidth="calc(var(--illo-stroke-w, 1.6) * 1.9)" />

      {/* compound leaves — a rachis with serrated leaflets each side */}
      {[
        { x: 62, y: 138, r: -32, s: 1 },
        { x: 108, y: 96, r: -14, s: 0.86 },
        { x: 166, y: 62, r: 8, s: 0.94 },
      ].map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.s})`}>
          <path d="M0 0h58" opacity=".9" />
          {[10, 26, 42].map((d) => (
            <g key={d}>
              <path d={`M${d} 0c4-9 12-14 21-14-2 9-9 15-21 14Z`} fill="var(--illo-leaf, none)" />
              <path d={`M${d} 0c4 9 12 14 21 14-2-9-9-15-21-14Z`} fill="var(--illo-leaf, none)" />
            </g>
          ))}
          <path d="M58 0c5-6 11-9 18-9-2 6-8 10-18 9Z" fill="var(--illo-leaf, none)" />
        </g>
      ))}

      {/* a truss of fruit hanging off the stem */}
      <g transform="translate(196 96)">
        <path d="M0-24v10M0-14c-7 2-12 6-15 12M0-14c6 2 10 5 12 10" opacity=".85" />
        <circle cx="-18" cy="10" r="13" fill="var(--illo-fill, none)" />
        <circle cx="10" cy="14" r="15" fill="var(--illo-fill, none)" />
        <circle cx="30" cy="-2" r="11" fill="var(--illo-fill, none)" />
      </g>

      {/* tendril */}
      <path d="M92 118c10-7 16-2 13 6-3 7-12 6-13-2-2-11 8-18 18-16" opacity=".6" strokeWidth="calc(var(--illo-stroke-w, 1.6) * 0.85)" />
    </svg>
  )
}
