import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const DANNY_EMAIL = process.env.CONTACT_TO_EMAIL ?? 'danny.mathieson233@gmail.com';
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? 'onboarding@resend.dev';

export async function POST(req: NextRequest) {
  let body: { transcript: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { transcript } = body;
  if (!transcript?.trim()) return NextResponse.json({ error: 'Empty transcript' }, { status: 400 });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: `Website Voice Memo <${FROM_EMAIL}>`,
    to: DANNY_EMAIL,
    subject: 'Voice memo from a visitor',
    text: `Someone left you a voice memo on your website:\n\n"${transcript}"\n\n— Sent via voice memo on danmathieson.com`,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
