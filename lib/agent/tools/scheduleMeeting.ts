import { getDannyBusySlots, findAvailableSlots, type CalendarSlot } from '@/lib/google/calendar';

export type ScheduleMeetingInput = {
  purpose: string;
  durationMinutes: 15 | 30 | 45 | 60;
  windowStart: string;
  windowEnd: string;
  timezone?: string;
};

export type MeetingSlot = {
  start: string;
  end: string;
  label: string;
};

export type ScheduleMeetingOutput = {
  suggestedSlots: MeetingSlot[];
  purpose: string;
  durationMinutes: number;
};

export const scheduleMeetingTool = {
  name: 'schedule_meeting',
  description:
    "Find available meeting slots on Dan's calendar and propose times to a visitor. Use this when a visitor wants to schedule a call or meeting. Returns proposed slots they can select from. Booking requires signing in.",
  input_schema: {
    type: 'object' as const,
    properties: {
      purpose: {
        type: 'string',
        description: 'What the meeting is about (e.g. "chat about a potential role", "technical deep dive on agent SDKs")',
      },
      durationMinutes: {
        type: 'number',
        enum: [15, 30, 45, 60],
        description: 'Desired meeting length in minutes',
      },
      windowStart: {
        type: 'string',
        description: 'Start of the scheduling window, ISO 8601 (e.g. "2026-04-21")',
      },
      windowEnd: {
        type: 'string',
        description: 'End of the scheduling window, ISO 8601 (e.g. "2026-04-28")',
      },
      timezone: {
        type: 'string',
        description: 'Visitor\'s timezone (e.g. "America/New_York"). Defaults to "America/Los_Angeles".',
      },
    },
    required: ['purpose', 'durationMinutes', 'windowStart', 'windowEnd'],
  },
};

function formatSlotLabel(start: Date, end: Date, tz: string): string {
  const dateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: tz,
  }).format(start);
  const startTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit', timeZone: tz,
  }).format(start);
  const endTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short', timeZone: tz,
  }).format(end);
  return `${dateStr}, ${startTime}–${endTime}`;
}

export async function scheduleMeeting(
  input: ScheduleMeetingInput,
): Promise<{ ok: true; data: ScheduleMeetingOutput; summary: string } | { ok: false; error: string }> {
  try {
    const tz = input.timezone ?? 'America/Los_Angeles';
    const windowStart = new Date(input.windowStart);
    const windowEnd = new Date(input.windowEnd);

    if (isNaN(windowStart.getTime()) || isNaN(windowEnd.getTime())) {
      return { ok: false, error: 'Invalid date window - use ISO 8601 format (e.g. "2026-04-21")' };
    }

    // Expand to cover full days in PT
    windowStart.setUTCHours(0, 0, 0, 0);
    windowEnd.setUTCHours(23, 59, 59, 999);

    const busySlots = await getDannyBusySlots(windowStart, windowEnd);
    const available = findAvailableSlots(windowStart, windowEnd, input.durationMinutes, busySlots);

    const suggestedSlots: MeetingSlot[] = available.map((s: CalendarSlot) => ({
      start: s.start.toISOString(),
      end: s.end.toISOString(),
      label: formatSlotLabel(s.start, s.end, tz),
    }));

    const output: ScheduleMeetingOutput = {
      suggestedSlots,
      purpose: input.purpose,
      durationMinutes: input.durationMinutes,
    };

    const count = suggestedSlots.length;
    return {
      ok: true,
      data: output,
      summary: count > 0
        ? `Found ${count} open slot${count !== 1 ? 's' : ''} for a ${input.durationMinutes}-min meeting`
        : 'No open slots found in that window - try a different date range',
    };
  } catch (err) {
    const msg = String(err);
    if (msg.includes("isn't connected")) {
      return { ok: false, error: msg };
    }
    return { ok: false, error: `Calendar lookup failed: ${msg}` };
  }
}
