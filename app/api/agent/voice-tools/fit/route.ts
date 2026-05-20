import { NextResponse } from 'next/server';
import { analyzeJdFit, type JdFitInput } from '@/lib/agent/tools/analyzeJdFit';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const result = await analyzeJdFit(body as JdFitInput);

  if (!result.ok) {
    return NextResponse.json({ result: `Fit analysis failed: ${result.error}` });
  }

  const { fitScore, roleTitle, company, strengths, gaps } = result.data;
  const companyStr = company ? ` at ${company}` : '';
  const topStrength = strengths[0]?.point ?? 'strong relevant experience';
  const topGap = gaps[0]?.point;
  const gapStr = topGap ? ` Main gap: ${topGap}.` : '';

  return NextResponse.json({
    result: `Dan scores ${fitScore} out of 100 for the ${roleTitle}${companyStr} role. Top strength: ${topStrength}.${gapStr}`,
  });
}
