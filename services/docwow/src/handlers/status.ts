import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getTextractStatus } from '../lib/textract';
import { getSession, updateSession } from '../lib/dynamo';

/**
 * Polls the Textract job for a session and returns current processing status.
 * Called repeatedly by the frontend every ~3s after /start.
 * When Textract is done, parses blocks and marks session as ready.
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

    // Already ready — return cached blocks immediately
    if (session.status === 'ready') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ready', blocks: session.blocks, pageCount: session.pageCount }),
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
      // Persist blocks so subsequent /status calls return instantly
      await updateSession(sessionId, {
        status: 'ready',
        blocks: result.blocks,
        pageCount: result.pageCount,
      });
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ready', blocks: result.blocks, pageCount: result.pageCount }),
      };
    }

    if (result.status === 'failed') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'failed', message: result.message }),
      };
    }

    // Still processing
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
