import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Claude response + DynamoDB reads
import { z } from 'zod';
import { invokeLambda } from '@/lib/projects/docwow/lambdaInvoke';

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
  const result = await invokeLambda('/chat', 'POST', { body: parsed.data });
  return NextResponse.json(result.body, { status: result.statusCode });
}
