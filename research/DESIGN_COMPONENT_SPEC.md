# The Tomato Crawl — design spec

Single Design Component: `Tomato Crawl.dc.html`. Plain inline styles, no frameworks, no emoji.

## Token contract

All styling reads CSS custom properties set on the root element. Components never branch on
style name — they read slots. Three styles ship: **Catalogue** (default), **Cellar**,
**Engraved**.

| Token | Role |
| --- | --- |
| `--ground` / `--ground-2` | Page ground, recessed ground |
| `--on-ground` / `--on-ground-dim` | Text on the page ground |
| `--card` | Card surface |
| `--on-card` / `--on-card-dim` | Text on a card |
| `--accent` / `--accent-deep` / `--on-accent` | Tomato red, deep red, ink on red |
| `--sage` | Secondary green (confirm states, map script, sources rule) |
| `--pink` | Decorative promo panel |
| `--radius` / `--radius-sm` / `--pill-r` | Surface silhouette |
| `--border` / `--shadow` | Surface edge + elevation |
| `--pin-r` | Marker/index shape (teardrop vs square) |
| `--line` | `stroke-dasharray` of the connecting route line |
| `--dur` | Motion duration (easing `--ease`) |
| `--display` / `--body` / `--script` / `--mono` | Typefaces |

`--on-ground*` and `--on-card*` are **separate roles on purpose**: Cellar has a deep-red
ground with cream cards.

### Styles

- **Catalogue** — cream ground, 18px radius, soft shadow, dashed 6/5 route line, 220ms.
- **Cellar** — deep red ground, cream cards, 22px radius, dotted 2/7 line, 320ms.
- **Engraved** — bone ground, 0 radius, 1.5px black rule, no shadow, hairline 1/4 line, 90ms.

## Type

- Display: **Bodoni Moda** (high-contrast serif) — headline, dish names, section heads, totals.
- Body: **Source Sans 3** (humanist sans).
- Script: **Pinyon Script** — rotated margin asides only, never functional text.
- Mono: **IBM Plex Mono** — uppercase tracked metadata (venue, handles, labels, sources).

## Layout

Mobile-first, no media queries — the main grid is
`repeat(auto-fit, minmax(min(100%, 400px), 1fr))`, so the map/route column stacks below the
list under ~840px. No horizontal scroll at 320px. All controls ≥44px.

Regions, in order: top nav (sticky) → hero → filter row → list column + sticky map/route
column → red footer.

## Content model (per stop)

Venue + Instagram handle · dish (largest type) · neighbourhood + borough (click moves the
map) · days/hours + the venue's own qualifier · season line (italic when quoted verbatim) ·
diet pills · price pill or dashed "Price not published ?" pill · format pill ·
optional warning banner (`ended` / `ending` / `caveat`) · collapsible sources block with
the caption quoted verbatim + outbound link · cultivar illustration.

## Accessibility

4.5:1 minimum on all text. Visible `:focus-visible` ring in sage. Uncertainty is never
colour alone — the unknown-price pill carries a dashed border **and** a "?"; warning
banners carry a glyph (`×` / `!` / `?`) plus text. `prefers-reduced-motion` collapses all
durations.

## Imagery — what to upload

Illustration slots are currently striped placeholders with monospace labels. Replace them
with real art:

### 1. Hero illustration — priority
- **Slot:** the dashed circle in the hero, right of the headline.
- **Wanted:** lush painted botanical tomato study — vines, leaves, heirloom fruit, one in
  cross-section — in the manner of a vintage seed-catalogue plate. Not flat vector.
- **Spec:** PNG with transparent background, ~1600×1600, art bleeding past the frame on the
  right is good (it is allowed to hang off the hero edge).
- **Must read on deep red** (`#a4201a`) — avoid dark outlines that disappear into the ground.

### 2. Stop thumbnails — eight, 3:4 portrait
One per cultivar, transparent PNG ~800×1060, readable at 124px wide:
`heirloom beefsteak` · `sungold truss` (×2) · `cross-section study` · `plum, split` (×2) ·
`green zebra` (×2).

### 3. Optional
- Footer / promo vine strip, wide transparent PNG.
- Map tiles: currently a CSS placeholder standing in for Leaflet with muted tiles.

Drop files into `uploads/`; tell me which slot each belongs to and I will wire them in,
replacing the placeholder markup.

## Build notes (target stack)

Next.js App Router + TypeScript, CSS Modules with the token contract above as
`:root` / `[data-style="…"]` blocks, Leaflet for the map panel (numbered red teardrop
markers, dashed polyline, synced hover/focus with the list).
