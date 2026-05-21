import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { invokeLambda } from '@/lib/projects/docwow/lambdaInvoke';

const schema = z.object({
  s3Key: z.string().min(1),
  profile: z.object({
    template: z.enum(['patient', 'provider', 'reviewer', 'custom']),
    role: z.string().min(1),
    goal: z.string().min(1),
  }),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const result = await invokeLambda('/start', 'POST', { body: parsed.data });
  return NextResponse.json(result.body, { status: result.statusCode });
}
