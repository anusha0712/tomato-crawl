# Research log

Working notes for The Tomato Crawl. Every candidate lands here first, and stays here whether it
ships or not. Rejections carry a reason, because next summer's refresh needs to know what was
already ruled out and why.

**Nothing in this file is a fact.** These are hypotheses to check. Facts live in
`data/stops.ts`, and only after verification against a source the venue controls.

Research opened: **2026-08-31**

---

## How a candidate moves

```
candidate  ->  checked  ->  confirmed  ->  data/stops.ts
                    |
                    +---->  rejected (with reason, stays here)
                    +---->  likely (held back, revisit)
```

`confirmed` requires the item on the venue's own menu, site, or a recent venue post. Press
coverage alone caps a candidate at `likely`.

---

## Standing exclusions

Ruled out by category before any checking, per `CLAUDE.md`:

- **All pizza.** Slice shops, tomato pie, pizza al taglio, Sicilian squares. Excluded by
  instruction, not by merit.
- **Sit-down restaurants**, however good the tomato dish.
- **Tinned tomato, grocery, packaged deli, farm stands.** Buying is not eating.
- **Year-round bar programs.** A bloody mary that pours in February is not a seasonal special.
- **Schmuck** (LES), specifically.

---

## Borderline cases — resolved by the seasonal test

The rule: a special gets in, a permanent fixture does not. Applied to the pizza-adjacent
bakery items, this settles them without needing to argue about what counts as pizza.

| Venue | Item | Call |
| --- | --- | --- |
| Sullivan Street Bakery | Pizza pomodoro | **Out.** Year-round fixture, not a seasonal special. |
| Grandaisy Bakery | Pizza pomodoro | **Out.** Same. |
| Double Chicken Please | "Cold Pizza" cocktail | **Out.** Permanent menu, pours in February. |
| Despaña | Gazpacho | **In if seasonal.** Check whether it runs summer-only. |
| Russ & Daughters | Appetizing counter | **In only if** a genuine seasonal tomato item exists. A tomato slice on a bagel is not one. |
| Sahadi's | Prepared counter | **Out.** Primarily a grocery. |

---

## Candidate frame

Assembled from knowledge of NYC counter culture, to be checked one by one. The "possible item"
column is a **guess about where to look**, not a claim.

---

## Bakery frame

The backbone of the crawl, and deep enough to support a bakery-only route. Grouped into
clusters that are genuinely walkable end to end, so a cluster doubles as a candidate itinerary.

Tomato shows up in bakeries as: focaccia, tart or galette, croissant or danish, savory scone,
pan con tomate, and tomato bread. Those are the things to look for on each menu.

### Cluster A — Greenpoint into Williamsburg

| Venue | Neighborhood | Look for | Status |
| --- | --- | --- | --- |
| Radio Bakery | Greenpoint | Heirloom tomato croissant, tomato focaccia | candidate (top priority) |
| Bakeri | Greenpoint / Williamsburg | Savory tart, seasonal pastry | candidate |
| Sunday to Go | Williamsburg | Seasonal focaccia | candidate |
| She Wolf Bakery | Williamsburg | Bread program, tomato toast | candidate |
| Fabrique Bakery | Williamsburg | Swedish savory, tomato focaccia | candidate |
| Daughter | Greenpoint | Seasonal savory pastry | candidate — confirm still open |
| Nights and Weekends | Greenpoint | Seasonal savory | candidate (low) |

### Cluster B — Cobble Hill, Carroll Gardens, Brooklyn Heights

The old-guard Italian bakeries sit here alongside the new wave. Lard bread and tomato bread are
the thing to ask about.

| Venue | Neighborhood | Look for | Status |
| --- | --- | --- | --- |
| L'Appartement 4F | Brooklyn Heights | Seasonal croissant, savory viennoiserie | candidate (top priority) |
| Bien Cuit | Cobble Hill | Savory tart, tomato focaccia | candidate |
| Mazzola Bakery | Carroll Gardens | Lard bread, tomato bread | candidate |
| Caputo's Bake Shop | Carroll Gardens | Lard bread, tomato bread | candidate |
| Monteleone Bakery | Carroll Gardens | Italian savory | candidate (low) |
| Court Pastry Shop | Cobble Hill | Italian, likely sweet only | candidate (low) |
| Damascus Bread & Pastry | Boerum Hill | Za'atar and tomato flatbread | candidate |

### Cluster C — Park Slope, Gowanus, Prospect Heights

| Venue | Neighborhood | Look for | Status |
| --- | --- | --- | --- |
| Winner | Park Slope | Seasonal tomato tart, focaccia, sandwich | candidate (top priority) |
| Cafe Mado | Prospect Heights | Seasonal savory pastry | candidate |
| Runner & Stone | Gowanus | Savory tart, bread program | candidate |
| Fan-Fan Doughnuts | Prospect Heights | Savory seasonal doughnut | candidate (low) |
| Ovenly | Greenpoint / PS | Savory scone | candidate — confirm retail still open |

### Cluster D — Bed-Stuy and Bushwick

| Venue | Neighborhood | Look for | Status |
| --- | --- | --- | --- |
| Saraghina Bakery | Bed-Stuy | Italian savory, focaccia | candidate |
| Lore Bakery | Bed-Stuy | Seasonal savory pastry | candidate |
| L'Imprimerie | Bushwick | Savory viennoiserie | candidate |
| Bread Brothers Bakery | Bushwick | Bread and focaccia | candidate |
| Circo's Pastry Shop | Bushwick | Old-guard Italian, likely sweet | candidate (low) |

### Cluster E — Lower East Side, East Village, Nolita

| Venue | Neighborhood | Look for | Status |
| --- | --- | --- | --- |
| Librae Bakery | East Village | Seasonal savory pastry | candidate (top priority) |
| Bourke Street Bakery | Nolita / Chelsea | Tomato tart, savory pie | candidate (top priority) |
| Pain D'Avignon | Lower East Side | Savory tart, bread | candidate |
| Parisi Bakery | Nolita | Hero with tomato | candidate |
| Ferrara Bakery | Little Italy | Granita, likely sweet only | candidate (low) |

### Cluster F — West Village, Chelsea, Flatiron

| Venue | Neighborhood | Look for | Status |
| --- | --- | --- | --- |
| Mah-Ze-Dahr Bakery | West Village | Savory seasonal | candidate |
| Amy's Bread | Chelsea / Hell's Kitchen | Tomato focaccia, semolina bread | candidate |
| Daily Provisions | Multiple | Seasonal sandwich and pastry | candidate |
| Fabrique Bakery | NoMad | Savory focaccia | candidate |
| Breads Bakery | Union Square / Bryant Park | Tomato galette, tomato and feta focaccia | **out of season** — July 2026 only |

### Cluster G — Uptown and Midtown

| Venue | Neighborhood | Look for | Status |
| --- | --- | --- | --- |
| Orwashers | Upper East Side | Tomato focaccia, savory bread | candidate |
| Lodi | Rockefeller Center | Seasonal panino, savory | candidate |
| Balthazar Bakery | Soho | Takeaway savory tart | candidate |
| Épicerie Boulud | Upper West Side | Savory tart | candidate (low) |

---

### Brooklyn — Greenpoint / Williamsburg

| Venue | Type | Possible item | Status |
| --- | --- | --- | --- |
| Radio Bakery | bakery | Heirloom tomato croissant; tomato focaccia | candidate (high priority) |
| Frankel's Delicatessen | sandwich | Seasonal tomato sandwich | candidate |
| Gertie | counter | Seasonal tomato plate or sandwich | candidate |
| The Sandwich Shop (Grand St) | sandwich | Tomato-forward sub | candidate |
| L'Industrie | — | — | rejected: pizza |
| Best Pizza | — | — | rejected: pizza |
| Leo | — | — | rejected: pizza, sit-down |
| Fini | — | — | rejected: pizza |
| Taqueria Ramirez | counter | Salsa-forward, likely not tomato-led | candidate (low) |

### Brooklyn — Carroll Gardens / Cobble Hill / Boerum Hill

| Venue | Type | Possible item | Status |
| --- | --- | --- | --- |
| Court Street Grocers | sandwich | Summer tomato sandwich | candidate (high priority) |
| Sahadi's | counter/grocery | Prepared salads | borderline (see above) |
| G. Esposito & Sons | sandwich | Italian sub with tomato | candidate |

### Brooklyn — Park Slope / Prospect Heights / Crown Heights

| Venue | Type | Possible item | Status |
| --- | --- | --- | --- |
| Grandchamps | counter | Haitian, tomato-based sauces | candidate |

### Brooklyn — Bushwick / Bed-Stuy / Industry City

| Venue | Type | Possible item | Status |
| --- | --- | --- | --- |
| Foster Sundry | sandwich | Seasonal tomato sandwich | candidate (high priority) |
| Ends Meat | sandwich | Salumeria sub | candidate |

### Manhattan — Lower East Side / East Village / Nolita / Soho

| Venue | Type | Possible item | Status |
| --- | --- | --- | --- |
| Alidoro | sandwich | Mozzarella and tomato subs | candidate (high priority) |
| Regina's Grocery | sandwich | Italian sub with tomato | candidate |
| Parisi Bakery | sandwich | Hero with tomato | candidate |
| Despaña | counter | Gazpacho | borderline (see above) |
| Di Palo's | counter/grocery | Mozzarella and tomato | borderline |

### Manhattan — West Village / Chelsea / Flatiron

| Venue | Type | Possible item | Status |
| --- | --- | --- | --- |
| Faicco's | sandwich | Italian sub | candidate |
| Bar Pisellino | counter | Tomato panino | candidate |
| S&P Lunch | counter | Lunch-counter tomato item | candidate |

### Manhattan — Midtown / Uptown

| Venue | Type | Possible item | Status |
| --- | --- | --- | --- |
| Russ & Daughters | counter | Appetizing with tomato | borderline |

### Sweets — granita, sorbet, ices

| Venue | Type | Possible item | Status |
| --- | --- | --- | --- |
| Caffè Panna | sweets | Rotating seasonal flavor, tomato has appeared | candidate (high priority) |
| Il Laboratorio del Gelato | sweets | Tomato basil sorbet | candidate (high priority) |
| Morgenstern's | sweets | Unusual seasonal flavor | candidate |
| Van Leeuwen | sweets | Seasonal special | candidate (low) |
| Malai | sweets | Seasonal special | candidate (low) |

### Bars — seasonal tomato drinks only

| Venue | Type | Possible item | Status |
| --- | --- | --- | --- |
| Lindens (Arlo Soho) | bar | Heirloom tomato and Boursin vodka drink | candidate (high priority) |
| Jac's on Bond | bar | Caprese Martini | candidate (high priority) |
| Nothing Really Matters | bar | Margherita Martini | candidate |
| Double Chicken Please | bar | "Cold Pizza" | borderline: year-round fixture |
| Superbueno | bar | Seasonal tomato pour | candidate |
| Le Dive | bar | Seasonal tomato pour | candidate |
| Katana Kitten | bar | Seasonal tomato pour | candidate (low) |
| Overstory | bar | Seasonal tomato pour | candidate (low) |

---

## Checked

### 2026-09-09 — the user's ten items (sheet rows 010-019)

Venue-owned source for every row. Full narrative in `CHECKED.md`, hand-checkable rows in
`REVIEW.md`.

| # | Venue | Item, as the venue writes it | Source kind | Outcome |
| --- | --- | --- | --- | --- |
| 010 | Lisbonata | Heirloom Tomato Soft Serve | instagram | Real; **not on this week**. Weekly rotation |
| 011 | Unnecessary | Tomato, Spice & Everything Nice | instagram | Live; two-week run ends ~09-11. Diet contradiction unresolved |
| 012 | Caffè Panna | Sungold Sundae (not a sorbet) | press only | `likely`. No 2026 venue source found |
| 013 | Frenzie | Sungold Tomato — MOZZ, PARM, GARLIC, STRACCIATELLA, BASIL — $28 | menu | Confirmed. Sit-down format flagged to user |
| 014 | Hani's Bakery | Tomato-Melon Sundae | instagram | Confirmed, live, walk-up window. Strongest row |
| 015 | Hani's Bakery | Heirloom Tomato Toast | menu + instagram | Confirmed. Two venue sources agree |
| 016 | Birdee | Meredith Feta and Sungold Tomato Danish | instagram | Confirmed; venue announced it is ending |
| 017 | Rigor Hill Market | HEIRLOOM TOMATO FOCACCIA | menu | Item confirmed; venue is a grocery, item is a loaf. User's call |
| 018 | Elbow Bread | Burst tomato, saffron, and olive bialys | instagram | Confirmed, daily, seasonal |
| 019 | Go Greek | Greek Salad yogurt bowl | menu (brand-wide) | Tomato element identified; NoHo shop unconfirmed |

Handles resolved from venue-owned sources, replacing guesses: `@lisbonatanyc`,
`@unnecessarynewyork`, `@hanisbakerynyc`, `@birdeenyc`, `@rigorhillmarket`, `@elbowludlow`,
`@frenzie.bk`, `@gogreekyogurtnyc`.

Two corrections to earlier rows. Caffè Panna's tomato item is a **sundae on soft serve**, so it
is dairy, not a sorbet. Elbow Bread is at 1 Ludlow St in Chinatown/LES, not Brooklyn.

Method note: rotating-menu shops (Lisbonata weekly, Unnecessary every Friday, Caffè Panna daily)
cannot be verified once. A confirmed item and an available item are different claims, and this
pass records them separately.

## New leads — 2026-09-12

| Venue | Signal | Next step |
| --- | --- | --- |
| Red Gate Bakery | User reports a tomato cake | **Resolved 2026-09-12 — confirmed and shipping.** End of Summer Cake, golden tomato confit in cornbread layers. 68 E 1st St, `@redgatebakery`. Slice-vs-whole and run length both unresolved |
| Dialogue NYC | User reports a tomato sandwich | **Resolved 2026-09-12 — confirmed and shipping.** `dialogue coffee & flowers`, 188 Allen St, `@dialogue_nyc`. Venue post 2026-09-11. Price still unpublished; dairy/egg unresolved |

Also corrected on 2026-09-12: Unnecessary's "Tomato, Spice & Everything Nice" was marked as a
lapsed run. The venue never named an end date — "around for two weeks" was my inference hardened
into 2026-09-11. The user confirms it is still on the menu. `endsOn` removed.

---

## Rejected

| Venue | Reason |
| --- | --- |
| All pizza venues listed above | Excluded by instruction |
| Schmuck | Excluded by instruction |
