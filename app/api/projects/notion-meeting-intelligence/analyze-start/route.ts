import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { invokeLambda, invokeLambdaAsync } from '@/lib/projects/notion-meeting-intelligence/lambdaInvoke';
import { fetchMeetingAgents } from '@/lib/projects/notion-meeting-intelligence/fetchAgentLibrary';
import { buildAgentPrompt, buildBasePrompt } from '@/lib/projects/notion-meeting-intelligence/prompts';
import type { AgentName } from '@/lib/projects/notion-meeting-intelligence/prompts';

const AGENT_KEYS: AgentName[] = ['sales', 'commercial', 'delivery', 'product', 'icp', 'summary'];

const RequestSchema = z.object({
  transcript: z.string().min(50, 'Transcript must be at least 50 characters').max(20000),
  meeting_type: z
    .enum(['Discovery', 'Executive Briefing', 'Technical Deep-Dive', 'QBR', 'Demo', 'Other'])
    .optional()
    .default('Other'),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation error', detail: parsed.error.message }, { status: 400 });
  }

  const { transcript, meeting_type } = parsed.data;
  const today = new Date().toISOString().slice(0, 10);

  // Build full system prompts — try Notion Agent Library, fall back to hardcoded
  const agentPrompts: Record<string, string> = {};
  try {
    const entries = await fetchMeetingAgents();
    if (entries.length >= 5) {
      for (const e of entries) {
        agentPrompts[e.outputSchemaKey] = e.systemPromptBody.trim()
          ? `${buildBasePrompt(today)}\n\n${e.systemPromptBody}`
          : buildAgentPrompt(e.outputSchemaKey, today);
      }
    }
  } catch { /* fall through to hardcoded */ }

  // Fill any missing agents with hardcoded prompts
  for (const key of AGENT_KEYS) {
    if (!agentPrompts[key]) agentPrompts[key] = buildAgentPrompt(key, today);
  }

  const sessionId = `notion-analyze-${randomUUID()}`;

  // Save session + fire async Lambda — both must succeed before returning
  const startResult = await invokeLambda('/analyze/start', 'POST', {
    body: { sessionId, transcript, meeting_type, agentPrompts },
  });
  if (startResult.statusCode !== 200) {
    return NextResponse.json({ error: 'Failed to create analysis session' }, { status: 502 });
  }

  await invokeLambdaAsync('/analyze/execute', 'POST', { body: { sessionId } });

  return NextResponse.json({ sessionId });
}
