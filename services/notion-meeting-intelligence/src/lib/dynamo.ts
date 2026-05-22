import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { NotionAnalyzeSession } from './types';

const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? 'us-east-1' });
const ddb = DynamoDBDocumentClient.from(client);
const TABLE = process.env.DYNAMO_TABLE ?? 'notion-meeting-sessions';
const SESSION_TTL_SECONDS = 2 * 60 * 60; // 2 hours

export async function saveSession(session: Omit<NotionAnalyzeSession, 'createdAt' | 'ttl'>): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await ddb.send(new PutCommand({
    TableName: TABLE,
    Item: { ...session, createdAt: new Date().toISOString(), ttl: now + SESSION_TTL_SECONDS },
  }));
}

export async function getSession(sessionId: string): Promise<NotionAnalyzeSession | null> {
  const result = await ddb.send(new GetCommand({ TableName: TABLE, Key: { sessionId } }));
  return (result.Item as NotionAnalyzeSession) ?? null;
}

export async function updateAgentStatus(
  sessionId: string,
  agentName: string,
  status: 'processing' | 'ready' | 'failed',
): Promise<void> {
  await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: { sessionId },
    UpdateExpression: 'SET agentStatuses.#agent = :s',
    ExpressionAttributeNames: { '#agent': agentName },
    ExpressionAttributeValues: { ':s': status },
  }));
}

export async function updateSession(
  sessionId: string,
  updates: { status: 'ready'; results: unknown } | { status: 'failed'; error: string },
): Promise<void> {
  if (updates.status === 'ready') {
    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: { sessionId },
      UpdateExpression: 'SET #s = :s, results = :r',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':s': 'ready', ':r': updates.results },
    }));
  } else {
    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: { sessionId },
      UpdateExpression: 'SET #s = :s, #e = :e',
      ExpressionAttributeNames: { '#s': 'status', '#e': 'error' },
      ExpressionAttributeValues: { ':s': 'failed', ':e': updates.error },
    }));
  }
}
