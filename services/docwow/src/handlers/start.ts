import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { analyzeDocument } from '../lib/textract';
import { saveSession } from '../lib/dynamo';
import type { AnalysisProfile } from '../lib/types';

interface StartRequestBody {
  s3Key: string;
  profile: AnalysisProfile;
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  let body: StartRequestBody;
  try {
    body = JSON.parse(event.body ?? '{}') as StartRequestBody;
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { s3Key, profile } = body;
  if (!s3Key || !profile?.role || !profile?.goal) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing required fields: s3Key, profile.role, profile.goal' }),
    };
  }

  try {
    const { blocks, pageCount } = await analyzeDocument(s3Key);
    const sessionId = uuidv4();

    await saveSession({
      sessionId,
      s3Key,
      profile,
      blocks,
      pageCount,
      history: [],
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, pageCount, blocks }),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Start handler error:', message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Document processing failed', detail: message }),
    };
  }
}
