import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { discoveryResponses } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const code = req.headers.get('x-fintechco-results-code');
  const expected = process.env.FINTECHCO_RESULTS_CODE;

  if (!expected || code !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(discoveryResponses)
    .orderBy(desc(discoveryResponses.createdAt));

  return NextResponse.json({ responses: rows });
}
