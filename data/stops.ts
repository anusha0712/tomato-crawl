/**
 * The single source of truth for the crawl.
 *
 * Rules that govern this file, from CLAUDE.md:
 *   - Nothing enters here unless it was read off a source the venue controls.
 *   - Never invent a menu item, price, address, or hours. A field that could not
 *     be confirmed is OMITTED, not guessed. Several stops below have no price
 *     for exactly this reason.
 *   - Item names are written the way the venue writes them, not tidied up.
 *   - Derived values (in season, walking time, itinerary order) are COMPUTED in
 *     lib/, never stored here as a second copy that can drift.
 *
 * Coordinates were geocoded from the verified street address, not eyeballed.
 */

export type Borough = 'Manhattan' | 'Brooklyn'

/** Venue-owned sources outrank third-party press. A stop resting on `press` alone cannot be `confirmed`. */
export type SourceKind = 'menu' | 'instagram' | 'press'

export type Status = 'confirmed' | 'likely' | 'unverified'

/**
 * What you actually do at the venue. This drives the crawl, because the whole
 * premise is grabbing one thing and moving on.
 */
export type Format = 'window' | 'counter' | 'bakery' | 'sweets' | 'seated'

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export const WEEK: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export interface Source {
  kind: SourceKind
  url: string
  label: string
  /** Verbatim. Never a paraphrase of a caption or a menu line. */
  quote?: string
  /** ISO date the source itself carries, which is not the date we read it. */
  postedOn?: string
}

/**
 * "Vegetarian" has an ambiguous edge and most tomato pastries sit on it, so
 * dairy, egg and fish are stated explicitly rather than assumed. `unknown` is a
 * real and useful answer — see Lisbonata, where the topping is pastel de nata
 * flakes and no source says whether egg is in them.
 */
export type Certainty = 'yes' | 'no' | 'unknown'

export interface Diet {
  vegetarian: true
  dairy: Certainty
  egg: Certainty
  fish: Certainty
  nuts?: Certainty
  honey?: Certainty
  /** Anything the tags alone would misrepresent. */
  note?: string
}

export interface Hours {
  days: Weekday[]
  /** 24h "HH:MM". Omitted when the venue never stated it. */
  opens?: string
  closes?: string
  /** e.g. "or until sold out" — the venue's own qualifier. */
  note?: string
}

export interface Stop {
  id: string
  venue: string
  /** The item exactly as the venue writes it. */
  item: string
  handle?: string

  address: string
  neighborhood: string
  borough: Borough
  /** [lat, lng], geocoded from the address above. */
  coords: [number, number]

  format: Format
  /** Omitted unless read off a menu. Do not fill this in from memory or a review. */
  price?: number

  diet: Diet
  hours: Hours[]

  /** The venue's OWN words about the season. Rendered in quotation marks, so
   *  nothing but a verbatim phrase may go here. */
  season?: string
  /** Our own read on the season. Rendered as plain text, never quoted. */
  seasonNote?: string
  /** ISO date the run is known to end, when the venue named one. */
  endsOn?: string

  status: Status
  /** ISO date the source was read. Not a claim about any other date. */
  verifiedOn: string
  sources: Source[]

  /** Shown in the UI wherever the stop appears. Held-back stops must carry one. */
  caveat?: string

  /** An estimate for itinerary maths, not a fact from the venue. */
  dwellMinutes: number
}

export const STOPS: Stop[] = [
  {
    id: 'redgate-summer-cake',
    venue: 'Red Gate Bakery',
    item: 'End of Summer Cake',
    handle: '@redgatebakery',
    address: '68 E 1st St, New York, NY 10003',
    neighborhood: 'East Village',
    borough: 'Manhattan',
    coords: [40.7235287, -73.9888253],
    format: 'bakery',
    diet: {
      vegetarian: true,
      dairy: 'yes',
      egg: 'yes',
      fish: 'no',
      note: 'Salt-and-pepper buttercream, and a strawberry-pluot-basil jam filling.',
    },
    hours: [
      { days: ['tue', 'wed', 'thu', 'fri'], opens: '11:00', closes: '18:00' },
      { days: ['sat'], opens: '11:00', closes: '16:00' },
    ],
    season: "we've got a couple of weeks of summer left",
    status: 'confirmed',
    verifiedOn: '2026-09-12',
    sources: [
      {
        kind: 'instagram',
        url: 'https://www.instagram.com/p/DdJqMqGjmTa/',
        label: 'Venue post',
        postedOn: '2026-09-11',
        quote:
          'our End of Summer Cake! another sweet-and-savory mashup of all things great this time of year, this masterpiece has cornbread cake layers swirled with golden tomato confit, a strawberry-pluot-basil jam filling, and a salt-and-pepper buttercream',
      },
      {
        kind: 'menu',
        url: 'https://redgatebakery.com/menu/',
        label: 'Venue site, for address and hours',
      },
    ],
    caveat:
      'Two open questions. The venue has not said whether this is sold by the slice or only whole — ask before you cross town. And their post hints at a new cake next Friday, so this one may not last the week. A commenter asking whether it runs all weekend went unanswered.',
    dwellMinutes: 12,
  },

  {
    id: 'dialogue-focaccia',
    venue: 'dialogue coffee & flowers',
    item: 'Heirloom tomato herb focaccia sandwich',
    handle: '@dialogue_nyc',
    address: '188 Allen St, New York, NY 10002',
    neighborhood: 'Lower East Side',
    borough: 'Manhattan',
    coords: [40.7171834, -73.9912601],
    format: 'counter',
    diet: {
      vegetarian: true,
      dairy: 'unknown',
      egg: 'unknown',
      fish: 'no',
    },
    hours: [{ days: WEEK, opens: '07:00', closes: '17:00' }],
    seasonNote: 'Heirloom, so summer.',
    status: 'confirmed',
    verifiedOn: '2026-09-12',
    sources: [
      {
        kind: 'instagram',
        url: 'https://www.instagram.com/p/DdJcVudEQT5/',
        label: 'Venue post',
        postedOn: '2026-09-11',
        quote:
          'HEIRLOOM TOMATO HERB FOCACCIA SANDWICH WITH THAI BASIL AIOLI AND SMOKED CHILI OIL. AVAILABLE NOW',
      },
      {
        kind: 'menu',
        url: 'https://www.dialogue.nyc/',
        label: 'Venue site, for address and hours',
      },
    ],
    dwellMinutes: 12,
  },

  {
    id: 'hanis-sundae',
    venue: "Hani's Bakery",
    item: 'Tomato-Melon Sundae',
    handle: '@hanisbakerynyc',
    address: '67 Cooper Square, New York, NY 10003',
    neighborhood: 'Astor Place',
    borough: 'Manhattan',
    coords: [40.7291237, -73.9899774],
    format: 'window',
    diet: {
      vegetarian: true,
      dairy: 'yes',
      egg: 'unknown',
      fish: 'no',
      nuts: 'yes',
      honey: 'yes',
      note: 'Contains almonds. Tomatoes are honey-roasted, so not vegan.',
    },
    hours: [
      { days: ['fri'], opens: '17:00', closes: '21:00', note: 'the window, after hours' },
      { days: ['sat', 'sun'], opens: '17:30', closes: '21:00', note: 'the window, after hours' },
    ],
    seasonNote: 'Posted as new on 5 September.',
    status: 'confirmed',
    verifiedOn: '2026-09-09',
    sources: [
      {
        kind: 'instagram',
        url: 'https://www.instagram.com/p/Dc6Ps5nkWqk/',
        label: 'Venue post announcing the sundae',
        postedOn: '2026-09-05',
        quote:
          "Sit up because I want to talk to you about the new TOMATO-MELON SUNDAE at Hani's. There's honey-roasted tomatoes, slivers of juicy Kiss melon (the BEST melon), a whole lot of candied almonds, and a drizzle of lemon verbena oil.",
      },
      {
        kind: 'instagram',
        url: 'https://www.instagram.com/p/DcCWMnpRX6d/',
        label: 'Venue post stating the window hours',
        postedOn: '2026-08-14',
        quote: 'Every Friday (from 5 pm), Saturday, and Sunday (from 5:30 pm) until 9 pm.',
      },
    ],
    dwellMinutes: 15,
  },

  {
    id: 'hanis-toast',
    venue: "Hani's Bakery",
    item: 'Heirloom Tomato Toast',
    handle: '@hanisbakerynyc',
    address: '67 Cooper Square, New York, NY 10003',
    neighborhood: 'Astor Place',
    borough: 'Manhattan',
    coords: [40.7291237, -73.9899774],
    format: 'bakery',
    diet: {
      vegetarian: true,
      dairy: 'yes',
      egg: 'no',
      fish: 'no',
      note: 'No anchovy.',
    },
    hours: [
      { days: ['mon', 'tue', 'wed', 'thu', 'fri'], opens: '07:30', closes: '16:00', note: 'or whenever it sells out' },
      { days: ['sat', 'sun'], opens: '08:00', closes: '16:00', note: 'or whenever it sells out' },
    ],
    seasonNote: 'Heirloom, so summer.',
    status: 'confirmed',
    verifiedOn: '2026-09-09',
    sources: [
      {
        kind: 'menu',
        url: 'https://www.hanisnyc.com/menu',
        label: "Venue menu, headed “Sample August Menu”",
        quote: 'Heirloom Tomato Toast — pimento cheese, herbs, sourdough english muffin',
      },
      {
        kind: 'instagram',
        url: 'https://www.instagram.com/p/DbdUKfNkSdI/',
        label: 'Venue post introducing it',
        postedOn: '2026-07-31',
        quote:
          "HEIRLOOM TOMATO TOAST is new to the menu and it bringeth the bounty to us. The “toast” is actually our squishy, airy sourdough english muffin(!). Pimento cheese, dill flowers, snippets of chive. Like all the sandwiches at Hani's, this one is available from opening until 4pm (or whenever it sells out).",
      },
    ],
    caveat: 'The posted menu is still headed August. Worth one look before you go.',
    dwellMinutes: 15,
  },

  {
    id: 'elbow-bialy',
    venue: 'Elbow Bread',
    item: 'Burst tomato, saffron, and olive bialys',
    handle: '@elbowludlow',
    address: '1 Ludlow St, New York, NY 10002',
    neighborhood: 'Chinatown / LES',
    borough: 'Manhattan',
    coords: [40.7145745, -73.9912904],
    format: 'bakery',
    diet: {
      vegetarian: true,
      dairy: 'unknown',
      egg: 'unknown',
      fish: 'no',
    },
    hours: [{ days: WEEK, note: 'Available daily. The venue has not posted opening times.' }],
    season: 'while the tomato gettins gooooood',
    status: 'confirmed',
    verifiedOn: '2026-09-09',
    sources: [
      {
        kind: 'instagram',
        url: 'https://www.instagram.com/p/DcEF3JUESaJ/',
        label: 'Venue post',
        postedOn: '2026-08-15',
        quote:
          'Burst tomato, saffron, and olive bialys hitting our soft spot this morning. Available daily while the tomato gettins gooooood.',
      },
    ],
    dwellMinutes: 10,
  },

  {
    id: 'unnecessary-tomato',
    venue: 'Unnecessary',
    item: 'Tomato, Spice & Everything Nice',
    handle: '@unnecessarynewyork',
    address: '66 Delancey St, New York, NY 10002',
    neighborhood: 'Lower East Side',
    borough: 'Manhattan',
    coords: [40.7195035, -73.9905455],
    format: 'sweets',
    diet: {
      vegetarian: true,
      dairy: 'unknown',
      egg: 'no',
      fish: 'no',
      note: 'Alcohol-free, which is worth knowing here — this shop spikes some flavors.',
    },
    hours: [{ days: ['tue', 'wed', 'thu', 'fri'], opens: '15:30', closes: '23:00', note: 'Weekend hours not captured.' }],
    season: 'the last stretch of our favorite summer produce',
    status: 'confirmed',
    verifiedOn: '2026-09-09',
    sources: [
      {
        kind: 'instagram',
        url: 'https://www.instagram.com/p/DcltOu4jiHh/',
        label: 'Venue post',
        postedOn: '2026-08-28',
        quote:
          'Heirloom tomatoes, peaches, yellow pepper, sweet corn, and a hit of habanero — this flavor is fruity, savory, a little sweet and a little spicy. We top it off with a drizzle of sweet basil oil for extra herbaceousness, and a generous parmesan crisp for an umami kick. Every Friday we drop something new. This one is around for two weeks.',
      },
    ],
    caveat:
      'The venue said "around for two weeks" on 28 August without naming an end date, and it was still on the menu on 12 September. Rotating shop — check the week you go.',
    dwellMinutes: 15,
  },

  {
    id: 'birdee-danish',
    venue: 'Birdee',
    item: 'Meredith Feta and Sungold Tomato Danish',
    handle: '@birdeenyc',
    address: '316 Kent Ave, Brooklyn, NY 11249',
    neighborhood: 'Williamsburg',
    borough: 'Brooklyn',
    coords: [40.7136455, -73.9671479],
    format: 'bakery',
    diet: {
      vegetarian: true,
      dairy: 'yes',
      egg: 'unknown',
      fish: 'no',
    },
    hours: [{ days: WEEK, opens: '08:00', closes: '16:00' }],
    season: 'summer specials',
    status: 'confirmed',
    verifiedOn: '2026-09-09',
    sources: [
      {
        kind: 'instagram',
        url: 'https://www.instagram.com/p/DcoQis4ETFi/',
        label: 'Venue post',
        postedOn: '2026-08-29',
        quote:
          "It won't be long before our menu changes and our summer specials are gone forever. Get these while you still can — Meredith Feta and Sungold Tomato Danish",
      },
    ],
    caveat: 'The venue announced its own ending on 29 August. Go soon.',
    dwellMinutes: 12,
  },

  {
    id: 'radio-croissant',
    venue: 'Radio Bakery',
    item: 'Heirloom tomato croissant',
    handle: '@radio.bakery',
    address: '135 India St, Brooklyn, NY 11222',
    neighborhood: 'Greenpoint',
    borough: 'Brooklyn',
    coords: [40.7323874, -73.9549952],
    format: 'bakery',
    price: 8,
    diet: { vegetarian: true, dairy: 'yes', egg: 'no', fish: 'no' },
    hours: [{ days: WEEK, opens: '07:30', closes: '18:00', note: 'or until sold out' }],
    seasonNote: 'Heirloom, so summer.',
    status: 'confirmed',
    verifiedOn: '2026-09-02',
    sources: [
      {
        kind: 'menu',
        url: 'https://www.radiobakery.nyc/greenpointmenu',
        label: 'Venue menu',
        quote: 'heirloom tomato — $8',
      },
    ],
    caveat: 'Also runs at 186 Underhill Ave in Prospect Heights, on the same menu.',
    dwellMinutes: 12,
  },

  {
    id: 'radio-sandwich',
    venue: 'Radio Bakery',
    item: 'Heirloom tomato & feta sandwich',
    handle: '@radio.bakery',
    address: '135 India St, Brooklyn, NY 11222',
    neighborhood: 'Greenpoint',
    borough: 'Brooklyn',
    coords: [40.7323874, -73.9549952],
    format: 'bakery',
    price: 15,
    diet: { vegetarian: true, dairy: 'yes', egg: 'no', fish: 'no' },
    hours: [{ days: WEEK, opens: '07:30', closes: '18:00', note: 'or until sold out' }],
    seasonNote: 'Heirloom, so summer.',
    status: 'confirmed',
    verifiedOn: '2026-09-02',
    sources: [
      {
        kind: 'menu',
        url: 'https://www.radiobakery.nyc/greenpointmenu',
        label: 'Venue menu',
        quote: 'heirloom tomato & feta — mint, olive oil, sherry vinegar, oregano, focaccia — $15',
      },
    ],
    dwellMinutes: 12,
  },

  {
    id: 'librae-danish',
    venue: 'Librae Bakery',
    item: 'Corn custard & tomato chutney danish',
    handle: '@libraebakery',
    address: '35 Cooper Square, New York, NY 10003',
    neighborhood: 'East Village',
    borough: 'Manhattan',
    coords: [40.7280946, -73.9908774],
    format: 'bakery',
    diet: {
      vegetarian: true,
      dairy: 'yes',
      egg: 'unknown',
      fish: 'no',
    },
    hours: [{ days: ['fri', 'sat', 'sun'], note: 'Weekends only, Friday through Sunday' }],
    season: 'the last days of August and tomato season',
    status: 'confirmed',
    verifiedOn: '2026-09-02',
    sources: [
      {
        kind: 'instagram',
        url: 'https://www.instagram.com/libraebakery/p/DcivQjdFo1K/',
        label: 'Venue post',
        postedOn: '2026-08-27',
        quote:
          'Savoring the last days of August and tomato season! This is our corn custard & tomato chutney danish with whipped goat cheese, za’atar olive oil, and sungold tomatoes. Weekends only, Friday through Sunday!',
      },
    ],
    caveat: 'Sells out. A commenter asking about same-day stock went unanswered.',
    dwellMinutes: 12,
  },

  {
    id: 'frenzie-pie',
    venue: 'Frenzie',
    item: 'Sungold Tomato',
    handle: '@frenzie.bk',
    address: '129 Atlantic Ave, Brooklyn, NY 11201',
    neighborhood: 'Brooklyn Heights',
    borough: 'Brooklyn',
    coords: [40.6907175, -73.9957705],
    format: 'seated',
    price: 28,
    diet: {
      vegetarian: true,
      dairy: 'yes',
      egg: 'no',
      fish: 'no',
      note: 'No anchovy listed.',
    },
    hours: [
      { days: ['mon', 'tue', 'wed'], opens: '16:00', closes: '00:00' },
      { days: ['thu', 'fri'], opens: '16:00', closes: '02:00' },
      { days: ['sat'], opens: '14:00', closes: '02:00' },
      { days: ['sun'], opens: '14:00', closes: '00:00' },
    ],
    status: 'confirmed',
    verifiedOn: '2026-09-09',
    sources: [
      {
        kind: 'menu',
        url: 'https://www.frenzienyc.com/',
        label: 'Venue menu',
        quote: 'Sungold Tomato — MOZZ, PARM, GARLIC, STRACCIATELLA, BASIL — $28',
      },
    ],
    caveat:
      'A 50-seat wine bar opening at 4pm, and the pie is 14 inches. Included by your call. It is not a grab-and-go stop.',
    dwellMinutes: 45,
  },
]

/**
 * Real items at real venues that cannot ship yet. They are kept in the codebase
 * rather than deleted so that next summer's refresh knows what was already
 * chased, and so the UI can show them behind a visible caveat.
 */
export const HELD_BACK: Stop[] = [
  {
    id: 'lisbonata-softserve',
    venue: 'Lisbonata',
    item: 'Heirloom Tomato Soft Serve',
    handle: '@lisbonatanyc',
    address: "619 Saint John's Pl, Brooklyn, NY 11238",
    neighborhood: 'Crown Heights',
    borough: 'Brooklyn',
    coords: [40.672615, -73.95767],
    format: 'sweets',
    diet: {
      vegetarian: true,
      dairy: 'yes',
      egg: 'unknown',
      fish: 'no',
    },
    hours: [
      { days: ['wed', 'thu', 'fri', 'sat', 'sun'], opens: '11:00', closes: '20:00', note: 'soft serve from 11am, or sell out' },
    ],
    season: 'Back by popular request',
    status: 'likely',
    verifiedOn: '2026-09-09',
    sources: [
      {
        kind: 'instagram',
        url: 'https://www.instagram.com/p/DcMkqbThVu-/',
        label: 'Venue post, the last run',
        postedOn: '2026-08-18',
        quote:
          'We roast a ridiculous amount of fresh heirloom tomatoes, cook them down, strain them, and blend them directly into the soft serve base. Finished with heirloom tomato compote, basil EVOO, pastel de nata flakes and Maldon salt.',
      },
      {
        kind: 'instagram',
        url: 'https://www.instagram.com/p/DdETNpzRpjP/',
        label: 'Venue post showing this week is a different flavor',
        postedOn: '2026-09-09',
        quote: "This week's special goes back to tahini & pekmez. Available from today through Sunday (11am-8pm)",
      },
    ],
    caveat:
      'Off the menu this week. A weekly rotating special that has already come back once by demand, so check the week you go.',
    dwellMinutes: 15,
  },

  {
    id: 'caffe-panna-sungold',
    venue: 'Caffè Panna',
    item: 'Sungold Sundae',
    handle: '@caffepanna',
    address: '16 Norman Ave, Brooklyn, NY 11222',
    neighborhood: 'Greenpoint',
    borough: 'Brooklyn',
    coords: [40.7242739, -73.9548547],
    format: 'sweets',
    diet: {
      vegetarian: true,
      dairy: 'yes',
      egg: 'unknown',
      fish: 'no',
      note: 'Built on Fior di Panna soft serve. It is a sundae, not a sorbet.',
    },
    hours: [{ days: ['wed', 'thu', 'fri', 'sat', 'sun'], opens: '13:30', closes: '21:30' }],
    status: 'likely',
    verifiedOn: '2026-09-09',
    sources: [
      {
        kind: 'instagram',
        url: 'https://www.instagram.com/p/DMKm5vwOvmz/',
        label: 'Venue post from last year, captioned as an annual return',
        postedOn: '2025-07-16',
      },
      { kind: 'press', url: 'https://www.theinfatuation.com/new-york/reviews/caffe-panna-greenpoint', label: 'Press' },
    ],
    caveat:
      'No 2026 venue sighting found. Press alone caps this at likely, so it cannot ship. Flavors rotate daily here.',
    dwellMinutes: 20,
  },

  {
    id: 'rigor-hill-focaccia',
    venue: 'Rigor Hill Market',
    item: 'HEIRLOOM TOMATO FOCACCIA',
    handle: '@rigorhillmarket',
    address: '227 W Broadway, New York, NY 10013',
    neighborhood: 'Tribeca',
    borough: 'Manhattan',
    coords: [40.719253, -74.006164],
    format: 'counter',
    diet: { vegetarian: true, dairy: 'unknown', egg: 'unknown', fish: 'no' },
    hours: [{ days: WEEK, opens: '08:00', closes: '19:00' }],
    status: 'likely',
    verifiedOn: '2026-09-09',
    sources: [
      {
        kind: 'menu',
        url: 'https://rigorhillmarket.com/breakfast-lunch',
        label: 'Venue menu, breads section',
        quote: 'HEIRLOOM TOMATO FOCACCIA',
      },
    ],
    caveat:
      'On their menu under breads, beside sourdough and baguette, so it reads as a loaf rather than a slice. The venue also calls itself a Grocery Store. Both collide with the rules. One call would settle it.',
    dwellMinutes: 10,
  },

  {
    id: 'go-greek-bowl',
    venue: 'Go Greek',
    item: 'Greek Salad yogurt bowl',
    handle: '@gogreekyogurtnyc',
    address: '683 Broadway, New York, NY 10012',
    neighborhood: 'NoHo',
    borough: 'Manhattan',
    coords: [40.727967, -73.994755],
    format: 'counter',
    diet: { vegetarian: true, dairy: 'yes', egg: 'no', fish: 'no' },
    hours: [{ days: WEEK, opens: '11:00', closes: '23:00' }],
    status: 'likely',
    verifiedOn: '2026-09-09',
    sources: [
      {
        kind: 'menu',
        url: 'https://gogreekyogurt.com/pages/in-store-menu',
        label: 'Brand menu, not the NoHo shop’s own page',
        quote: 'Greek Salad bowl with yogurt, cucumbers, olives, and tomatoes',
      },
    ],
    caveat:
      'The tomato element is confirmed, but the menu page is brand-wide and the NYC account shows only sweet frozen yogurt. Also a permanent fixture rather than a seasonal special.',
    dwellMinutes: 10,
  },
]

export const ALL_STOPS: Stop[] = [...STOPS, ...HELD_BACK]

export function stopById(id: string): Stop | undefined {
  return ALL_STOPS.find((s) => s.id === id)
}
