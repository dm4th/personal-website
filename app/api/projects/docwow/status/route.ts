import { NextRequest, NextResponse } from 'next/server';
import { invokeLambda } from '@/lib/projects/docwow/lambdaInvoke';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }
  const result = await invokeLambda('/status', 'GET', { queryParams: { sessionId } });
  return NextResponse.json(result.body, { status: result.statusCode });
}
