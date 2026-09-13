# Design brief — The Tomato Crawl

Input for a design tool. Paste whole.

---

## Product

A web app for planning a self-guided food crawl through New York City, built around
tomato dishes. Part directory, part itinerary builder. Not a blog, not a listicle.

**Product type:** local discovery + trip planner
**Audience:** New Yorkers and visitors, 20s–40s, food-interested, planning a weekend afternoon
**Primary context of use:** on a phone, outdoors, mid-crawl, one-handed. Desktop is secondary.
**Tone:** warm, editorial, specific. Someone who has actually stood in the line. Never
promotional.

## What it does

1. Browse ~10 verified stops, each a single tomato dish at a specific venue
2. Filter by borough, by what is open on a chosen day, by free-text search
3. Add stops to a route and reorder them
4. See real subway directions between stops, plus walking time and time spent at each
5. See stops on a map, synced with the list

## Content model

Each stop card carries:

- Venue name + Instagram handle (small, uppercase, tracked)
- Dish name (the headline — largest type on the card)
- Neighbourhood + borough, with a pin icon; clicking it moves the map
- Opening days and hours, with the venue's own qualifier ("or until sold out")
- A season line — either the venue's exact words in quotation marks, or our plain-text read
- Diet tags as pills: vegetarian, no fish, sometimes nuts/honey
- Price pill, or a dashed "price not published" pill when none exists
- Format pill for walk-up window / table service
- Warning banners: run ended, ending soon, or a caveat
- Collapsible sources block with the venue's caption quoted verbatim + outbound link
- A botanical illustration of the specific tomato cultivar (heirloom beefsteak, sungold
  truss, plum, green zebra, cross-section)

## Screens / regions

- **Top nav** — wordmark + tomato mark, search field, style switcher, primary CTA pill
- **Hero banner** — full-bleed, deep red, oversized serif headline, script asides in the
  margins, a stamped scalloped seal, botanical illustration bleeding off one edge
- **Filter row** — rounded chips, one active in solid red
- **Stop list** — vertical cards, illustration thumbnail left, content right
- **Map panel** — sticky on desktop, soft muted tiles, numbered red teardrop pins, dashed
  route line
- **Route ticket** — day-of-week selector, ordered stops with reorder/remove controls,
  transit legs with subway bullets between them, totals, primary CTA
- **Promo panels** — one dark green "plan your crawl", one soft pink decorative
- **Footer** — full-width red bar

## Hard constraints

- **No Tailwind, no utility-class frameworks, no component libraries.** Plain CSS with
  custom properties, CSS Modules.
- **No emoji anywhere.** All glyphs and illustrations are SVG or raster art.
- **Mobile-first.** Phone layout outranks desktop. Touch targets ≥44px, no horizontal
  scroll at 320px.
- **WCAG AA.** 4.5:1 on all text. Visible focus rings. Never colour alone to convey meaning
  — uncertainty is shown with a dashed border and a "?" as well.
- **`prefers-reduced-motion` respected.**
- Stack: Next.js App Router, TypeScript, Leaflet for maps.

## Theming requirement

The design must be expressible as a **token contract**, not a single fixed look. Multiple
switchable styles share one component structure, and each style may change:

colour · typefaces · surface silhouette (radius, border, shadow) · ornament ·
marker/index shape · the connecting line between stops · illustration treatment
(engraved line vs solid fill) · motion duration and easing

Components render semantic slots and never branch on style name. Two token roles must stay
separate: **text on the page ground** vs **text on a card**, because one style has a deep
red ground with cream cards.

## Aesthetic direction wanted

Warm editorial-commercial. Cream ground, deep tomato red as the dominant accent, sage green
secondary. High-contrast serif for display, clean humanist sans for body, a connected script
used sparingly for rotated margin asides. Soft rounded cards with generous whitespace.
Lush painted botanical tomato illustration as the hero element — vines, leaves, heirloom
fruit in section — not flat vector icons.

Reference feel: a vintage seed catalogue reissued as a modern food-guide product.

## Explicitly avoid

Generic SaaS dashboard layouts. Purple gradients. Stock icon sets. Centred hero with a
single button. Card grids where every card is identical grey. Anything that reads as a
template.
