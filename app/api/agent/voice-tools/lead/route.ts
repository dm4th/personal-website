import { NextResponse } from 'next/server';
import { submitJobLead, type SubmitJobLeadInput } from '@/lib/agent/tools/submitJobLead';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const result = await submitJobLead(body as SubmitJobLeadInput);
  if (!result.ok) return NextResponse.json({ result: `Couldn't log that lead: ${result.error}` });
  const score = result.data.fitScore ? ` Fit score: ${result.data.fitScore} out of 100.` : '';
  return NextResponse.json({
    result: `Got it — logged the ${body.opportunityTitle ?? 'role'} opportunity at ${body.company ?? 'the company'} into Dan's tracker.${score} He'll follow up.`,
  });
}
