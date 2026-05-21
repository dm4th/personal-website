import { NextRequest, NextResponse } from 'next/server';

const CONTAINER_URL = process.env.DOCWOW_CONTAINER_URL;
const CONTAINER_SECRET = process.env.DOCWOW_CONTAINER_SECRET;

export async function GET(req: NextRequest) {
  if (!CONTAINER_URL) {
    return NextResponse.json({ error: 'Service not configured' }, { status: 503 });
  }
  const filename = req.nextUrl.searchParams.get('filename') ?? 'document.pdf';
  const res = await fetch(`${CONTAINER_URL}/upload-url?filename=${encodeURIComponent(filename)}`, {
    headers: { 'x-docwow-secret': CONTAINER_SECRET ?? '' },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
