import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handler as uploadUrlHandler } from './handlers/upload-url';
import { handler as startHandler } from './handlers/start';
import { handler as statusHandler } from './handlers/status';
import { handler as chatHandler } from './handlers/chat';
import { handler as chatStartHandler } from './handlers/chat-start';
import { handler as chatExecuteHandler } from './handlers/chat-execute';
import { handler as chatResultHandler } from './handlers/chat-result';

const SECRET = process.env.DOCWOW_SECRET ?? '';

function unauthorized(): APIGatewayProxyResult {
  return {
    statusCode: 401,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Unauthorized' }),
  };
}

function notFound(path: string): APIGatewayProxyResult {
  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: `Unknown path: ${path}` }),
  };
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // Validate shared secret
  const incomingSecret = event.headers?.['x-docwow-secret'] ?? event.headers?.['X-Docwow-Secret'];
  if (SECRET && incomingSecret !== SECRET) {
    return unauthorized();
  }

  const path = event.path ?? '';
  const method = event.httpMethod?.toUpperCase() ?? 'GET';

  // Route requests
  if (path.endsWith('/upload-url') && method === 'GET') {
    return uploadUrlHandler(event);
  }

  if (path.endsWith('/start') && method === 'POST') {
    return startHandler(event);
  }

  if (path.endsWith('/status') && method === 'GET') {
    return statusHandler(event);
  }

  if (path.endsWith('/chat') && method === 'POST') {
    return chatHandler(event);
  }

  if (path.endsWith('/chat/start') && method === 'POST') {
    return chatStartHandler(event);
  }

  if (path.endsWith('/chat/execute') && method === 'POST') {
    return chatExecuteHandler(event);
  }

  if (path.endsWith('/chat/result') && method === 'GET') {
    return chatResultHandler(event);
  }

  return notFound(path);
}
