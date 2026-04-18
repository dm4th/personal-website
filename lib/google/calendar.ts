import { getDannyAccessToken } from '@/lib/auth/googleOAuth';

export type BusySlot = { start: string; end: string };
export type CalendarSlot = { start: Date; end: Date };

export async function getDannyBusySlots(
  windowStart: Date,
  windowEnd: Date,
): Promise<BusySlot[]> {
  const accessToken = await getDannyAccessToken();

  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timeMin: windowStart.toISOString(),
      timeMax: windowEnd.toISOString(),
      items: [{ id: 'primary' }],
    }),
  });

  if (!res.ok) throw new Error(`freeBusy API failed: ${res.status}`);
  const json = await res.json();
  return (json.calendars?.primary?.busy ?? []) as BusySlot[];
}

export function findAvailableSlots(
  windowStart: Date,
  windowEnd: Date,
  durationMinutes: number,
  busySlots: BusySlot[],
  maxSlots = 6,
): CalendarSlot[] {
  const durationMs = durationMinutes * 60 * 1000;
  const stepMs = 30 * 60 * 1000;
  const slots: CalendarSlot[] = [];

  const busy = busySlots
    .map((b) => ({ start: new Date(b.start).getTime(), end: new Date(b.end).getTime() }))
    .sort((a, b) => a.start - b.start);

  let cursor = windowStart.getTime();
  const windowEndMs = windowEnd.getTime();

  while (cursor + durationMs <= windowEndMs && slots.length < maxSlots) {
    const slotEnd = cursor + durationMs;
    const hourUTC = new Date(cursor).getUTCHours();

    // Only offer 8am–5pm UTC (approximates PST 12am–9pm / EST 3am–12pm)
    // Callers should pass a sensible window in Dan's timezone
    if (hourUTC < 16 || hourUTC >= 24) {
      // Translate to PT: UTC-7 (PDT). 9am PT = 16:00 UTC, 5pm PT = 00:00 UTC next day
      // Simpler: just filter for 9am–5pm PT = 16–24 UTC
      if (hourUTC < 16) {
        cursor += stepMs;
        continue;
      }
    }

    // Actually let's just use a simple approach: offer 9am-5pm PST
    // 9am PST = 17:00 UTC, 5pm PST = 01:00 UTC+1
    // Use hourPT = (hourUTC - 7 + 24) % 24
    const hourPT = (hourUTC - 7 + 24) % 24;
    if (hourPT < 9 || hourPT >= 17) {
      cursor += stepMs;
      continue;
    }

    const overlaps = busy.some((b) => b.start < slotEnd && b.end > cursor);
    if (!overlaps) {
      slots.push({ start: new Date(cursor), end: new Date(slotEnd) });
    }

    cursor += stepMs;
  }

  return slots;
}

export async function createCalendarEvent(opts: {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  attendeeEmail: string;
  timezone: string;
}): Promise<string> {
  const accessToken = await getDannyAccessToken();

  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: opts.summary,
        description: opts.description,
        start: { dateTime: opts.start.toISOString(), timeZone: opts.timezone },
        end: { dateTime: opts.end.toISOString(), timeZone: opts.timezone },
        attendees: [{ email: opts.attendeeEmail }],
      }),
    },
  );

  if (!res.ok) throw new Error(`Event creation failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.id as string;
}
