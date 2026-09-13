# The Tomato Crawl — NYC

A food crawl through Manhattan and Brooklyn built entirely around tomatoes. Bakeries, sandwich
counters, walk-up windows, sweets shops, and a few bars pouring seasonal tomato drinks. The site
is a real itinerary tool: routes, timings, transit, and check-off progress, deployed on Vercel.

Read this file before writing anything. The constraints below are easy to violate by reflex.

---

## Hard rules

**No Tailwind.** No utility-class frameworks, no component libraries, no shadcn, no CSS-in-JS
runtime. Styling is CSS Modules plus custom properties. If a class name looks like `flex gap-2`,
it is wrong.

**No emoji.** Not in the UI, not in copy, not in commit messages, not as a placeholder "until we
draw a real one." Every glyph is hand-authored SVG living in `components/tomato/`. Icon fonts
and stock icon sets are also out.

**Vegetarian only. No meat, no fish.** This is an item-level rule, not a venue-level one — a
meat-heavy sandwich shop can still run one vegetarian tomato special, and that special counts.

**Dairy and egg do not matter and are not surfaced** (settled 2026-09-12). Cheese, butter, aioli
and custard are all fine, so do not tag them, do not flag them as unknown, and do not write diet
notes about them. **Fish still matters** — anchovy and bonito turn up constantly in tomato
dishes, so state their absence rather than assuming it. Nut and honey tags stay, as allergen and
vegan information rather than as rule enforcement.

**Alt text is never negative evidence.** Meta's auto-generated image descriptions cover only
some posts. A venue is rejected only after its Instagram grid has been read *visually* — this
rule exists because grepping alt text for "tomato" missed Librae Bakery's corn custard & tomato
chutney danish, a post with 3,161 likes that explicitly named tomato season.

**Quote captions verbatim.** Never paraphrase a caption into a menu item.

**Never harden a vague phrase into a precise field.** "Around for two weeks" is not an end date.
Converting it to `endsOn: '2026-09-11'` marked a live item as dead. If the venue did not state a
date, there is no date — put their words in a caveat instead.

**Never invent a menu item, price, address, or hours.** This is the one that matters most. If a
detail is not verified against a source the venue itself controls, it does not enter
`data/stops.ts`. Sending someone across the city for a pastry that was discontinued in July is
the worst thing this project can do. When a fact cannot be confirmed, leave the field out or
drop the stop. Do not reason toward a plausible value.

**Secret tokens never get a `NEXT_PUBLIC_` prefix.** The map needs no token at all now — Leaflet
draws OpenStreetMap tiles. The only key this project will ever hold is a Google Directions key
for real transit legs, and that one is **server-side only**: it goes in `GOOGLE_MAPS_API_KEY`,
is read in a route handler, and never reaches the browser. If a key ever has to ship to the
client, restrict it by referrer first and say so in a comment beside it.

---

## What counts as a stop

The crawl is about grabbing one good thing and moving on.

**In:**
- Bakeries and pastry counters
- Sandwich shops
- Walk-up windows
- Standing counters
- Sweets shops (granita, sorbet, soft-serve, ices)
- Bars, but only when the tomato drink is a seasonal special

**Out:**
- Sit-down restaurants
- Pizza shops. Excluded on purpose, including slice counters and tomato pie. Not the vibe.
- Tinned-tomato shops, packaged deli items, groceries, farm stands. Buying is not eating.
- Bars whose tomato drink is a year-round fixture
- Permanent generic items: a standard tomato pasta, a BLT that is only a BLT
- The bar Schmuck, specifically

The test: can you get one item quickly and leave? If it requires a table and a check, it is out.

**The seasonal test settles edge cases.** A seasonal special is in; a permanent fixture is not.
This resolves the pizza-adjacent bakery items without arguing about what counts as pizza: a
bakery's year-round pizza pomodoro is out because it is year-round, not because of the word.
Apply the same test to bar drinks and to anything else that sits on a line.

---

## Verification bar

Every stop carries `verifiedOn` (ISO date) and at least one source URL.

| Status | Meaning | Ships |
| --- | --- | --- |
| `confirmed` | Item appears on the venue's own current menu, site, or a recent post | Yes |
| `likely` | Only third-party press, or the venue's own source is stale | Held back, or shown with a visible caveat |
| `unverified` | Could not confirm | Never |

Source kinds rank: `menu` (venue-owned) beats `instagram` (venue-owned) beats `press`
(third party). A stop resting on `press` alone cannot be `confirmed`.

Research is **venue-first**. Build a candidate list of known-good counters, then check each
venue's own menu. Query-first searching ("best tomato sandwich brooklyn") returns aggregator
spam and produces exactly the fabricated-feeling list this project exists to avoid.

Log every candidate in `research/RESEARCH_LOG.md`, including rejections and the reason. Next
summer's refresh depends on knowing what was already ruled out.

---

## What is built

`data/stops.ts` holds 9 shipping stops and 4 held back. `npm run check-data` fails the build if a
shipping stop is missing a venue-owned source, a verbatim quote, or `verifiedOn`; if a held-back
stop lacks a caveat; or if coordinates fall outside New York. Coordinates are geocoded from the
verified address, never typed by hand.

Three views over one dataset: a scrollable stop list, the Leaflet map, and a route builder. The
route builder is the point of the project — it computes walking legs, flags stops that are closed
on the chosen day, and hands each leg to Google Maps for transit. Route and theme both persist to
`localStorage`, each read behind a `try/catch` because storage throws outright in some contexts.

The masthead, entries and route ticket are all dressed from the style contract — there is no
second design hiding in a component file.

**Quotation marks in the UI mean the venue said it.** `season` is the venue's own words and is
rendered quoted; `seasonNote` is our read and is rendered plain. Do not put an inference in
`season`.

---

## Voice

Copy should read like someone who has actually stood in the line. Specific, plain, willing to be
unenthusiastic about a stop that is merely fine.

Run the `humanizer` skill over user-facing strings and check against Wikipedia's
*Signs of AI writing*.

**Banned words:** nestled, delve, vibrant, tapestry, testament to, hidden gem, must-visit,
elevate, curated (of food), iconic, beloved, boasts, offerings.

**Banned patterns:**
- "Not just X, but Y"
- Rule-of-three lists used for rhythm rather than because there are three things
- Em-dash pile-ups. One per paragraph at most.
- Vague attribution: "many say", "locals love", "some argue"
- Superficial *-ing* clauses tacked onto sentence ends: "...making it a favorite among locals"
- Promotional puffery and closing summaries that restate what was just said

Write the specific detail instead. "Sells out by 11 on Saturdays" beats "a beloved local
favorite."

---

## Architecture

**Stack:** Next.js App Router, TypeScript, CSS Modules, Leaflet + OpenStreetMap tiles.

Mapbox was the earlier plan and is gone. Leaflet needs no account, no token and no billing, and
the crawl does not need vector tiles. Transit routing is handed to Google Maps rather than
computed here — Mapbox's transit directions are weak in New York, and a deep link opens in
whatever Maps app the person already has.

**Style contract.** Five *styles* live in `styles/styles/`, switched by `data-style` on `<html>`
and persisted to `localStorage`. The full token vocabulary is documented in
`styles/contract.css`, which every style must define in full.

They are styles, not palettes. Colour is one of nine token groups; a style also owns the
typefaces, the silhouette of every surface, the ornament attached to it, the stop markers, the
line threading the stops together, the illustration treatment and the motion. Transit changes
all of them: no cards at all, stops strung as bullets on a thick trunk line, heavy grotesque,
zero radius, instant transitions.

**Two rules keep it honest:**

1. Components never branch on style name. They render semantic *slots* — `.edge`, `.spine`,
   `.index`, `.plate` — and the style decides what each becomes, including `display: none`.
   A `[data-style="transit"]` check inside a component is a bug. This is why Transit can drop
   the botanical plate and Packet can show a cultivar label without either component knowing
   which style is active.
2. **Roles, not just colours.** Text on the page ground is a different role from text on a card:
   Conserva's ground is enamel red while its cards are cream, so `--bg-ink*` and `--ink*` are
   separate, as are `--well-bg` (a recessed surface inside a card) and `--bg-sunken`. Collapsing
   these is how you get dark-red text on a dark-red block.

Adding a sixth style means one file in `styles/styles/` and one row in `lib/styles.ts`.

The map moves with the style rather than sitting there looking borrowed. Raster tiles cannot read
custom properties, so each style sets a `--map-filter` token and `.leaflet-tile-pane` applies it.
Transit and Herbarium invert the tiles; Chalk drops them to slate.

**Illustration.** Six botanical plates live in `components/tomato/Botanical.tsx` — heirloom
beefsteak, sungold truss, cross-section, plum, green zebra, plain round — plus a vine for the
masthead. Which plate a stop gets is **derived from the venue's own wording** in
`lib/variety.ts`: "Sungold Tomato" draws the truss, "Heirloom Tomato" the beefsteak. Where the
venue names no cultivar we draw the plain fruit rather than inventing one, same as every other
field. The plates paint from `--illo-*` tokens so the same drawing is an engraved hairline in
Herbarium and a solid silhouette in Transit.

**Data.** The `Stop` type in `data/stops.ts` is the single source of truth. Derived values
(in-season, walking time, itinerary order) are computed, never stored alongside as duplicates.

**Generated files are not hand-edited.** `data/matrix.json` comes from
`scripts/build-matrix.ts`. Regenerate it; do not patch it. Its walking numbers are great-circle
distance times a 1.25 detour factor — an estimate, and the UI labels them as one. Real routed
timings come from the Google hand-off, never from this file.

**Accessibility is not optional decoration.** Contrast holds in all five themes. Focus rings
survive the styling. `prefers-reduced-motion` disables the squish and vine animations. The route
builder works from the keyboard.

---

## Load these skills first

| Before | Load |
| --- | --- |
| Any component or styling work | `frontend-design`, `ui-ux-pro-max` |
| Writing user-facing copy | `humanizer` |
| Verifying stops against live menus | `claude-in-chrome` |

---

## Commands

```
npm run dev             # local dev
npm run build           # art manifest + check-data + production build
npm run start           # serve the production build
npm run audit           # full Playwright audit — run against a server
npm run matrix          # regenerate data/matrix.json (no token needed)
npm run art             # regenerate data/art-manifest.json after adding artwork
npm run check-data      # assert every shipped stop is confirmed, sourced, and dated
```

**Audit before calling anything done.** `npm run audit` drives a real browser over
every style, six viewports and every interaction: route building and persistence,
filters, search, the day-conflict warning, the map, the transit API, contrast,
focus rings, heading order and reduced motion. Run it against `npm start`, not
`npm run dev` — the dev overlay injects its own markup and skews the results.

It has already caught things review missed: a format pill whose text colour was
`transparent` in two styles, a search input that suppressed its own focus ring,
a nav that forced a horizontal scrollbar at 320px, and a media query written into
the wrong CSS Module, where it matched nothing at all.

`npm run check-data` runs in the build. A stop missing `verifiedOn` or a venue-owned source
fails it. That is the point.

---

## Keeping this file honest

This is a living document. When research settles a real convention, or the design system grows a
rule worth remembering, update this file rather than letting it drift out of date.
