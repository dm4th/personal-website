import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const client = new LambdaClient({
  region: process.env.NOTION_MEETING_AWS_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.NOTION_MEETING_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NOTION_MEETING_AWS_SECRET_ACCESS_KEY!,
  },
});

const FUNCTION_NAME = process.env.NOTION_MEETING_LAMBDA_FUNCTION_NAME ?? 'notion-meeting-intelligence';
const SECRET = process.env.NOTION_MEETING_CONTAINER_SECRET ?? '';

interface InvokeResult {
  statusCode: number;
  body: unknown;
}

export async function invokeLambda(
  path: string,
  method: 'GET' | 'POST',
  options: { queryParams?: Record<string, string>; body?: unknown } = {},
): Promise<InvokeResult> {
  const event = {
    path,
    httpMethod: method,
    headers: { 'x-notion-meeting-secret': SECRET },
    queryStringParameters: options.queryParams ?? {},
    body: options.body ? JSON.stringify(options.body) : null,
  };

  const command = new InvokeCommand({
    FunctionName: FUNCTION_NAME,
    InvocationType: 'RequestResponse',
    Payload: Buffer.from(JSON.stringify(event)),
  });

  let response;
  try {
    response = await client.send(command);
  } catch (e) {
    const err = e as Error & { name?: string };
    return { statusCode: 502, body: { error: `InvokeCommand failed: [${err.name}] ${err.message}` } };
  }

  if (!response.Payload) return { statusCode: 502, body: { error: 'Lambda returned empty payload' } };

  const payloadStr = Buffer.from(response.Payload).toString();
  if (response.FunctionError) return { statusCode: 502, body: { error: `Lambda error: ${payloadStr}` } };

  const raw = JSON.parse(payloadStr) as { statusCode: number; body: string };
  return { statusCode: raw.statusCode, body: JSON.parse(raw.body) };
}

// Fire-and-forget: returns as soon as AWS acknowledges (~200ms).
export async function invokeLambdaAsync(
  path: string,
  method: 'GET' | 'POST',
  options: { queryParams?: Record<string, string>; body?: unknown } = {},
): Promise<void> {
  const event = {
    path,
    httpMethod: method,
    headers: { 'x-notion-meeting-secret': SECRET },
    queryStringParameters: options.queryParams ?? {},
    body: options.body ? JSON.stringify(options.body) : null,
  };

  const command = new InvokeCommand({
    FunctionName: FUNCTION_NAME,
    InvocationType: 'Event',
    Payload: Buffer.from(JSON.stringify(event)),
  });

  try {
    await client.send(command);
  } catch (e) {
    console.error('invokeLambdaAsync failed:', (e as Error).message);
  }
}
