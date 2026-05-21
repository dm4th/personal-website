import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getUploadUrl } from '../lib/s3';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const filename = event.queryStringParameters?.filename ?? 'document.pdf';

  try {
    const { url, key } = await getUploadUrl(filename);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, key }),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to generate upload URL', detail: message }),
    };
  }
}
