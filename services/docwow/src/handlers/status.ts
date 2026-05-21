import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Anthropic from '@anthropic-ai/sdk';
import { getTextractStatus } from '../lib/textract';
import { getSession, updateSession } from '../lib/dynamo';
import type { ExtractedBlock } from '../lib/types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Generate 3-5 targeted questions from document blocks using Claude.
 * Uses only the first 60 blocks to keep the call fast (~1-2s).
 */
async function generateQuestions(blocks: ExtractedBlock[], profile: { role: string; goal: string }): Promise<string[]> {
  const sample = blocks
    .filter((b) => b.type === 'text')
    .slice(0, 60)
    .map((b) => b.text)
    .join('\n');

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `You are helping a ${profile.role} who wants to: ${profile.goal}.

Based on this document excerpt, generate exactly 3 specific, answerable questions they should ask.
Return only a JSON array of strings. No explanation, no markdown.

Document:
${sample}`,
      },
    ],
  });

  const text = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '[]';
  try {
    const parsed = JSON.parse(text) as string[];
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch {
    return [];
  }
}

/**
 * Polls the Textract job for a session and returns current processing status.
 * When Textract finishes, also generates suggested questions via Claude Haiku.
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const sessionId = event.queryStringParameters?.sessionId;
  if (!sessionId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing sessionId query parameter' }),
    };
  }

  try {
    const session = await getSession(sessionId);
    if (!session) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Session not found' }),
      };
    }

    // Already ready - return cached data immediately
    if (session.status === 'ready') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ready',
          blocks: session.blocks,
          pageCount: session.pageCount,
          suggestedQuestions: session.suggestedQuestions ?? [],
        }),
      };
    }

    if (!session.textractJobId) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Session missing Textract job ID' }),
      };
    }

    const result = await getTextractStatus(session.textractJobId);

    if (result.status === 'ready') {
      // Generate questions in parallel with persisting blocks
      const [suggestedQuestions] = await Promise.all([
        generateQuestions(result.blocks, session.profile).catch(() => []),
        updateSession(sessionId, {
          status: 'ready',
          blocks: result.blocks,
          pageCount: result.pageCount,
        }),
      ]);

      // Persist questions separately (non-blocking to overall response)
      updateSession(sessionId, { suggestedQuestions }).catch(console.error);

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ready',
          blocks: result.blocks,
          pageCount: result.pageCount,
          suggestedQuestions,
        }),
      };
    }

    if (result.status === 'failed') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'failed', message: result.message }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'processing', pagesProcessed: result.pagesProcessed }),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Status handler error:', message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Status check failed', detail: message }),
    };
  }
}
