import type { Region } from './types';

// ---------------------------------------------------------------------------
// Gluten-free / celiac dining guide for Kauai. Maggie has celiac, so every
// place is scored on how SAFE it is for cross-contamination, not just whether
// a gluten-free menu exists. Scores are synthesized from celiac-focused review
// sources (Find Me Gluten Free, Nom Nom Paleo, A Table Defloured, amyfillinger,
// Spokin) gathered June 2026.
//
// gfScore rubric (celiac lens):
//   5 = 100% gluten-free facility OR effectively dedicated GF kitchen/fryers
//       + celiac-trained. Lowest cross-contamination risk.
//   4 = dedicated GF fryer and/or chef/owner with celiac; clearly marked menu;
//       staff understand cross-contact.
//   3 = solid GF menu + knowledgeable staff, but a SHARED kitchen/fryer — fine
//       for many celiacs with the usual precautions; always tell your server.
//   2 = GF options exist but real cross-contamination risk — verify in person.
//
// Always remind staff it's celiac (not a preference) and confirm the fryer.
// ---------------------------------------------------------------------------

export interface Restaurant {
  id: string;
  name: string;
  region: Region | 'lihue';
  area: string;
  cuisine: string;
  /** 2–5; see rubric above. */
  gfScore: 2 | 3 | 4 | 5;
  /** The celiac-specific reason behind the score (quoted/paraphrased reviews). */
  why: string;
  /** A best-link for the place (site or Find Me Gluten Free listing). */
  url: string;
  /** Map pin coords [lat, lng], approximate. Omit to keep it list-only. */
  coords?: [number, number];
  /** Flag a standout, e.g. birthday dinner. */
  tag?: string;
}

export const GF_LABELS: Record<number, string> = {
  5: 'Celiac-safe',
  4: 'Great for GF',
  3: 'GF-friendly',
  2: 'Verify in person',
};

export const RESTAURANTS: Restaurant[] = [
  // ----------------- EAST SHORE (Wailua / Kapaʻa) -----------------
  // Closest to Fern Grotto Inn (7/3–7/6) & Kauai Shores (7/11+).
  {
    id: 'tiki-tacos',
    name: 'Tiki Tacos',
    region: 'east',
    area: 'Kapaʻa',
    cuisine: 'Mexican / tacos',
    gfScore: 5,
    why: '100% gluten-free, with house-made corn tortillas and "no flour anywhere on the premises." Big portions, casual.',
    url: 'https://www.findmeglutenfree.com/us/hi/kapaa',
    coords: [22.0876, -159.3380],
  },
  {
    id: 'hukilau-lanai',
    name: 'Hukilau Lanai',
    region: 'east',
    area: 'Kapaʻa (Kauai Coast Resort)',
    cuisine: 'Hawaiian farm-to-table',
    gfScore: 4,
    why: 'Huge separate gluten-free menu with knowledgeable staff, plus gluten-free bread and dessert. A nice sit-down dinner.',
    url: 'https://www.hukilaukauai.com/',
    coords: [22.0700, -159.3290],
    tag: 'Good birthday-dinner option',
  },
  {
    id: 'kiawe-roots',
    name: 'Kiawe Roots',
    region: 'east',
    area: 'Kapaʻa',
    cuisine: 'American / smokehouse',
    gfScore: 4,
    why: 'Clearly marks gluten-free items and has a dedicated gluten-free fryer.',
    url: 'https://www.kiaweroots.com/',
    coords: [22.0922, -159.3372],
  },
  {
    id: 'chicken-barrel',
    name: 'Chicken in a Barrel BBQ',
    region: 'east',
    area: 'Kapaʻa',
    cuisine: 'BBQ',
    gfScore: 3,
    why: "Owner's family has celiac, so they're careful; gluten-free BBQ sauce. Skip the fries (shared fryer).",
    url: 'https://www.chickeninabarrel.com/',
  },
  {
    id: 'papayas',
    name: "Papaya's Natural Foods & Café",
    region: 'east',
    area: 'Kapaʻa',
    cuisine: 'Health café + grocery',
    gfScore: 3,
    why: 'Expansive gluten-free selection (even GF pizza), and a grocery to stock the cabins for celiac-safe meals in.',
    url: 'https://papayasnaturalfoods.com/',
  },

  // ----------------- NORTH SHORE (Kīlauea / Hanalei / Hāʻena) -----------------
  // Closest to the Haena Coastal Cabin (7/7–7/10).
  {
    id: 'sushi-girl',
    name: 'Sushi Girl Kauai',
    region: 'north',
    area: 'Kīlauea (Kong Lung Center)',
    cuisine: 'Sushi / poke',
    gfScore: 5,
    why: '100% gluten-free food truck: sushi rolls, poke, musubi, GF soy sauce throughout. No gluten on site.',
    url: 'https://www.sushigirlkauai.com/',
    coords: [22.2117, -159.4060],
  },
  {
    id: 'avalon',
    name: 'Avalon Gastropub',
    region: 'north',
    area: 'Kīlauea',
    cuisine: 'Gastropub',
    gfScore: 4,
    why: 'Dedicated gluten-free fryer and "a great understanding of celiac"; gluten-free items clearly marked.',
    url: 'https://www.avalongastropub.com/',
    coords: [22.2125, -159.4036],
  },
  {
    id: 'fresh-bite',
    name: 'Fresh Bite Kauai',
    region: 'north',
    area: 'Hanalei (food truck)',
    cuisine: 'Farm-to-beach bowls',
    gfScore: 4,
    why: 'Dedicated gluten-free fryer plus a celiac protocol for cleaning the grill and changing gloves.',
    url: 'https://www.findmeglutenfree.com/us/hi/hanalei',
    coords: [22.2050, -159.4980],
  },
  {
    id: 'baracuda',
    name: 'Bar Acuda',
    region: 'north',
    area: 'Hanalei',
    cuisine: 'Mediterranean tapas',
    gfScore: 3,
    why: 'Lots of naturally gluten-free tapas and accommodating staff. Reservations are a must. Shared kitchen, so tell them celiac.',
    url: 'https://restaurantbaracuda.com/',
    coords: [22.2046, -159.4995],
  },
  {
    id: 'tahiti-nui',
    name: 'Tahiti Nui',
    region: 'north',
    area: 'Hanalei',
    cuisine: 'Hawaiian / pizza, live music',
    gfScore: 3,
    why: 'Gluten-free Hawaiian dishes and gluten-free pizza; fun dive-bar vibe with live music.',
    url: 'https://www.thenui.com/',
  },
  {
    id: 'hanalei-bread',
    name: 'Hanalei Bread Co.',
    region: 'north',
    area: 'Hanalei',
    cuisine: 'Café / bakery',
    gfScore: 2,
    why: 'Has gluten-free breads/pastries, but it is an active bakery, so flour is in the air. Treat as higher-risk for celiac.',
    url: 'https://www.hanaleibreadco.com/',
  },

  // ----------------- SOUTH SHORE (Poipū / Kōloa) -----------------
  // Near Marjorie's (6/30–7/2) and an easy day trip from the East Shore.
  {
    id: 'merrimans',
    name: "Merriman's Poipu",
    region: 'south',
    area: 'Kōloa (Kukuiʻula)',
    cuisine: 'Hawaii Regional fine dining',
    gfScore: 5,
    why: 'The chef has celiac and the kitchen is meticulous about cross-contamination, and very sensitive celiacs report zero issues. The safest special-occasion pick.',
    url: 'https://www.merrimanshawaii.com/poipu/',
    coords: [21.8880, -159.4730],
    tag: 'Top birthday-dinner pick',
  },
  {
    id: 'friendly-waves',
    name: 'Friendly Waves',
    region: 'south',
    area: 'Kōloa',
    cuisine: 'Comfort food / fried',
    gfScore: 5,
    why: 'Every fryer is gluten-free and all flours are GF (cassava, taro, rice). Separate utensils, pans and boards for any celiac order.',
    url: 'https://www.findmeglutenfree.com/biz/friendly-waves/6307242503176192',
    coords: [21.9069, -159.4690],
  },
  {
    id: 'holoholo',
    name: 'Holoholo Grill',
    region: 'south',
    area: 'Kōloa (Koloa Landing Resort)',
    cuisine: 'American / all-day',
    gfScore: 4,
    why: 'Large clearly-marked gluten-free menu and staff knowledgeable about cross-contact. No dedicated fryer, so skip fried items.',
    url: 'https://www.koloalandingresort.com/kauai-restaurants/',
    coords: [21.8930, -159.4640],
  },
  {
    id: 'rumfire',
    name: 'RumFire Poipu Beach',
    region: 'south',
    area: 'Poʻipū (Sheraton)',
    cuisine: 'Oceanfront American',
    gfScore: 3,
    why: 'Plenty of clearly marked gluten-free items; kitchen and servers are well-practiced with celiac requests. Right on Poʻipū Beach.',
    url: 'https://www.rumfirepoipu.com/',
  },

  // ----------------- LIHUʻE (by the airport) -----------------
  // Handy on arrival/departure days.
  {
    id: 'sweet-maries',
    name: "Sweet Marie's Hawaii",
    region: 'lihue',
    area: 'Lihuʻe (near the airport)',
    cuisine: 'Bakery',
    gfScore: 5,
    why: '100% dedicated gluten-free and allergen-friendly bakery: breads, pastries, and treats Maggie can grab on the way in or out.',
    url: 'https://www.sweetmarieskauai.com/',
    coords: [21.9750, -159.3720],
  },
];
