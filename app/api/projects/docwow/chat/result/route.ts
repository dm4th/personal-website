import { NextRequest, NextResponse } from 'next/server';
import { invokeLambda } from '@/lib/projects/docwow/lambdaInvoke';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  const chatId = req.nextUrl.searchParams.get('chatId');

  if (!sessionId || !chatId) {
    return NextResponse.json({ error: 'Missing sessionId or chatId' }, { status: 400 });
  }

  const result = await invokeLambda('/chat/result', 'GET', { queryParams: { sessionId, chatId } });
  return NextResponse.json(result.body, { status: result.statusCode });
}
