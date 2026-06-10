import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '@/lib/db/client';
import { discoveryResponses } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { DISCOVERY_PERSONAS, type DiscoveryPersona, type MeddpiccEntry } from '@/lib/fintechco/discoveryPrompt';
import type { DiscoveryMessage, TranscriptEntry } from '@/stores/fintechcoDiscovery';

const anthropic = new Anthropic();

const ANALYSIS_TOOL: Anthropic.Tool = {
  name: 'record_analysis',
  description: 'Record the MEDDPICC analysis for this discovery conversation',
  input_schema: {
    type: 'object',
    properties: {
      dimensions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            dimension: { type: 'string' },
            finding: { type: 'string' },
            evidence: { type: 'string' },
            confidence: { type: 'string', enum: ['strong', 'partial', 'missing'] },
          },
          required: ['dimension', 'finding', 'evidence', 'confidence'],
        },
      },
    },
    required: ['dimensions'],
  },
};

async function analyzeMeddpicc(
  persona: DiscoveryPersona,
  transcript: TranscriptEntry[],
  messages: DiscoveryMessage[],
): Promise<MeddpiccEntry[]> {
  const config = DISCOVERY_PERSONAS[persona];
  const dimensions = [...new Set(
    config.questionSubjects.flatMap((s) => s.meddpiccMapping.map((m) => m.dimension)),
  )];

  // Per-dimension listening cues from the persona config, so the analyst knows
  // what kind of signal maps to each dimension for this specific role.
  const dimensionCues = dimensions
    .map((d) => {
      const cues = config.questionSubjects.flatMap((s) =>
        s.meddpiccMapping.filter((m) => m.dimension === d).map((m) => `    (${s.subject}) ${m.rationale}`),
      );
      return `- ${d}:\n${cues.join('\n')}`;
    })
    .join('\n');

  // The raw back-and-forth carries the probe answers, which is where the
  // richest signal lives; the subject-labeled transcript loses the questions.
  const conversation = messages
    .filter((m) => m.text.trim())
    .map((m) => `${m.role === 'assistant' ? 'Facilitator' : 'Visitor'}: ${m.text}`)
    .join('\n\n');

  const systemPrompt = `You are a sales-discovery analyst. You are given the transcript of a short pre-meeting discovery conversation with a prospect stakeholder, and you map what the VISITOR said onto a fixed set of MEDDPICC dimensions by calling the record_analysis tool.

Rules, in priority order:
1. Report only what the visitor actually said. Never invent numbers, names, titles, tools, or commitments. If the visitor did not name who holds budget, you do not know the economic buyer. Attributing more certainty than the words support is the one unforgivable error; an honest "missing" is a useful finding.
2. Evidence must come only from Visitor turns, never from the Facilitator's questions. The facilitator's questions list example frameworks, metrics, and team names; mentioning an example in a question is NOT the visitor confirming it.
3. The evidence field is a direct quote of the visitor's own words, or a tight paraphrase that stays within them. Pull their specific language ("audits eat about a week per quarter"), do not summarize ("they have compliance burdens"). One quote per dimension, the strongest one if several qualify.
4. The finding field is your synthesis: one or two plain sentences stating what we now know on that dimension and, where the visitor was explicit, what it implies for the deal. It must be fully traceable to the evidence.
5. Confidence: "strong" means the visitor directly and substantively addressed the dimension. "partial" means they touched it or it is reasonably inferable from their words, but a follow-up is still needed. "missing" means no real signal: set finding and evidence to empty strings.
6. Return exactly one entry per dimension, using the exact dimension names provided, in the order provided. Skip none, add none.

Style: plain language, no em-dashes (use commas or colons), no sales jargon beyond the dimension names themselves.`;

  const userPrompt = `Persona: the visitor self-identified as ${config.label}.

Dimensions to assess, with private cues for what signal tends to map to each one for this persona:
${dimensionCues}

Conversation:
${conversation}

Assess every dimension listed above and record the analysis with the record_analysis tool.`;

  const response = await anthropic.messages.create({
    model: process.env.AGENT_MODEL ?? 'claude-sonnet-4-6',
    max_tokens: 2048,
    tools: [ANALYSIS_TOOL],
    tool_choice: { type: 'tool', name: 'record_analysis' },
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const toolUse = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
  if (!toolUse) return [];
  const { dimensions: result } = toolUse.input as { dimensions: MeddpiccEntry[] };
  return result;
}

export async function GET(req: NextRequest) {
  const code = req.headers.get('x-fintechco-results-code');
  const expected = process.env.FINTECHCO_RESULTS_CODE;

  if (!expected || code !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(discoveryResponses)
    .orderBy(desc(discoveryResponses.createdAt));

  // Lazy MEDDPICC analysis: compute and persist for any eligible row that hasn't been analyzed yet.
  const analyzed = await Promise.all(
    rows.map(async (row) => {
      const transcript = row.transcript as TranscriptEntry[];
      if (row.meddpicc || transcript.length < 2) return row;

      try {
        const analysis = await analyzeMeddpicc(
          row.persona,
          transcript,
          row.messages as DiscoveryMessage[],
        );
        if (analysis.length === 0) return row;

        await db.update(discoveryResponses).set({ meddpicc: analysis }).where(eq(discoveryResponses.id, row.id));
        return { ...row, meddpicc: analysis };
      } catch {
        return row;
      }
    }),
  );

  return NextResponse.json({ responses: analyzed });
}
