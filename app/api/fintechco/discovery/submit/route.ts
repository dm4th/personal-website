import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { discoveryResponses } from '@/lib/db/schema';
import { DISCOVERY_PERSONAS, type DiscoveryPersona } from '@/lib/fintechco/discoveryPrompt';
import type { DiscoveryMessage, TranscriptEntry } from '@/stores/fintechcoDiscovery';

// Derived from the persona registry so new personas never need a second edit here.
const VALID_PERSONAS = Object.keys(DISCOVERY_PERSONAS) as DiscoveryPersona[];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  let body: {
    conversationId?: string;
    persona?: DiscoveryPersona;
    visitorLabel?: string;
    transcript?: TranscriptEntry[];
    messages?: DiscoveryMessage[];
    completed?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { conversationId, persona, visitorLabel, transcript, messages, completed = false } = body;

  if (!conversationId || !UUID_RE.test(conversationId)) {
    return NextResponse.json({ error: 'Invalid conversationId' }, { status: 400 });
  }
  if (!persona || !VALID_PERSONAS.includes(persona)) {
    return NextResponse.json({ error: 'Invalid persona' }, { status: 400 });
  }
  if (!Array.isArray(transcript) || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Invalid transcript or messages' }, { status: 400 });
  }

  const trimmedLabel = visitorLabel?.trim() || null;

  await db
    .insert(discoveryResponses)
    .values({ conversationId, persona, visitorLabel: trimmedLabel, transcript, messages, completed })
    .onConflictDoUpdate({
      target: discoveryResponses.conversationId,
      // Monotonic merge: the per-turn drafts and the Done click are concurrent
      // fire-and-forget writers, so arrival order is not guaranteed. A name,
      // once attached, must never regress to null, and completed never flips
      // back to false, regardless of which request lands last.
      set: {
        transcript,
        messages,
        visitorLabel: sql`coalesce(excluded.visitor_label, ${discoveryResponses.visitorLabel})`,
        completed: sql`excluded.completed or ${discoveryResponses.completed}`,
      },
    });

  return NextResponse.json({ ok: true });
}
