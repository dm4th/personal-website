/**
 * Direct Lambda invocation helper for DocWow routes.
 * Bypasses the Function URL entirely - uses IAM credentials from env vars
 * to call the Lambda with InvokeCommand, constructing an APIGatewayProxyEventV2
 * shaped payload so the Lambda handler doesn't need changes.
 */
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

// Use DOCWOW_ prefixed names to avoid conflicts with Vercel reserved env vars
const client = new LambdaClient({
  region: process.env.DOCWOW_AWS_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.DOCWOW_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.DOCWOW_AWS_SECRET_ACCESS_KEY!,
  },
});

const FUNCTION_NAME = process.env.DOCWOW_LAMBDA_FUNCTION_NAME ?? 'docwow';
const SECRET = process.env.DOCWOW_CONTAINER_SECRET ?? '';

interface InvokeResult {
  statusCode: number;
  body: unknown;
}

export async function invokeLambda(
  path: string,
  method: 'GET' | 'POST',
  options: { queryParams?: Record<string, string>; body?: unknown } = {},
): Promise<InvokeResult> {
  // Construct an APIGatewayProxyEvent (v1) shaped event to match the handler
  const event = {
    path,
    httpMethod: method,
    headers: { 'x-docwow-secret': SECRET },
    queryStringParameters: options.queryParams ?? {},
    body: options.body ? JSON.stringify(options.body) : null,
  };

  const command = new InvokeCommand({
    FunctionName: FUNCTION_NAME,
    Payload: Buffer.from(JSON.stringify(event)),
  });

  let response;
  try {
    response = await client.send(command);
  } catch (e) {
    const err = e as Error & { name?: string };
    // InvokeCommand itself failed — auth/network error before Lambda ran
    return {
      statusCode: 502,
      body: { error: `InvokeCommand failed: [${err.name}] ${err.message}` },
    };
  }

  if (!response.Payload) {
    return { statusCode: 502, body: { error: 'Lambda returned empty payload' } };
  }

  const payloadStr = Buffer.from(response.Payload).toString();

  // Lambda crashed with unhandled exception
  if (response.FunctionError) {
    return {
      statusCode: 502,
      body: { error: `Lambda function error (${response.FunctionError}): ${payloadStr}` },
    };
  }

  const raw = JSON.parse(payloadStr) as { statusCode: number; body: string };

  return {
    statusCode: raw.statusCode,
    body: JSON.parse(raw.body),
  };
}
