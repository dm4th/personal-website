import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getSession } from '../lib/dynamo';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const sessionId = event.queryStringParameters?.sessionId;
  const chatId = event.queryStringParameters?.chatId;

  if (!sessionId || !chatId) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Missing sessionId or chatId' }) };
  }

  const session = await getSession(sessionId);
  if (!session) {
    return { statusCode: 404, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Session not found' }) };
  }

  const pending = session.pendingChat;

  if (!pending || pending.chatId !== chatId) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'processing' }) };
  }

  if (pending.status === 'processing') {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'processing' }) };
  }

  if (pending.status === 'failed') {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'failed', error: pending.error }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'ready', answer: pending.answer, citations: pending.citations ?? [] }),
  };
}
