// Called asynchronously (InvocationType: 'Event') — runs all 6 Claude agent calls
// and stores the results in DynamoDB for the status route to return.
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Anthropic from '@anthropic-ai/sdk';
import { getSession, updateSession, updateAgentStatus } from '../lib/dynamo';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const ok: APIGatewayProxyResult = { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };

async function callClaude(systemPrompt: string, userMessage: string): Promise<unknown> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
  const text = response.content[0]?.type === 'text' ? response.content[0].text : '{}';
  const cleaned = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
  return JSON.parse(cleaned);
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  let body: { sessionId: string };
  try {
    body = JSON.parse(event.body ?? '{}') as { sessionId: string };
  } catch {
    return ok;
  }

  const { sessionId } = body;
  if (!sessionId) return ok;

  const session = await getSession(sessionId);
  if (!session) return ok;

  const { transcript, agentPrompts } = session;
  const transcriptMsg = `Meeting transcript:\n\n${transcript}`;

  try {
    const agentNames = ['sales', 'commercial', 'delivery', 'product', 'icp'] as const;

    async function runTracked(name: string): Promise<unknown> {
      try {
        const result = await callClaude(agentPrompts[name], transcriptMsg);
        await updateAgentStatus(sessionId, name, 'ready');
        return result;
      } catch (err) {
        await updateAgentStatus(sessionId, name, 'failed');
        throw err;
      }
    }

    // Phase 1: 5 parallel agents — each writes its own status as it completes
    const settled = await Promise.allSettled(agentNames.map(name => runTracked(name)));

    const failedAgents = agentNames.filter((_, i) => settled[i].status === 'rejected');
    if (failedAgents.length > 0) {
      await updateSession(sessionId, { status: 'failed', error: `Agents failed: ${failedAgents.join(', ')}` });
      return ok;
    }

    const [sales, commercial, delivery, product, icp] = settled.map(r => (r as PromiseFulfilledResult<unknown>).value);

    // Phase 2: summary agent — mark processing before starting, ready/failed after
    await updateAgentStatus(sessionId, 'summary', 'processing');

    const summaryMsg = [
      transcriptMsg, '---', 'Agent analysis results:',
      `SALES ANALYSIS:\n${JSON.stringify(sales, null, 2)}`,
      `COMMERCIAL ANALYSIS:\n${JSON.stringify(commercial, null, 2)}`,
      `DELIVERY ANALYSIS:\n${JSON.stringify(delivery, null, 2)}`,
      `PRODUCT ANALYSIS:\n${JSON.stringify(product, null, 2)}`,
      `ICP ANALYSIS:\n${JSON.stringify(icp, null, 2)}`,
    ].join('\n\n');

    try {
      const summary = await callClaude(agentPrompts['summary'], summaryMsg);
      await updateAgentStatus(sessionId, 'summary', 'ready');
      await updateSession(sessionId, { status: 'ready', results: { sales, commercial, delivery, product, icp, summary } });
    } catch (err) {
      await updateAgentStatus(sessionId, 'summary', 'failed');
      const message = err instanceof Error ? err.message : 'Unknown error';
      await updateSession(sessionId, { status: 'failed', error: `Summary failed: ${message}` });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    try { await updateSession(sessionId, { status: 'failed', error: message }); } catch { /* best effort */ }
  }

  return ok;
}
