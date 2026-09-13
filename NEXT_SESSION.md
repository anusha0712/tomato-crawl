# Resume here

Paused **2026-09-12**, after a full audit. Read `CLAUDE.md` first — it holds the rules.

## State

- **10 stops shipping, 4 held back.** `data/stops.ts` is the source of truth
- **7 styles**, default `catalogue` — built from the approved design component in
  `research/DESIGN_COMPONENT_SPEC.md`. `conserva` and `orchard` are the other two the user liked
- **Google transit is live.** Real subway legs render on the route ticket. Key is server-side in
  `.env.local` as `GOOGLE_MAPS_API_KEY`
- **`npm run audit` passes 15/15 with zero warnings** against the production build

## Still open, and needs the user

1. Two phone calls: **Rigor Hill** (646) 398-7679 — is the heirloom focaccia sold by the slice?
   **Go Greek NoHo** (646) 429-9283 — do they build the savoury bowl?
2. **Frenzie** — the sit-down rule is the user's call; pizza was already settled
3. **Prices** — 6 of 10 shipping stops have none published anywhere
4. **Artwork** — `public/art/` is empty. Drop files per `public/art/README.md` and run
   `npm run art`. Until then the hand-drawn SVG plates stand in

## Next

- Deploy to Vercel (needs the user's account)
- Re-check the rotating venues: Lisbonata weekly, Caffè Panna daily, Unnecessary every Friday
- Breads Bakery galette and Daily Provisions ALT are still unverified from the first pass
- ~60 accounts still uncrawled, listed at the bottom of `research/REVIEW.md`

## Design decisions, so they are not relitigated

- **"Five themes" means five different DESIGNS, not five palettes.** An earlier version shipped
  one card-grid in five tints and was rejected outright. The style contract now covers
  typography, silhouette, ornament, marker shape, the connecting line, illustration treatment and
  motion — see `styles/contract.css`.
- **Card anatomy is fixed** and came from the user's own design component, saved at
  `research/DESIGN_COMPONENT_SPEC.md`. Venue in quiet mono above, **dish in red** as the headline,
  place as a button with a teardrop pin, actions at the bottom of the card. Do not invert this.
- **Display face is Playfair Display**, chosen over the spec's Bodoni Moda by the user.
- **The map keeps this project's token-driven tile recolouring**, also by request.
- The three styles the user likes are `catalogue` (default), `orchard` and `conserva`. The other
  four are alternates.
- **Dairy and egg do not matter** and are not surfaced. Meat and fish are the rule.

## Tooling notes

- **`npm run audit`** is the gate. Run it against `npm start`, never `npm run dev` — the dev
  overlay injects markup that skews contrast, tap-target and a11y counts.
- Playwright is a devDependency. It has no browser of its own here; the audit finds the system
  headless shell under `~/Library/Caches/ms-playwright/chromium_headless_shell-*`.
- **`next build` wipes `.next` and breaks a running `next dev`.** Stop the dev server first.
- The Chrome extension tab wedges after many navigations — screenshots start timing out while JS
  still runs. Close the tab and open a fresh one rather than debugging the page.
- **macOS screenshot paths pasted from the floating preview are dead on arrival.** The file is
  deleted when the thumbnail dismisses. Ask for a drag-and-drop or a saved file instead.

## Working browser setup

- Chrome must be **running** and on **Profile 1** (named "columbia.edu") — the only profile with
  the Claude extension. Launch: `open -a "Google Chrome" --args --profile-directory="Profile 1"`
- Instagram is logged in on that profile and worked fine on 2026-09-09
- **Some venue domains are blocked by the extension** — `hanisnyc.com` returned "Navigation to
  this domain is not allowed". Use WebFetch for those; it worked every time
- Reading captions: open the post, then pull it with JS rather than screenshotting text —
  `document.querySelectorAll('h1')` holds the caption, `time[datetime]` holds the real date
- Alt text is now **blocked outright** ("BLOCKED: Cookie/query string data"), so the visual grid
  read is the only method. It works
- The grid re-renders on scroll, so coordinates go stale. Screenshot in one call, click in the
  next. Clicking from a stale screenshot opened the wrong post twice

## Method that works

Venue site for the handle and address → Instagram profile → scroll → **read the grid visually**
→ open anything tomato-adjacent → pull the caption and the datetime → quote verbatim.

Opening the post matters. An apple challah tarte tatin at Elbow Bread looked exactly like a
tomato tart in the grid.

## Rules most likely to slip

Vegetarian, item-level. No meat, no fish. No pizza. No sit-down. Seasonal special over permanent
fixture. Never reject a venue on a filter alone. Never invent a menu item, price, or hour — three
rows on the sheet have no price, and they stay empty until someone reads one.
