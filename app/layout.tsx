import type { Metadata, Viewport } from 'next'
import { Fraunces, Archivo, Oswald, Bodoni_Moda, Alfa_Slab_One, Karla, Spectral, IBM_Plex_Mono, Playfair_Display, Sacramento, Source_Sans_3, Pinyon_Script } from 'next/font/google'
import { STYLE_BOOTSTRAP, DEFAULT_STYLE } from '@/lib/styles'
import './globals.css'

/**
 * Eight families, because the five styles genuinely disagree about typography —
 * a didone for the herbarium sheet and a fat slab for the tin cannot be the same
 * face at different weights. Weights are kept to what each style actually uses.
 */
const fraunces = Fraunces({ subsets: ['latin'], axes: ['SOFT', 'WONK', 'opsz'], variable: '--f-fraunces', display: 'swap' })
const archivo = Archivo({ subsets: ['latin'], weight: ['400', '600', '800'], variable: '--f-archivo', display: 'swap' })
const oswald = Oswald({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--f-oswald', display: 'swap' })
const bodoni = Bodoni_Moda({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'], variable: '--f-bodoni', display: 'swap' })
const alfa = Alfa_Slab_One({ subsets: ['latin'], weight: ['400'], variable: '--f-alfa', display: 'swap' })
const karla = Karla({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--f-karla', display: 'swap' })
const spectral = Spectral({ subsets: ['latin'], weight: ['400', '600'], style: ['normal', 'italic'], variable: '--f-spectral', display: 'swap' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--f-mono', display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['500', '700', '800'], variable: '--f-playfair', display: 'swap' })
// A connected script, for the rotated margin asides only. One weight is all it has.
const sacramento = Sacramento({ subsets: ['latin'], weight: ['400'], variable: '--f-sacramento', display: 'swap' })
const sourceSans = Source_Sans_3({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--f-source', display: 'swap' })
const pinyon = Pinyon_Script({ subsets: ['latin'], weight: ['400'], variable: '--f-pinyon', display: 'swap' })

const FONTS = [fraunces, archivo, oswald, bodoni, alfa, karla, spectral, mono, playfair, sacramento, sourceSans, pinyon]
  .map((f) => f.variable)
  .join(' ')

export const metadata: Metadata = {
  title: 'The Tomato Crawl — NYC',
  description:
    'A vegetarian tomato crawl through Manhattan and Brooklyn. Every stop checked against the venue’s own menu or post.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The font variables MUST live on <html>, not <body>. The style blocks in
    // styles/styles/ target [data-style] on <html> and read --f-* there; if the
    // variables only exist on <body>, every --font-* token resolves to empty and
    // the whole font-family declaration goes invalid — silently, to Times.
    <html lang="en" data-style={DEFAULT_STYLE} className={FONTS} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: STYLE_BOOTSTRAP }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
