import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handler as analyzeStartHandler } from './handlers/analyze-start';
import { handler as analyzeExecuteHandler } from './handlers/analyze-execute';
import { handler as analyzeStatusHandler } from './handlers/analyze-status';

const SECRET = process.env.NOTION_MEETING_SECRET ?? '';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const incoming = event.headers?.['x-notion-meeting-secret'] ?? event.headers?.['X-Notion-Meeting-Secret'];
  if (SECRET && incoming !== SECRET) {
    return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const path = event.path ?? '';
  const method = event.httpMethod?.toUpperCase() ?? 'GET';

  if (path.endsWith('/analyze/start') && method === 'POST')   return analyzeStartHandler(event);
  if (path.endsWith('/analyze/execute') && method === 'POST') return analyzeExecuteHandler(event);
  if (path.endsWith('/analyze/status') && method === 'GET')   return analyzeStatusHandler(event);

  return { statusCode: 404, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: `Unknown path: ${path}` }) };
}
