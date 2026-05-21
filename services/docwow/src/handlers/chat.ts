import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Anthropic from '@anthropic-ai/sdk';
import { getSession, appendHistory } from '../lib/dynamo';
import { buildSkillFile, buildBlockMetaMap } from '../lib/skillFile';
import type { Citation } from '../lib/types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ChatRequestBody {
  sessionId: string;
  userMessage: string;
}

interface ClaudeAnswer {
  answer: string;
  citations: Array<{
    blockId: string;
    pageNumber: number;
    quote: string;
    type: string;
    bbox?: { left: number; top: number; width: number; height: number };
  }>;
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  let body: ChatRequestBody;
  try {
    body = JSON.parse(event.body ?? '{}') as ChatRequestBody;
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { sessionId, userMessage } = body;
  if (!sessionId || !userMessage) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing required fields: sessionId, userMessage' }),
    };
  }

  const session = await getSession(sessionId);
  if (!session) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Session not found or expired' }),
    };
  }

  const systemPrompt = buildSkillFile(session.profile, session.blocks);
  const blockMeta = buildBlockMetaMap(session.blocks);

  // Build message history for Claude
  const messages: Anthropic.MessageParam[] = [
    ...session.history.map((turn) => ({
      role: turn.role as 'user' | 'assistant',
      content: turn.content,
    })),
    { role: 'user', content: userMessage },
  ];

  let rawAnswer: string;
  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    rawAnswer = textBlock?.type === 'text' ? textBlock.text : '';
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Anthropic API error:', message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'LLM call failed', detail: message }),
    };
  }

  // Parse Claude's JSON response
  let parsed: ClaudeAnswer;
  try {
    // Claude sometimes wraps JSON in a code block — strip if present
    const cleaned = rawAnswer.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    parsed = JSON.parse(cleaned) as ClaudeAnswer;
  } catch {
    // Fallback: treat entire response as plain answer with no citations
    parsed = { answer: rawAnswer, citations: [] };
  }

  // Enrich citations with bbox from block metadata
  const enrichedCitations: Citation[] = (parsed.citations ?? []).flatMap((c) => {
    const block = blockMeta.get(c.blockId);
    if (!block) return [];
    return [
      {
        pageNumber: c.pageNumber ?? block.pageNumber,
        blockId: c.blockId,
        quote: c.quote ?? block.text.slice(0, 120),
        type: block.type,
        bbox: block.bbox,
      },
    ];
  });

  // Persist conversation turn
  await appendHistory(sessionId, { role: 'user', content: userMessage });
  await appendHistory(sessionId, { role: 'assistant', content: parsed.answer ?? rawAnswer });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer: parsed.answer ?? rawAnswer, citations: enrichedCitations }),
  };
}
