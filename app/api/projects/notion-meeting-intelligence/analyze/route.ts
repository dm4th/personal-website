import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { buildAgentPrompt, buildBasePrompt } from '@/lib/projects/notion-meeting-intelligence/prompts';
import { fetchMeetingAgents } from '@/lib/projects/notion-meeting-intelligence/fetchAgentLibrary';
import type {
  AgentResults,
  MeetingMetadata,
  SalesAnalysis,
  CommercialAnalysis,
  DeliveryAnalysis,
  ProductAnalysis,
  ICPAnalysis,
  SummaryAnalysis,
} from '@/lib/projects/notion-meeting-intelligence/types';

const RequestSchema = z.object({
  transcript: z.string().min(50, 'Transcript must be at least 50 characters').max(20000),
  meeting_type: z
    .enum(['Discovery', 'Executive Briefing', 'Technical Deep-Dive', 'QBR', 'Demo', 'Other'])
    .optional()
    .default('Other'),
});

/**
 * Run a single agent call against the Claude API.
 * `systemPrompt` is the fully-assembled prompt (base + agent body) — callers
 * are responsible for building it, either from the Notion Agent Library or the
 * hardcoded fallback in prompts.ts.
 */
async function runAgent<T>(
  systemPrompt: string,
  transcript: string,
): Promise<T> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: `Meeting transcript:\n\n${transcript}` }],
  });
  let raw = response.content[0]?.type === 'text' ? response.content[0].text : '{}';
  // Strip markdown code fences if present
  raw = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
  return JSON.parse(raw) as T;
}

async function runSummaryAgent(
  partialResults: Omit<AgentResults, 'summary'>,
  transcript: string,
  systemPrompt: string,
): Promise<SummaryAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');
  const client = new Anthropic({ apiKey });
  const userMessage = [
    `Meeting transcript:\n\n${transcript}`,
    '---',
    'Agent analysis results:',
    `SALES ANALYSIS:\n${JSON.stringify(partialResults.sales, null, 2)}`,
    `COMMERCIAL ANALYSIS:\n${JSON.stringify(partialResults.commercial, null, 2)}`,
    `DELIVERY ANALYSIS:\n${JSON.stringify(partialResults.delivery, null, 2)}`,
    `PRODUCT ANALYSIS:\n${JSON.stringify(partialResults.product, null, 2)}`,
    `ICP ANALYSIS:\n${JSON.stringify(partialResults.icp, null, 2)}`,
  ].join('\n\n');
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
  let raw = response.content[0]?.type === 'text' ? response.content[0].text : '{}';
  raw = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
  return JSON.parse(raw) as SummaryAnalysis;
}

function deriveMetadata(
  results: AgentResults,
  transcript: string,
  meetingType: string,
  today: string,
): MeetingMetadata {
  const { sales, commercial, delivery, product, icp, summary } = results;

  // Derive company name from transcript (first mention of a proper noun near the call intro)
  const companyMatch = transcript.match(/\b([A-Z][a-zA-Z]+ (?:Health|Tech|Systems|Ventures|Capital|Labs|Studio|Media|Compute|Robotics|Marketplace|Platform|Software|Group|Inc|LLC|Corp)[^\s,]*)/);
  const companyName = companyMatch?.[1] ?? 'Unknown Company';

  // Derive sentiment from sales score
  let sentiment: MeetingMetadata['sentiment'];
  if (sales.overall_score >= 7) sentiment = '🟢 Positive';
  else if (sales.overall_score >= 4) sentiment = '🟡 Neutral';
  else sentiment = '🔴 Negative';

  // Derive stage from ICP tier + commercial deal tier
  let stageAfterMeeting: MeetingMetadata['stage_after_meeting'];
  if (icp.icp_tier === 'Tier 3 🔴' || commercial.deal_tier === 'Unqualified') {
    stageAfterMeeting = 'De-prioritize';
  } else if (sales.overall_score <= 3 || icp.overall_icp_score < 2.5) {
    stageAfterMeeting = 'Re-qualify ICP';
  } else if (icp.icp_tier === 'Tier 1 🟢' && sales.overall_score >= 6) {
    stageAfterMeeting = 'Move forward';
  } else {
    stageAfterMeeting = 'Hold';
  }

  // Top key signals: prefer summary agent's top signals
  const keySignals: string[] = summary.top_signals.length >= 3
    ? summary.top_signals.slice(0, 3).map((s) => s.slice(0, 80))
    : [
        sales.best_moment.slice(0, 80),
        commercial.budget_signals[0] ?? `${commercial.deal_tier} deal tier`,
        icp.dimension_scores.find((d) => d.score >= 4)?.evidence ?? icp.fit_summary.slice(0, 80),
      ].filter(Boolean).slice(0, 3);

  // Top action items: from delivery SE rec + commercial approach + one from product
  const actionItems: string[] = [
    delivery.se_recommendation.slice(0, 100),
    commercial.recommended_approach.slice(0, 100),
    product.resonated_features.length > 0
      ? `Follow up on ${product.resonated_features[0]} resonance`
      : undefined,
  ].filter((a): a is string => Boolean(a)).slice(0, 3);

  const meetingTitle = `${companyName} - ${meetingType} - ${today}`;

  const opportunities = [
    `Deal Tier: ${commercial.deal_tier}`,
    `ACV Range: ${commercial.estimated_acv_range}`,
    `Contract: ${commercial.contract_complexity}`,
    `Approach: ${commercial.recommended_approach}`,
    `ICP: ${icp.icp_tier} - score ${icp.overall_icp_score.toFixed(1)}/5.0`,
    `Recommendation: ${icp.recommendation}`,
  ].join('\n');

  return {
    meeting_title: meetingTitle,
    meeting_date: today,
    company_name: companyName,
    meeting_type: meetingType,
    engagement_score: Math.round(sales.overall_score * 10),
    sentiment,
    stage_after_meeting: stageAfterMeeting,
    key_signals: keySignals,
    action_items: actionItems,
    general_summary: summary.executive_summary,
    opportunities,
    buyer_roles_present: summary.buyer_roles_present ?? [],
  };
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', detail: parsed.error.message },
      { status: 400 },
    );
  }

  const { transcript, meeting_type } = parsed.data;
  const today = new Date().toISOString().slice(0, 10);

  // ------------------------------------------------------------------
  // Build per-agent system prompts: try Notion Agent Library first,
  // fall back to hardcoded prompts.ts if the fetch fails or returns
  // fewer than 5 agents (e.g. integration not connected yet).
  // ------------------------------------------------------------------
  type AgentKey = Parameters<typeof buildAgentPrompt>[0];
  let promptMap: Map<AgentKey, string> | null = null;
  try {
    const entries = await fetchMeetingAgents();
    if (entries.length >= 5) {
      promptMap = new Map(
        entries.map((e) => [
          e.outputSchemaKey,
          `${buildBasePrompt(today)}\n\n${e.systemPromptBody}`,
        ]),
      );
    }
  } catch {
    // Notion unavailable or Agent Library not shared with integration — use fallback
  }

  /** Returns the Notion-sourced prompt if available, otherwise the hardcoded version. */
  function getPrompt(key: AgentKey): string {
    return promptMap?.get(key) ?? buildAgentPrompt(key, today);
  }

  let results: AgentResults;
  try {
    const [sales, commercial, delivery, product, icp] = await Promise.all([
      runAgent<SalesAnalysis>(getPrompt('sales'), transcript),
      runAgent<CommercialAnalysis>(getPrompt('commercial'), transcript),
      runAgent<DeliveryAnalysis>(getPrompt('delivery'), transcript),
      runAgent<ProductAnalysis>(getPrompt('product'), transcript),
      runAgent<ICPAnalysis>(getPrompt('icp'), transcript),
    ]);
    const partialResults = { sales, commercial, delivery, product, icp };
    const summary = await runSummaryAgent(partialResults, transcript, getPrompt('summary'));
    results = { ...partialResults, summary };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Agent analysis failed', detail: message },
      { status: 500 },
    );
  }

  const metadata = deriveMetadata(results, transcript, meeting_type, today);

  return NextResponse.json({ results, metadata });
}
