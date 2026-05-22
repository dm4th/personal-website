import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { buildAgentPrompt, buildBasePrompt } from '@/lib/projects/notion-meeting-intelligence/prompts';
import type { AgentName } from '@/lib/projects/notion-meeting-intelligence/prompts';
import type { PartialAgentResults } from '@/lib/projects/notion-meeting-intelligence/types';

const VALID_AGENTS: AgentName[] = ['sales', 'commercial', 'delivery', 'product', 'icp', 'summary'];

const RequestSchema = z.object({
  transcript: z.string().min(50).max(20000),
  meeting_type: z
    .enum(['Discovery', 'Executive Briefing', 'Technical Deep-Dive', 'QBR', 'Demo', 'Other'])
    .optional()
    .default('Other'),
  promptBody: z.string().optional(),
  partialResults: z.record(z.unknown()).optional(),
});

async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
  let raw = response.content[0]?.type === 'text' ? response.content[0].text : '{}';
  raw = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
  return raw;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ agent: string }> },
) {
  const { agent } = await params;

  if (!VALID_AGENTS.includes(agent as AgentName)) {
    return NextResponse.json({ error: `Unknown agent: ${agent}` }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation error', detail: parsed.error.message }, { status: 400 });
  }

  const { transcript, meeting_type, promptBody, partialResults } = parsed.data;
  const today = new Date().toISOString().slice(0, 10);
  const agentKey = agent as AgentName;

  const systemPrompt = promptBody?.trim()
    ? `${buildBasePrompt(today)}\n\n${promptBody}`
    : buildAgentPrompt(agentKey, today);

  try {
    if (agentKey === 'summary') {
      if (!partialResults) {
        return NextResponse.json({ error: 'partialResults required for summary agent' }, { status: 400 });
      }
      const partial = partialResults as PartialAgentResults;
      const userMessage = [
        `Meeting transcript:\n\n${transcript}`,
        '---',
        'Agent analysis results:',
        `SALES ANALYSIS:\n${JSON.stringify(partial.sales, null, 2)}`,
        `COMMERCIAL ANALYSIS:\n${JSON.stringify(partial.commercial, null, 2)}`,
        `DELIVERY ANALYSIS:\n${JSON.stringify(partial.delivery, null, 2)}`,
        `PRODUCT ANALYSIS:\n${JSON.stringify(partial.product, null, 2)}`,
        `ICP ANALYSIS:\n${JSON.stringify(partial.icp, null, 2)}`,
      ].join('\n\n');
      const raw = await callClaude(systemPrompt, userMessage);
      return NextResponse.json(JSON.parse(raw));
    }

    const raw = await callClaude(systemPrompt, `Meeting transcript:\n\n${transcript}`);
    return NextResponse.json(JSON.parse(raw));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Agent call failed', detail: message }, { status: 500 });
  }
}
