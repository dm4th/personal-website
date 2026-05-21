import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { DocSession, ChatTurn } from './types';

const credentials = process.env.AWS_ACCESS_KEY_ID
  ? {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      sessionToken: process.env.AWS_SESSION_TOKEN,
    }
  : undefined;

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
  ...(credentials && { credentials }),
});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE = process.env.DYNAMO_TABLE ?? 'docwow-sessions';

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

export async function updateSession(
  sessionId: string,
  updates: Partial<Pick<DocSession, 'status' | 'blocks' | 'pageCount' | 'suggestedQuestions'>>,
): Promise<void> {
  const expressions: string[] = [];
  const names: Record<string, string> = {};
  const values: Record<string, unknown> = {};

  if (updates.status !== undefined) {
    expressions.push('#s = :s');
    names['#s'] = 'status';
    values[':s'] = updates.status;
  }
  if (updates.blocks !== undefined) {
    expressions.push('blocks = :b');
    values[':b'] = updates.blocks;
  }
  if (updates.pageCount !== undefined) {
    expressions.push('pageCount = :p');
    values[':p'] = updates.pageCount;
  }
  if (updates.suggestedQuestions !== undefined) {
    expressions.push('suggestedQuestions = :q');
    values[':q'] = updates.suggestedQuestions;
  }

  if (expressions.length === 0) return;

  await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { sessionId },
      UpdateExpression: `SET ${expressions.join(', ')}`,
      ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
      ExpressionAttributeValues: values,
    }),
  );
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

export async function storePendingChat(sessionId: string, chatId: string): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { sessionId },
      UpdateExpression: 'SET pendingChat = :pc',
      ExpressionAttributeValues: {
        ':pc': { chatId, status: 'processing' },
      },
    }),
  );
}

export async function resolvePendingChat(
  sessionId: string,
  chatId: string,
  result: { answer: string; citations: unknown[] } | { error: string },
): Promise<void> {
  const isError = 'error' in result;
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { sessionId },
      UpdateExpression: 'SET pendingChat = :pc',
      ExpressionAttributeValues: {
        ':pc': isError
          ? { chatId, status: 'failed', error: (result as { error: string }).error }
          : { chatId, status: 'ready', answer: (result as { answer: string; citations: unknown[] }).answer, citations: (result as { answer: string; citations: unknown[] }).citations },
      },
    }),
  );
}
