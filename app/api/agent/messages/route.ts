import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { messages } from '@/lib/db/schema';

export async function POST(req: NextRequest) {
  let body: { sessionId: string; userText: string; assistantText: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { sessionId, userText, assistantText } = body;
  if (!sessionId || !userText) return NextResponse.json({ ok: true }); // soft fail

  try {
    await db.insert(messages).values([
      {
        sessionId,
        role: 'user',
        content: [{ type: 'text', text: userText }],
      },
      {
        sessionId,
        role: 'assistant',
        content: [{ type: 'text', text: assistantText }],
      },
    ]);
  } catch {
    // Non-blocking - don't fail the UX if DB write fails
  }

  return NextResponse.json({ ok: true });
}
