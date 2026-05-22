import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { saveSession } from '../lib/dynamo';

interface StartBody {
  sessionId: string;
  transcript: string;
  meeting_type: string;
  agentPrompts: Record<string, string>;
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  let body: StartBody;
  try {
    body = JSON.parse(event.body ?? '{}') as StartBody;
  } catch {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { sessionId, transcript, meeting_type, agentPrompts } = body;
  if (!sessionId || !transcript || !agentPrompts) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  await saveSession({
    sessionId,
    status: 'processing',
    transcript,
    meeting_type: meeting_type ?? 'Other',
    agentPrompts,
    agentStatuses: {
      sales: 'processing',
      commercial: 'processing',
      delivery: 'processing',
      product: 'processing',
      icp: 'processing',
      summary: 'pending',
    },
  });
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) };
}
