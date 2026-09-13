import type { Stop } from '@/data/stops'

/**
 * Which tomato a stop actually involves.
 *
 * Derived from the venue's own wording, never assigned by taste. "Sungold
 * Tomato" on Frenzie's menu draws a truss of small orange cherries; "Heirloom
 * Tomato" draws a ribbed beefsteak. When the venue does not name a variety we
 * draw the generic round fruit rather than inventing a cultivar — same rule as
 * every other field in this project.
 *
 * Computed, not stored. See CLAUDE.md on derived values.
 */
export type Variety = 'sungold' | 'heirloom' | 'plum' | 'zebra' | 'cherry' | 'round'

export function varietyOf(stop: Stop): Variety {
  const text = `${stop.item} ${stop.season ?? ''}`.toLowerCase()

  if (text.includes('sungold')) return 'sungold'
  if (text.includes('heirloom')) return 'heirloom'
  if (text.includes('burst tomato')) return 'cherry'
  // Caprese and pomodoro traditions run on plum tomatoes.
  if (text.includes('san marzano') || text.includes('pomodoro')) return 'plum'
  if (text.includes('green')) return 'zebra'
  return 'round'
}

export const VARIETY_LABEL: Record<Variety, string> = {
  sungold: 'Sungold truss',
  heirloom: 'Heirloom beefsteak',
  plum: 'Plum',
  zebra: 'Green Zebra',
  cherry: 'Cherry',
  round: 'Tomato',
}

/** Shown only in the herbarium style, where a specimen sheet wants a binomial. */
export const BINOMIAL = 'Solanum lycopersicum'
