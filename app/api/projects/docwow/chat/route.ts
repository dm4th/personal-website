import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CONTAINER_URL = process.env.DOCWOW_CONTAINER_URL;
const CONTAINER_SECRET = process.env.DOCWOW_CONTAINER_SECRET;

const schema = z.object({
  sessionId: z.string().uuid(),
  userMessage: z.string().min(1),
});

export async function POST(req: NextRequest) {
  if (!CONTAINER_URL) {
    return NextResponse.json({ error: 'Service not configured' }, { status: 503 });
  }
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const res = await fetch(`${CONTAINER_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-docwow-secret': CONTAINER_SECRET ?? '' },
    body: JSON.stringify(parsed.data),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
