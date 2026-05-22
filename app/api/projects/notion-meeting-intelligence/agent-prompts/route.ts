import { NextResponse } from 'next/server';
import { fetchMeetingAgents } from '@/lib/projects/notion-meeting-intelligence/fetchAgentLibrary';
import type { AgentName } from '@/lib/projects/notion-meeting-intelligence/prompts';

export async function GET() {
  try {
    const entries = await fetchMeetingAgents();
    if (entries.length < 5) {
      return NextResponse.json({ promptBodies: null });
    }
    const promptBodies = Object.fromEntries(
      entries.map((e) => [e.outputSchemaKey, e.systemPromptBody]),
    ) as Record<AgentName, string>;
    return NextResponse.json({ promptBodies });
  } catch {
    return NextResponse.json({ promptBodies: null });
  }
}
