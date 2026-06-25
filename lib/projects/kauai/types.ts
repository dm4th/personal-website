// Types for the Kauai birthday trip page (/projects/kauai).
// A single dataset drives three views: an interactive map, a day-by-day
// calendar, and the lodging cards. Everything is color-coded by one of three
// entity kinds: where we stay, what is locked in, and flexible ideas.

export type Region = 'south' | 'east' | 'north';

/** The three color-coded categories that appear in the legend, map, and calendar. */
export type EntityKind = 'lodging' | 'scheduled' | 'flexible';

export interface Lodging {
  id: string;
  name: string;
  /** Coarse island region, used for the map and grouping. */
  region: Region;
  /** Human-friendly location, e.g. "Wailua, East Shore". */
  area: string;
  /** Check-in date / first night (ISO yyyy-mm-dd). */
  checkIn: string;
  /** Check-out date (ISO yyyy-mm-dd): the morning we leave. Last night is the day before. */
  checkOut: string;
  /** Booking link, lifted straight from Colleen's spreadsheet. */
  url: string;
  /** [lat, lng] — approximate, good enough to orient the family. */
  coords: [number, number];
  /** Optional logistics note, e.g. "check out 11 AM". */
  note?: string;
}

export interface Activity {
  id: string;
  title: string;
  /** "scheduled" = locked-in reservation; "flexible" = optional idea. */
  kind: Extract<EntityKind, 'scheduled' | 'flexible'>;
  /** Short description / what it is. */
  blurb?: string;
  /** ISO date for scheduled items (when it's locked to a day). */
  date?: string;
  /** Display time for scheduled items, e.g. "2:00 PM". */
  time?: string;
  /** Original link from the spreadsheet, when there is one. */
  url?: string;
  /** [lat, lng] for the map pin; omitted items don't get a pin. */
  coords?: [number, number];
}

export interface TripDay {
  /** ISO yyyy-mm-dd. */
  date: string;
  /** Which lodging we sleep at that night (null = travel/none). */
  lodgingId: string | null;
  /** Scheduled activity ids locked to this day. */
  scheduled: string[];
  /** Flexible activity ideas surfaced for this day. */
  flexible: string[];
  /** A trip milestone to highlight, e.g. "Margaret & Dan arrive". */
  milestone?: string;
}

export interface Trip {
  title: string;
  subtitle: string;
  /** Inclusive ISO date bounds of the whole adventure. */
  start: string;
  end: string;
  lodging: Lodging[];
  activities: Record<string, Activity>;
  days: TripDay[];
}
