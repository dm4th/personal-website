import type { Trip, Activity } from './types';

// ---------------------------------------------------------------------------
// Jeff's 60th Birthday Adventure — Kauai, June 30 – July 13, 2026.
// Transcribed from Colleen's "Kauai Birthday Adventure.xlsx", including every
// embedded link. Coordinates are approximate (hand-placed) — accurate enough
// to orient the family on the map, not for turn-by-turn navigation.
//
// Dan & Maggie ("Margaret & Dan") overlap the middle: arrive 7/3, fly home 7/11.
// ---------------------------------------------------------------------------

/** Dan & Maggie's overlap window — used to badge "you're here" days. */
export const DAN_MAGGIE_ARRIVE = '2026-07-03';
export const DAN_MAGGIE_DEPART = '2026-07-11';

// Activity catalog. Flexible ideas recur across multiple days, so we define
// each once here and reference them by id from the day-by-day timeline.
const ACTIVITIES: Record<string, Activity> = {
  // --- Scheduled, locked-in reservations ---
  'napali-boat': {
    id: 'napali-boat',
    title: 'Nā Pali Coast boat tour',
    kind: 'scheduled',
    blurb: 'Makana Charters: sea caves, waterfalls, and the towering Nā Pali cliffs from the water.',
    date: '2026-07-06',
    time: '2:00 PM',
    url: 'https://makanacharters.com/',
    coords: [21.8967, -159.5906], // departs Port Allen
  },
  'lydgate-farms': {
    id: 'lydgate-farms',
    title: 'Lydgate Farms chocolate tour',
    kind: 'scheduled',
    blurb: 'Award-winning farm tour and chocolate tasting in the Wailua uplands.',
    date: '2026-07-07',
    time: '12:00 PM',
    url: 'https://lydgatefarms.com/',
    coords: [22.0584, -159.3782],
  },
  'kalalau-hike': {
    id: 'kalalau-hike',
    title: 'Kalalau Trail hike (Nā Pali Coast)',
    kind: 'scheduled',
    blurb: 'The legendary cliffside trail along the Nā Pali Coast. Early shuttle, so pack water and reef-safe everything.',
    date: '2026-07-09',
    time: '6:30 AM shuttle',
    url: 'https://dlnr.hawaii.gov/dsp/parks/kauai/napali-coast-state-wilderness-park/park-info/',
    coords: [22.2218, -159.5825], // Keʻe Beach trailhead
  },
  'merrimans-dinner': {
    id: 'merrimans-dinner',
    title: "Dinner at Merriman's Poʻipū",
    kind: 'scheduled',
    // No coords on purpose: Merriman's already shows as a pink dining pin, so we
    // don't double up the map. This entry just puts the reservation on the calendar.
    blurb: 'The celiac-safe pick (the chef has celiac). In Poʻipū, so head to Poʻipū Beach for fireworks after.',
    date: '2026-07-04',
    time: '5:15 PM',
    url: 'https://www.merrimanshawaii.com/poipu/',
  },

  // --- Flexible ideas (South Shore) ---
  'mahaulepu-trail': {
    id: 'mahaulepu-trail',
    title: 'Mahaʻulepu Heritage Trail',
    kind: 'flexible',
    blurb: 'Rugged, beautiful coastal hiking route along the undeveloped south coast.',
    coords: [21.8716, -159.4286],
  },
  'kauai-coffee': {
    id: 'kauai-coffee',
    title: 'Kauaʻi Coffee Estate',
    kind: 'flexible',
    blurb: 'Largest coffee farm in the US, with a self-guided walk and free tastings.',
    coords: [21.9178, -159.5540],
  },
  'poipu-beach': {
    id: 'poipu-beach',
    title: 'Poʻipū Beach Park',
    kind: 'flexible',
    blurb: 'Snorkeling, sunsets, and basking Hawaiian green sea turtles (honu).',
    coords: [21.8742, -159.4530],
  },
  'spouting-horn': {
    id: 'spouting-horn',
    title: 'Spouting Horn',
    kind: 'flexible',
    blurb: 'Natural ocean blowhole that geysers seawater through a lava tube.',
    coords: [21.8817, -159.4925],
  },
  'poipu-fireworks': {
    id: 'poipu-fireworks',
    title: '4th of July fireworks',
    kind: 'flexible',
    blurb: 'Independence Day fireworks over Poʻipū Beach Park.',
    coords: [21.8742, -159.4530],
  },

  // --- Flexible ideas (East Shore / Wailua) ---
  'wailua-kayak': {
    id: 'wailua-kayak',
    title: 'Kayak the Wailua River + Secret Falls',
    kind: 'flexible',
    blurb: 'Paddle the Wailua River, then hike to Uluwehi (Secret) Falls.',
    coords: [22.0452, -159.3470],
  },
  'opaekaa-falls': {
    id: 'opaekaa-falls',
    title: 'ʻŌpaekaʻa Falls',
    kind: 'flexible',
    blurb: 'Roadside lookout over a wide 150-ft waterfall.',
    coords: [22.0571, -159.3635],
  },
  'coastal-path': {
    id: 'coastal-path',
    title: 'Bike Ke Ala Hele Makalae',
    kind: 'flexible',
    blurb: 'Flat coastal multi-use path along the East Shore. Easy beach cruising.',
    coords: [22.0796, -159.3106],
  },
  'lydgate-beach': {
    id: 'lydgate-beach',
    title: 'Snorkel Lydgate Beach Park',
    kind: 'flexible',
    blurb: 'Protected rock-walled ponds: calm, kid-friendly snorkeling.',
    coords: [22.0382, -159.3361],
  },
  'waimea-canyon': {
    id: 'waimea-canyon',
    title: 'Waimea Canyon',
    kind: 'flexible',
    blurb: 'The "Grand Canyon of the Pacific," with dramatic red-rock lookouts.',
    coords: [22.0749, -159.6651],
  },

  // --- Flexible ideas (North Shore) ---
  'hanalei': {
    id: 'hanalei',
    title: 'Hanalei town & Bay',
    kind: 'flexible',
    blurb: 'Crescent bay, mountain backdrop, and a laid-back surf town to wander.',
    coords: [22.2047, -159.4994],
  },
  'hanakapiai-falls': {
    id: 'hanakapiai-falls',
    title: 'Hanakāpīʻai Falls',
    kind: 'flexible',
    blurb: 'Strenuous trek off the Kalalau Trail to a 300-ft waterfall.',
    coords: [22.1850, -159.5940],
  },
  'tunnels-beach': {
    id: 'tunnels-beach',
    title: 'Snorkel Tunnels Beach',
    kind: 'flexible',
    blurb: 'Reef-rich North Shore snorkeling (Makua Beach).',
    coords: [22.2248, -159.5602],
  },
  'kee-beach': {
    id: 'kee-beach',
    title: 'Keʻe Beach',
    kind: 'flexible',
    blurb: 'End-of-the-road beach and reef lagoon at the foot of Nā Pali.',
    coords: [22.2265, -159.5826],
  },
  'anini-beach': {
    id: 'anini-beach',
    title: 'Anini Beach',
    kind: 'flexible',
    blurb: 'Long, calm, reef-protected beach. Great for relaxing and family swims.',
    coords: [22.2176, -159.4470],
  },
  'kilauea-lighthouse': {
    id: 'kilauea-lighthouse',
    title: 'Kīlauea Lighthouse',
    kind: 'flexible',
    blurb: 'Historic lighthouse and seabird refuge on a dramatic North Shore point.',
    coords: [22.2314, -159.4021],
  },
};

export const TRIP: Trip = {
  title: "Jeff's 60th Birthday Adventure",
  subtitle: 'Kauaʻi · June 30 – July 13, 2026',
  start: '2026-06-30',
  end: '2026-07-13',
  activities: ACTIVITIES,
  lodging: [
    {
      id: 'marjorie',
      name: "Marjorie's Kauai Inn",
      region: 'south',
      area: 'Lāwaʻi, South Shore',
      checkIn: '2026-06-30',
      checkOut: '2026-07-03',
      url: 'https://www.marjorieskauaiinn.com/',
      coords: [21.9206, -159.5046],
    },
    {
      id: 'fern-grotto',
      name: 'Fern Grotto Inn',
      region: 'east',
      area: 'Wailua / Kapaʻa, East Shore',
      checkIn: '2026-07-03',
      checkOut: '2026-07-06',
      url: 'https://kauaicottages.com/',
      coords: [22.0497, -159.3380],
      note: '4561 Kuamoo Rd · check out 11 AM on the 6th',
    },
    {
      id: 'haena',
      name: 'Haena Coastal Cabin',
      region: 'north',
      area: 'Hāʻena, North Shore',
      checkIn: '2026-07-06',
      checkOut: '2026-07-10',
      url: 'https://www.airbnb.com/rooms/1216246522690503949',
      coords: [22.2203, -159.5660],
      note: 'check out 10 AM on the 10th',
    },
    {
      id: 'kauai-shores',
      name: 'Kauai Shores Hotel',
      region: 'east',
      area: 'Kapaʻa, East Shore',
      checkIn: '2026-07-10',
      checkOut: '2026-07-13',
      url: 'https://www.kauaishoreshotel.com/',
      coords: [22.0731, -159.3270],
    },
  ],
  days: [
    {
      date: '2026-06-30',
      lodgingId: 'marjorie',
      scheduled: [],
      flexible: ['mahaulepu-trail', 'kauai-coffee'],
    },
    {
      date: '2026-07-01',
      lodgingId: 'marjorie',
      scheduled: [],
      flexible: ['mahaulepu-trail', 'kauai-coffee', 'poipu-beach'],
    },
    {
      date: '2026-07-02',
      lodgingId: 'marjorie',
      scheduled: [],
      flexible: ['spouting-horn', 'poipu-beach', 'kauai-coffee'],
    },
    {
      date: '2026-07-03',
      lodgingId: 'fern-grotto',
      scheduled: [],
      flexible: ['wailua-kayak', 'coastal-path', 'opaekaa-falls', 'lydgate-beach'],
      milestone: 'Margaret & Dan arrive 🌺',
    },
    {
      date: '2026-07-04',
      lodgingId: 'fern-grotto',
      scheduled: ['merrimans-dinner'],
      flexible: ['waimea-canyon', 'poipu-fireworks'],
      milestone: '4th of July',
    },
    {
      date: '2026-07-05',
      lodgingId: 'fern-grotto',
      scheduled: [],
      flexible: ['wailua-kayak', 'coastal-path', 'opaekaa-falls', 'lydgate-beach'],
    },
    {
      date: '2026-07-06',
      lodgingId: 'haena',
      scheduled: ['napali-boat'],
      flexible: ['poipu-beach', 'spouting-horn', 'mahaulepu-trail'],
      milestone: 'Move to the North Shore',
    },
    {
      date: '2026-07-07',
      lodgingId: 'haena',
      scheduled: ['lydgate-farms'],
      flexible: ['hanalei', 'tunnels-beach', 'kee-beach', 'anini-beach'],
    },
    {
      date: '2026-07-08',
      lodgingId: 'haena',
      scheduled: [],
      flexible: ['hanalei', 'hanakapiai-falls', 'tunnels-beach', 'anini-beach'],
    },
    {
      date: '2026-07-09',
      lodgingId: 'haena',
      scheduled: ['kalalau-hike'],
      flexible: [],
    },
    {
      date: '2026-07-10',
      lodgingId: 'kauai-shores',
      scheduled: [],
      flexible: ['kilauea-lighthouse'],
    },
    {
      date: '2026-07-11',
      lodgingId: 'kauai-shores',
      scheduled: [],
      flexible: [],
      milestone: 'Margaret & Dan fly home ✈️',
    },
    {
      date: '2026-07-12',
      lodgingId: 'kauai-shores',
      scheduled: [],
      flexible: [],
    },
    {
      date: '2026-07-13',
      lodgingId: null,
      scheduled: [],
      flexible: [],
      milestone: 'Colleen, Jeff & N fly home ✈️',
    },
  ],
};
