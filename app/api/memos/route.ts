import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db/client';
import { memos, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  let body: { title?: string; messages: Array<{ role: string; text: string }>; sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { messages, title, sessionId } = body;
  if (!messages?.length) return NextResponse.json({ error: 'No messages to save' }, { status: 400 });

  // Look up internal user ID
  const dbUsers = await db.select({ id: users.id }).from(users).where(eq(users.clerkUserId, user.id)).limit(1);
  const userId = dbUsers[0]?.id;
  if (!userId) return NextResponse.json({ error: 'User not found — sign out and back in' }, { status: 404 });

  // Build markdown body from messages
  const bodyMarkdown = messages
    .map((m) => `**${m.role === 'user' ? 'You' : 'Agent'}:** ${m.text}`)
    .join('\n\n');

  const memoTitle = title ?? messages.find((m) => m.role === 'user')?.text.slice(0, 60) ?? 'Saved conversation';

  const [memo] = await db
    .insert(memos)
    .values({ userId, title: memoTitle, bodyMarkdown, sourceSessionId: sessionId ?? null })
    .returning({ id: memos.id });

  return NextResponse.json({ ok: true, memoId: memo.id });
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const dbUsers = await db.select({ id: users.id }).from(users).where(eq(users.clerkUserId, user.id)).limit(1);
  const userId = dbUsers[0]?.id;
  if (!userId) return NextResponse.json({ memos: [] });

  const rows = await db
    .select({ id: memos.id, title: memos.title, createdAt: memos.createdAt })
    .from(memos)
    .where(eq(memos.userId, userId))
    .orderBy(memos.createdAt);

  return NextResponse.json({ memos: rows });
}
