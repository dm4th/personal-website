// Called asynchronously (InvocationType: 'Event') — no HTTP response needed.
// Runs the full Claude pipeline and stores the result in DynamoDB for polling.
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Anthropic from '@anthropic-ai/sdk';
import { getSession, appendHistory, resolvePendingChat } from '../lib/dynamo';
import { buildSkillFile, buildBlockMetaMap } from '../lib/skillFile';
import type { Citation } from '../lib/types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ChatExecuteBody {
  sessionId: string;
  userMessage: string;
  chatId: string;
}

interface ClaudeAnswer {
  answer: string;
  citations: Array<{
    blockId: string;
    pageNumber: number;
    quote: string;
    type: string;
  }>;
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  let body: ChatExecuteBody;
  try {
    body = JSON.parse(event.body ?? '{}') as ChatExecuteBody;
  } catch {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { sessionId, userMessage, chatId } = body;
  if (!sessionId || !userMessage || !chatId) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Missing fields' }) };
  }

  const session = await getSession(sessionId);
  if (!session) {
    await resolvePendingChat(sessionId, chatId, { error: 'Session not found or expired' });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
  }

  const systemPrompt = buildSkillFile(session.profile, session.blocks);
  const blockMeta = buildBlockMetaMap(session.blocks);

  const messages: Anthropic.MessageParam[] = [
    ...session.history.map((turn) => ({ role: turn.role as 'user' | 'assistant', content: turn.content })),
    { role: 'user', content: userMessage },
  ];

  let rawAnswer: string;
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    });
    const textBlock = response.content.find((b) => b.type === 'text');
    rawAnswer = textBlock?.type === 'text' ? textBlock.text : '';
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    await resolvePendingChat(sessionId, chatId, { error: `LLM call failed: ${message}` });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
  }

  let parsed: ClaudeAnswer;
  try {
    const cleaned = rawAnswer.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    parsed = JSON.parse(cleaned) as ClaudeAnswer;
  } catch {
    parsed = { answer: rawAnswer, citations: [] };
  }

  const enrichedCitations: Citation[] = (parsed.citations ?? []).flatMap((c) => {
    const block = blockMeta.get(c.blockId);
    if (!block) return [];
    return [{ pageNumber: c.pageNumber ?? block.pageNumber, blockId: c.blockId, quote: c.quote ?? block.text.slice(0, 120), type: block.type, bbox: block.bbox, confidence: block.confidence }];
  });

  await resolvePendingChat(sessionId, chatId, { answer: parsed.answer ?? rawAnswer, citations: enrichedCitations });
  await appendHistory(sessionId, { role: 'user', content: userMessage });
  await appendHistory(sessionId, { role: 'assistant', content: parsed.answer ?? rawAnswer });

  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
}
