import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { invokeLambda, invokeLambdaAsync } from '@/lib/projects/docwow/lambdaInvoke';

const schema = z.object({
  sessionId: z.string().uuid(),
  userMessage: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { sessionId, userMessage } = parsed.data;

  // Step 1: reserve a chatId in DynamoDB (fast, <500ms)
  const startResult = await invokeLambda('/chat/start', 'POST', { body: { sessionId, userMessage } });
  if (startResult.statusCode !== 200) {
    return NextResponse.json(startResult.body, { status: startResult.statusCode });
  }

  const { chatId } = startResult.body as { chatId: string };

  // Step 2: fire the Claude call asynchronously — returns ~200ms from AWS ACK
  await invokeLambdaAsync('/chat/execute', 'POST', { body: { sessionId, userMessage, chatId } });

  return NextResponse.json({ chatId });
}
