import { NextRequest, NextResponse } from 'next/server';
import { invokeLambda } from '@/lib/projects/notion-meeting-intelligence/lambdaInvoke';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  const result = await invokeLambda('/analyze/results', 'GET', { queryParams: { sessionId } });
  return NextResponse.json(result.body, { status: result.statusCode });
}
