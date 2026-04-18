import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createCalendarEvent } from '@/lib/google/calendar';
import { db } from '@/lib/db/client';
import { meetings, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let body: {
    slotStart: string;
    slotEnd: string;
    purpose: string;
    timezone?: string;
    sessionId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { slotStart, slotEnd, purpose, timezone = 'America/Los_Angeles', sessionId } = body;
  if (!slotStart || !slotEnd || !purpose) {
    return NextResponse.json({ error: 'slotStart, slotEnd, and purpose are required' }, { status: 400 });
  }

  const visitorEmail = user.emailAddresses[0]?.emailAddress ?? '';
  const visitorName = [user.firstName, user.lastName].filter(Boolean).join(' ') || visitorEmail;

  try {
    const start = new Date(slotStart);
    const end = new Date(slotEnd);

    const googleEventId = await createCalendarEvent({
      summary: `Chat with ${visitorName}`,
      description: purpose,
      start,
      end,
      attendeeEmail: visitorEmail,
      timezone,
    });

    // Look up internal user ID (best-effort)
    const dbUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, user.id))
      .limit(1);
    const userId = dbUsers[0]?.id ?? null;

    const [meeting] = await db
      .insert(meetings)
      .values({
        userId,
        sessionId: sessionId ?? null,
        purpose,
        slotStart: start,
        slotEnd: end,
        googleEventId,
        visitorEmail,
        status: 'confirmed',
      })
      .returning({ id: meetings.id });

    return NextResponse.json({ ok: true, meetingId: meeting.id, googleEventId });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
