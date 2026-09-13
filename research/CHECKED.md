# Checked

Verification passes. Date checked is the date the venue's own source was read.
Nothing here is a claim about any other date.

## Confirmed

### Radio Bakery — Greenpoint (135 India St) and Prospect Heights (186 Underhill Ave)
Checked **2026-09-02** · source: venue menu
`https://www.radiobakery.nyc/greenpointmenu` · `https://www.radiobakery.nyc/prospectheightsmenu`

Both locations run an identical menu. Four tomato items live right now:

| Item | Description | Price | Read |
| --- | --- | --- | --- |
| Heirloom Tomato croissant | — | $8 | Seasonal. The headline stop. |
| Heirloom Tomato & Feta sandwich | mint, olive oil, sherry vinegar, oregano, focaccia | $15 | Seasonal. Strong second. |
| Tomato & Garlic focaccia slice (v) | — | $6 | Likely year-round |
| Shakshuka focaccia slice | spiced tomato sauce, baked eggs, sumac | $9 | Year-round, cooked sauce |

Hours: daily 7:30am–6pm **or until sold out**. Sell-out risk is real and belongs in the data.
Two locations means a Radio stop can anchor both the Greenpoint and Prospect Heights clusters.

---

## Pending — needs an Instagram check

### Librae Bakery — 35 Cooper Sq
Checked **2026-09-02** · source: venue menu · `https://libraebakery.com/menu/`

No tomato item named on the posted menu. But the menu lists **"Seasonal Foccacia"** without
saying what is on it, and it is peak tomato season. The website cannot answer this; a recent
post can. Holding at pending rather than rejecting.

---

## Rejected

### Winner — 367 7th Ave, Park Slope
Checked **2026-09-02** · source: venue menu · `https://www.winner.nyc/location/winner-bakery/`

Tomato appears only in places the rules exclude:
- Four pizzas (Roja, Margarita, Spicy Pepperoni, Sausage & Peppers) — pizza is excluded
- BLT with heirloom tomato, $17 — a permanent BLT, and the rules exclude a BLT that is only a BLT
- Tuna melt, $18 — tomato is incidental
- Focaccia by the slice rotates jalapeño & fontina, olive & thyme, red onion, squash & sage — no
  tomato in the rotation today

Worth re-checking next summer in case the focaccia rotation turns.

### L'Appartement 4F — 115 Montague St, Brooklyn Heights / 119 W 10th St
Checked **2026-09-02** · source: venue menu · `https://lappartement4f.com/menu`

Four tomato dishes exist — Heirloom Tomato Toast, Tuna Crudo with tomato concasse, Tomato Pie,
Roasted Swordfish — but all sit on the **L'Apéro wine bar** menu, which is table service in the
evening. The bakery counter itself lists no tomato item. Out on the sit-down rule, not on merit.

---

## Second pass — 2026-09-02

Bulk-scanned ~30 venue sites with Playwright. Results below.

### Tomato found, but the item is permanent rather than seasonal

These have real tomato items. Under a strict seasonal-only reading, all are out.

| Venue | Item | Note |
| --- | --- | --- |
| Regina's Grocery | Fresh Mozzarella, Tomato, Pesto, Arugula on stirato; plus two heroes with tomato | Permanent menu |
| Despaña | Pan con tomate — "Catalan style bread with grated tomato, garlic + olive oil", plus ~10 tapas with tomato | Permanent menu |
| Saraghina Bakery | "Olives, Tomato, Oregano" | Likely a pizza topping — needs confirming |

### Strong lead, menu did not render

| Venue | Signal |
| --- | --- |
| Daily Provisions | Homepage carries the line **"While tomatoes are peak."** — an explicit seasonal tomato item. The menu page is a JS widget that did not render. High priority. |

### Rejected

| Venue | Reason |
| --- | --- |
| Il Laboratorio del Gelato | Full flavor list checked. No tomato flavor of any kind. |
| Winner | Pizza and a permanent BLT only |
| L'Appartement 4F | Tomato only on the sit-down wine bar menu |

### Pending an Instagram check

| Venue | Question Instagram answers |
| --- | --- |
| Librae Bakery | What is the "Seasonal Foccacia" right now? |
| Caffè Panna | Daily rotating flavors — is tomato in rotation? |
| Bourke Street, Orwashers, Amy's Bread, Frankel's, Bien Cuit, Runner & Stone, Pain D'Avignon, Foster Sundry, Alidoro, Miznon, Bar Pisellino, Lodi, S&P Lunch | Menus are JS ordering widgets or images that did not render |

### Verified Instagram handles

Collected from each venue's own site, so these are real rather than guessed:
`alidoronyc` · `fostersundry` · `bourkestreetbakerynyc` · `biencuit` · `saraghinabakery` ·
`orwashers` · `amysbread` · `dailyprov` · `runnerandstone` · `pain.davignon` · `frankelsdeli` ·
`reginasgrocery` · `bakeribrooklyn` · `shewolfbakery` · `despananyc` · `barpisellino` ·
`courtstreetgrocers`

**Handle warning:** `@radiobakery` is a home baker in St. Petersburg, Russia, not the Brooklyn
bakery. Never guess a handle — take it from the venue's own site.

### Method note

Logged-out Instagram returns bio and follower count only. Post captions are behind the login
wall, confirmed against three accounts. Reading captions needs a logged-in session.

---

## Instagram pass — 2026-09-02

Method that works: load the profile (the JSON API returns 429), pair each post link to its
image alt text — Meta auto-tags ingredients, so "tomato" in the alt is a reliable filter — then
open the flagged posts to read the caption. Identity is verified from the profile header on
every venue, so no handle is guessed.

### Daily Provisions — CONFIRMED, seasonal
`@dailyprov` · Daily Provisions · 80K followers · multiple locations

**The ALT** — "avocado, lettuce, **peak summer tomato** & pesto"
Posted **2026-08-20** · `instagram.com/dailyprov/p/DcRM9k1qxle/`

**The BLT on ciabatta** — "The BLT is back — on ciabatta! Crispy bacon, **peak summer tomato**,
and crunchy romaine. Available at all locations **for a limited time**"
Posted **2026-07-23** · `instagram.com/dailyprov/p/DbIukJUltkl/`

Explicit limited-time framing on the BLT, and "peak summer tomato" on both. This is the exact
shape of thing the crawl is for.

**Open flag worth carrying into the data:** a commenter asked on the ALT post, *"Will you still
have this in September?"* — and the venue never answered. Today is 2 September. Availability
must be re-checked before this ships, and the site's own line "While tomatoes are peak" reads
like the window is closing.

**Rules note:** the BLT is a BLT, which the exclusion list normally rejects. It is included here
only because it is an explicit limited-time seasonal return rather than a standing menu item.
The ALT is the stronger of the two and should lead.

### Frankel's Delicatessen — inconclusive
`@frankelsdeli` · 44.3K followers · Greenpoint

Alt text on a 2026-07-17 post tags tomato, but the caption is only "Friday at Frankel's, open
8:30-3pm!" — no item named. Cannot confirm a menu item from this. Needs another pass.

### Foster Sundry — CONFIRMED, seasonal
`@fostersundry` · 13.2K followers · Bushwick
Posted **~2026-08-05** · `instagram.com/fostersundry/p/Da5zG66pw2H/`

> "Okay, it's time. Our take on the **BLT this year** involves a yuzu kosho mayo and a top
> secret steak spice blend **on the tomatoes**. Come and get it!"

"It's time" and "this year" both mark it as an annual seasonal return. The yuzu kosho mayo and
spiced tomatoes make it a distinct preparation rather than a default BLT.

### Court Street Grocers — CONFIRMED, seasonal
`@courtstreetgrocers` · 27K followers · Carroll Gardens, Williamsburg, Manhattan
Posted **2026-07-29** · `instagram.com/courtstreetgrocers/p/DbY5xcFiRNH/`

The post image is a hand-drawn menu board reading "**BLT heirloom**"; the caption says "ready to
rip at **all three shops**." Commenters confirm it is a returning summer fixture ("Last summer I
had a BLT on stecca every single day for breakfast").

Caption alone is vague — the item name comes from the menu board in the image. Worth zooming the
image to transcribe the full board before this ships.

Note: their posted website menu lists **no** tomato sandwich. Instagram was the only place this
existed. That is the whole argument for the Instagram pass.

### Regina's Grocery — no seasonal tomato item
`@reginasgrocery` · The flagged post is "The Ciro," a cutlet sandwich. Tomato is not the subject.

### No tomato signal in recent posts
Checked 2026-09-02, profile grids scanned with keyword filter:
`bourkestreetbakerynyc` · `orwashers` · `amysbread` · `biencuit` · `shewolfbakery` ·
`bakeribrooklyn` · `saraghinabakery` · `alidoronyc` · `despananyc` · `lappartement4f` ·
`caffepanna`

Caveat: this filter reads Meta's auto-generated image alt text, which does not describe every
image. Absence here is weaker evidence than a confirmed hit. These deserve a second look before
final rejection.

---

## Third pass — 2026-09-09 · your ten items

All ten checked against a source the venue controls. Handles were taken from each venue's own
site or Instagram bio rather than guessed. Every grid named below was read visually.

### Confirmed and available now

**Hani's Bakery — 67 Cooper Square**
Checked **2026-09-09** · sources: venue Instagram `@hanisbakerynyc` + venue menu `hanisnyc.com`

Two items, at opposite ends of the day.

| Item | Source | When |
| --- | --- | --- |
| Tomato-Melon Sundae | post 2026-09-05, https://www.instagram.com/p/Dc6Ps5nkWqk/ | Window only: Fri from 5pm, Sat/Sun from 5:30pm, until 9pm |
| Heirloom Tomato Toast | post 2026-07-31, https://www.instagram.com/p/DbdUKfNkSdI/ + site menu | Opening until 4pm, or sold out |

The sundae was posted as new four days ago: honey-roasted tomatoes, Kiss melon, candied almonds,
lemon verbena oil. Contains almonds and honey. The window hours are their own words from a
2026-08-14 post: "Every Friday (from 5 pm), Saturday, and Sunday (from 5:30 pm) until 9 pm."

The toast is the one item on this sheet backed by two venue-owned sources that agree. The site
menu line is "Heirloom Tomato Toast — pimento cheese, herbs, sourdough english muffin". The
posted menu is still headed "SAMPLE AUGUST MENU", so it needs one look before the crawl.

A single Hani's visit cannot collect both. The toast is daytime, the sundae is Friday–Sunday
evening.

**Elbow Bread — 1 Ludlow St**
Checked **2026-09-09** · source: venue Instagram `@elbowludlow`
Post 2026-08-15: https://www.instagram.com/p/DcEF3JUESaJ/

"Burst tomato, saffron, and olive bialys hitting our soft spot this morning. Available daily
while the tomato gettins gooooood."

Daily, and tied to the season with no end date. The venue is in Chinatown/LES, not Brooklyn as
the earlier note assumed. The old "website would not resolve" blocker is closed — the bio
carries the address. Run by `@zoekanan` with `@sandplunch` and `@courtstreetgrocers`. On Rosh
Hashanah preorder pickup 9/10–9/13.

**Birdee — 316 Kent Ave**
Checked **2026-09-09** · source: venue Instagram `@birdeenyc`
Post 2026-08-29: https://www.instagram.com/p/DcoQis4ETFi/

"It won't be long before our menu changes and our summer specials are gone forever. Get these
while you still can" — listing the Meredith Feta and Sungold Tomato Danish. The venue has
announced its own end. Eleven days have passed since. Go soon or drop it.

**Unnecessary — 66 Delancey St**
Checked **2026-09-09** · source: venue Instagram `@unnecessarynewyork`
Post 2026-08-28: https://www.instagram.com/p/DcltOu4jiHh/

"Tomato, Spice & Everything Nice" — heirloom tomatoes, peaches, yellow pepper, sweet corn,
habanero, sweet basil oil, parmesan crisp. "This one is around for two weeks" puts the last day
near 2026-09-11.

Their caption says "Dairy-free, gluten-free, alcohol-free" and in the previous paragraph names a
parmesan crisp. Their own grid tile tags the flavor DAIRY. The contradiction is theirs; it is
recorded rather than resolved. Alcohol-free is well supported — the tile tags other flavors
ALCOHOL and does not tag this one.

**Frenzie — 129 Atlantic Ave**
Checked **2026-09-09** · source: venue menu `frenzienyc.com` · handle `@frenzie.bk` off their site

Menu line: "Sungold Tomato — MOZZ, PARM, GARLIC, STRACCIATELLA, BASIL — $28". A 14-inch pie.
Walk-ins only, 50 seats indoor and outdoor, opens 4pm.

The pizza question was settled by the user on 2026-09-08 and is not reopened. Separately, the
seated-wine-bar format and the 14-inch size run into the sit-down rule and the "one item quickly
and leave" test. Recorded for the user, left in.

### Real, but off the menu this week

**Lisbonata — 619 Saint John's Pl**
Checked **2026-09-09** · source: venue Instagram `@lisbonatanyc`

Heirloom Tomato Soft Serve is confirmed real and fully described by the venue on 2026-08-18
(https://www.instagram.com/p/DcMkqbThVu-/): roasted heirloom tomatoes blended into the base,
finished with tomato compote, basil EVOO, pastel de nata flakes and Maldon salt.

It is not on now. They posted **today** that this week's special is tahini & pekmez, "Available
from today through Sunday" (https://www.instagram.com/p/DdETNpzRpjP/).

A weekly rotating special that has already returned once by demand. It cannot be scheduled in
advance, only checked in the crawl week. The earlier "no egg" tag is withdrawn — the topping is
pastel de nata flakes and no source says whether egg is in them.

Their own hours disagree across two venue-owned sources: the bio says Wed–Sun 8am–8pm with soft
serve from 11am; the website says Wed–Sun 8am–6pm.

### Still unresolved

**Caffè Panna — 16 Norman Ave, Greenpoint**
Checked **2026-09-09** · sources: venue site, venue Instagram, press

The item is the **Sungold Sundae**, not a sorbet — Fior di Panna soft serve with Sungold
tomatoes, basil, Tuscan olive oil, saba, sea salt. It is dairy. "Caprese" comes from a press
line describing it, not from the menu.

Their own 2025 post is titled "Sungold Sundae is making its annual return at Caffe Panna"
(2025-07-16, https://www.instagram.com/p/DMKm5vwOvmz/) but its caption would not load, and it is
last year. **No 2026 venue-owned sighting was found.** Press alone caps this at `likely`, so it
cannot ship.

What is on now: Peach Yuzu soft serve, posted 2026-09-02, "Both stores through Sunday".

The user was right that one grid check on one day settles nothing. It does not settle the
negative either — this needs a look at the shop menu during the crawl week.

**Rigor Hill Market — 227 W Broadway**
Checked **2026-09-09** · source: venue menu `rigorhillmarket.com/breakfast-lunch`

"HEIRLOOM TOMATO FOCACCIA" is on their own menu, with no price and no description. It sits in
the **breads** list beside SOURDOUGH, 7-GRAIN, BAGUETTE and SEEDED LOAF, which reads as a loaf
rather than a slice. Nothing says it is sold cut.

Their own Instagram category is "Grocery Store" and the bio reads "A neighborhood market, in
Tribeca."

Both facts push against the rules — the loaf against "buying is not eating", the category against
the grocery exclusion. The item is real; the venue may not qualify. One call asking whether the
focaccia is sold by the slice would settle it. Not rejected on my own judgment.

Other tomato items there, none of which qualify: avocado toast with cherry tomato, a TOMATO
soup, a veggie sandwich with spicy pomodoro. All permanent.

**Go Greek — 683 Broadway**
Checked **2026-09-09** · source: brand menu `gogreekyogurt.com/pages/in-store-menu` + venue
Instagram `@gogreekyogurtnyc`

The tomato element is the **Greek Salad** handcrafted yogurt bowl — yogurt, cucumbers, olives,
tomatoes. That answers what the dish is.

Two gaps. The menu page is brand-wide, not the NoHo shop's own. And the NYC account's grid,
read visually across two screens, is entirely sweet frozen yogurt — NYU promotions, a Greek
Biscuit soft serve, a Match Point Bowl. No savory bowl appears on it at all.

Also a permanent fixture, which the seasonal test argues against. Included by the user's call on
2026-09-08 and not reopened. One call to 683 Broadway would confirm they build it.


---

## Fourth pass — 2026-09-12 · your Dialogue lead

**dialogue coffee & flowers — 188 Allen St**
Checked **2026-09-12** · sources: venue Instagram `@dialogue_nyc` + venue site `dialogue.nyc`
Post 2026-09-11: https://www.instagram.com/p/DdJcVudEQT5/

"HEIRLOOM TOMATO HERB FOCACCIA SANDWICH WITH THAI BASIL AIOLI AND SMOKED CHILI OIL. AVAILABLE NOW"

Posted the day before you raised it, which makes this the most current row on the sheet. Address
and 7am–5pm daily hours come off their own site. No price published anywhere.

Worth noting how this one nearly got missed: a plain search for "Dialogue NYC tomato sandwich"
returned nothing but coffee and flowers, and two separate summaries stated outright that the
venue does not serve sandwiches. Reading the grid found it in the first row. Search absence is
not absence — same lesson as the Librae danish.

Diet is unresolved rather than assumed. Aioli is normally egg-based. Several third-party pages
describe Dialogue as a vegan cafe, but the venue's own bio and site do not claim it, so it is not
recorded as fact.


---

## Fifth pass — 2026-09-12 · Red Gate Bakery

**Red Gate Bakery — 68 E 1st St**
Checked **2026-09-12** · sources: venue Instagram `@redgatebakery` + venue site `redgatebakery.com`
Post 2026-09-11: https://www.instagram.com/p/DdJqMqGjmTa/

The **End of Summer Cake** — cornbread layers swirled with golden tomato confit, strawberry-
pluot-basil jam, salt-and-pepper buttercream.

Their posted menu names no tomato item at all. It lists cookies, brownies, loaves and celebration
cakes, and would have produced a clean rejection. The cake is a weekly Friday special that lives
only on Instagram — the third time now that reading the grid has found something the website
denied. Librae, Dialogue, and now this.

Two things are deliberately not recorded as fact:

1. **Slice or whole.** No venue-owned source says. A cake shop's weekly cake is normally sold by
   the slice, but that is an assumption, and the Rigor Hill focaccia is a standing reminder of
   what assuming costs. Recorded as a caveat on the row.
2. **How long it runs.** The post hints at a replacement in seven days but names no end date, so
   `endsOn` is left unset — the same mistake made with Unnecessary on 2026-09-11 and corrected.
