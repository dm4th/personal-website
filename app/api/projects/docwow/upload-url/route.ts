import { NextRequest, NextResponse } from 'next/server';
import { invokeLambda } from '@/lib/projects/docwow/lambdaInvoke';

export async function GET(req: NextRequest) {
  const filename = req.nextUrl.searchParams.get('filename') ?? 'document.pdf';
  const result = await invokeLambda('/upload-url', 'GET', {
    queryParams: { filename },
  });
  return NextResponse.json(result.body, { status: result.statusCode });
}
