import type { Variety } from './variety'

export interface StyleDef {
  id: string
  name: string
  /** What the style actually is, in the switcher. */
  note: string
  scheme: 'light' | 'dark'
  /** The plate drawn on the switcher swatch. */
  plate: Variety
}

/**
 * Five styles, not five palettes. Each one changes the typefaces, the shape of
 * every surface, the ornament, the stop markers and the motion. See
 * styles/contract.css for what a style is obliged to define.
 */
export const STYLES: StyleDef[] = [
  {
    id: 'catalogue',
    name: 'Catalogue',
    note: 'Seed catalogue reissued as a product',
    scheme: 'light',
    plate: 'cherry',
  },
  {
    id: 'orchard',
    name: 'Orchard',
    note: 'Warm editorial, built for illustration',
    scheme: 'light',
    plate: 'heirloom',
  },
  {
    id: 'packet',
    name: 'Packet',
    note: 'Heirloom seed catalogue, letterpressed',
    scheme: 'light',
    plate: 'heirloom',
  },
  {
    id: 'transit',
    name: 'Transit',
    note: 'The crawl drawn as a subway line',
    scheme: 'dark',
    plate: 'round',
  },
  {
    id: 'chalk',
    name: 'Chalk',
    note: 'A greenmarket board at 7am',
    scheme: 'dark',
    plate: 'zebra',
  },
  {
    id: 'herbarium',
    name: 'Herbarium',
    note: 'Solanum lycopersicum, pressed and mounted',
    scheme: 'dark',
    plate: 'cherry',
  },
  {
    id: 'conserva',
    name: 'Conserva',
    note: 'A San Marzano tin, shouting',
    scheme: 'light',
    plate: 'plum',
  },
]

export const DEFAULT_STYLE = 'catalogue'
export const STYLE_KEY = 'tomato-crawl:style'
export const ROUTE_KEY = 'tomato-crawl:route'

export function isStyle(v: unknown): v is string {
  return typeof v === 'string' && STYLES.some((s) => s.id === v)
}

/** Runs before first paint so the page never flashes the default style. */
export const STYLE_BOOTSTRAP = `(function(){try{var s=localStorage.getItem('${STYLE_KEY}');var ok=${JSON.stringify(
  STYLES.map((s) => s.id),
)};document.documentElement.setAttribute('data-style',(s&&ok.indexOf(s)>-1)?s:'${DEFAULT_STYLE}');}catch(e){document.documentElement.setAttribute('data-style','${DEFAULT_STYLE}');}})();`
