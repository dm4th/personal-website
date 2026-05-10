import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { users, notionConfigs } from '@/lib/db/schema';
import { encryptToken } from '@/lib/auth/googleOAuth';

async function getDbUser(clerkUserId: string) {
  const rows = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId)).limit(1);
  return rows[0] ?? null;
}

// GET - returns saved DB IDs and whether a token exists (token never returned to client)
export async function GET() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const rows = await db
    .select()
    .from(notionConfigs)
    .where(eq(notionConfigs.userId, dbUser.id))
    .limit(1);

  const config = rows[0];
  if (!config) {
    return NextResponse.json({
      meeting_notes_db_id: null,
      agent_analyses_db_id: null,
      agent_library_db_id: null,
      icp_rubric_db_id: null,
      has_token: false,
    });
  }

  return NextResponse.json({
    meeting_notes_db_id: config.meetingNotesDbId,
    agent_analyses_db_id: config.agentAnalysesDbId,
    agent_library_db_id: config.agentLibraryDbId,
    icp_rubric_db_id: config.icpRubricDbId,
    has_token: Boolean(config.integrationToken),
  });
}

const SaveSchema = z.object({
  notion_token: z.string().min(10).optional(),
  meeting_notes_db_id: z.string().min(10).optional(),
  agent_analyses_db_id: z.string().min(10).optional(),
  agent_library_db_id: z.string().min(10).optional(),
  icp_rubric_db_id: z.string().min(10).optional(),
});

// POST - save/update notion config
export async function POST(req: NextRequest) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = SaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation error', detail: parsed.error.message }, { status: 400 });
  }

  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.notion_token) {
    updates.integrationToken = encryptToken(parsed.data.notion_token);
  }
  if (parsed.data.meeting_notes_db_id !== undefined) {
    updates.meetingNotesDbId = parsed.data.meeting_notes_db_id;
  }
  if (parsed.data.agent_analyses_db_id !== undefined) {
    updates.agentAnalysesDbId = parsed.data.agent_analyses_db_id;
  }
  if (parsed.data.agent_library_db_id !== undefined) {
    updates.agentLibraryDbId = parsed.data.agent_library_db_id;
  }
  if (parsed.data.icp_rubric_db_id !== undefined) {
    updates.icpRubricDbId = parsed.data.icp_rubric_db_id;
  }

  const existing = await db
    .select({ id: notionConfigs.id })
    .from(notionConfigs)
    .where(eq(notionConfigs.userId, dbUser.id))
    .limit(1);

  if (existing.length > 0) {
    await db.update(notionConfigs).set(updates).where(eq(notionConfigs.userId, dbUser.id));
  } else {
    await db.insert(notionConfigs).values({ userId: dbUser.id, ...updates });
  }

  return NextResponse.json({ ok: true });
}

// DELETE - clear all notion config for this user
export async function DELETE() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  await db.delete(notionConfigs).where(eq(notionConfigs.userId, dbUser.id));
  return NextResponse.json({ ok: true });
}

