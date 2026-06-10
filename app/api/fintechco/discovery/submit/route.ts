import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { discoveryResponses } from '@/lib/db/schema';
import type { DiscoveryPersona } from '@/lib/fintechco/discoveryPrompt';
import type { DiscoveryMessage, TranscriptEntry } from '@/stores/fintechcoDiscovery';

const VALID_PERSONAS: DiscoveryPersona[] = ['cto', 'head_of_dt', 'other'];

export async function POST(req: NextRequest) {
  let body: {
    persona?: DiscoveryPersona;
    visitorLabel?: string;
    transcript?: TranscriptEntry[];
    messages?: DiscoveryMessage[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { persona, visitorLabel, transcript, messages } = body;
  if (!persona || !VALID_PERSONAS.includes(persona)) {
    return NextResponse.json({ error: 'Invalid persona' }, { status: 400 });
  }
  if (!Array.isArray(transcript) || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Invalid transcript or messages' }, { status: 400 });
  }

  await db.insert(discoveryResponses).values({
    persona,
    visitorLabel: visitorLabel?.trim() || null,
    transcript,
    messages,
  });

  return NextResponse.json({ ok: true });
}
