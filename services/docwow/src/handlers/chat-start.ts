import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { getSession, storePendingChat } from '../lib/dynamo';

interface ChatStartBody {
  sessionId: string;
  userMessage: string;
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  let body: ChatStartBody;
  try {
    body = JSON.parse(event.body ?? '{}') as ChatStartBody;
  } catch {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { sessionId, userMessage } = body;
  if (!sessionId || !userMessage) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Missing sessionId or userMessage' }) };
  }

  const session = await getSession(sessionId);
  if (!session) {
    return { statusCode: 404, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Session not found or expired' }) };
  }

  const chatId = randomUUID();
  await storePendingChat(sessionId, chatId);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId }),
  };
}
