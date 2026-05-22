import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getSession } from '../lib/dynamo';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const sessionId = event.queryStringParameters?.sessionId;
  if (!sessionId) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Missing sessionId' }) };
  }

  const session = await getSession(sessionId);
  if (!session) {
    return { statusCode: 404, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Session not found or expired' }) };
  }

  if (session.status !== 'ready') {
    return { statusCode: 409, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Results not ready' }) };
  }

  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ results: session.results }) };
}
