import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { DocSession, ChatTurn } from './types';

const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? 'us-east-1' });
const ddb = DynamoDBDocumentClient.from(client);
const TABLE = process.env.DOCWOW_SESSIONS_TABLE ?? 'docwow-sessions';

// Sessions expire after 2 hours
const SESSION_TTL_SECONDS = 2 * 60 * 60;

export async function saveSession(session: Omit<DocSession, 'createdAt' | 'ttl'>): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const item: DocSession = {
    ...session,
    createdAt: new Date().toISOString(),
    ttl: now + SESSION_TTL_SECONDS,
  };
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
}

export async function getSession(sessionId: string): Promise<DocSession | null> {
  const result = await ddb.send(new GetCommand({ TableName: TABLE, Key: { sessionId } }));
  return (result.Item as DocSession) ?? null;
}

export async function appendHistory(sessionId: string, turn: ChatTurn): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { sessionId },
      UpdateExpression: 'SET history = list_append(if_not_exists(history, :empty), :turn)',
      ExpressionAttributeValues: {
        ':empty': [],
        ':turn': [turn],
      },
    })
  );
}
