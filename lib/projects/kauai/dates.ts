import { DAN_MAGGIE_ARRIVE, DAN_MAGGIE_DEPART } from './trip';

// Date helpers for the Kauai page. We parse ISO yyyy-mm-dd strings as *local*
// calendar dates (not UTC) so a "2026-07-04" never drifts to the 3rd in a
// browser running west of Greenwich.

/** Parse "2026-07-04" into a local Date at midnight (no timezone surprises). */
export function parseLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** "Friday, July 3" */
export function formatLong(iso: string): string {
  return parseLocal(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/** "Jul 3" */
export function formatShort(iso: string): string {
  return parseLocal(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/** "Fri" */
export function weekday(iso: string): string {
  return parseLocal(iso).toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Whether Dan & Maggie are on-island for a given trip day. Drives the
 * "you + Maggie are here" badge on the calendar. They arrive on
 * DAN_MAGGIE_ARRIVE (2026-07-03) and fly home on DAN_MAGGIE_DEPART (2026-07-11).
 *
 * Design call to make: are the arrival and departure days themselves "present"?
 * They land on the 3rd and fly out on the 11th, so both endpoints arguably
 * count as days they're around.
 */
export function isDanMaggiePresent(iso: string): boolean {
  const day = parseLocal(iso).getTime();
  const arrive = parseLocal(DAN_MAGGIE_ARRIVE).getTime();
  const depart = parseLocal(DAN_MAGGIE_DEPART).getTime();
  // Inclusive on both ends: they're on-island on arrival day (7/3) and on
  // departure day (7/11) until the flight out, so both endpoints count.
  return day >= arrive && day <= depart;
}
