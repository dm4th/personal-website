import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { Resend } from 'resend';
import { db } from '@/lib/db/client';
import { draftedEmails } from '@/lib/db/schema';

const DANNY_EMAIL = process.env.CONTACT_TO_EMAIL ?? 'danny.mathieson233@gmail.com';
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? 'onboarding@resend.dev';

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let body: { subject: string; bodyMarkdown: string; bodyPlain: string; sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { subject, bodyMarkdown, bodyPlain, sessionId } = body;
  if (!subject || !bodyPlain) {
    return NextResponse.json({ error: 'subject and bodyPlain are required' }, { status: 400 });
  }

  const senderEmail = user.emailAddresses[0]?.emailAddress ?? '';
  const senderName = [user.firstName, user.lastName].filter(Boolean).join(' ') || senderEmail;

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: `Website Contact <${FROM_EMAIL}>`,
      to: DANNY_EMAIL,
      replyTo: senderEmail,
      subject,
      text: `From: ${senderName} <${senderEmail}>\n\n${bodyPlain}`,
    });

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? 'Send failed' }, { status: 500 });
    }

    // Record in DB (best-effort — don't fail the response if this errors)
    try {
      await db.insert(draftedEmails).values({
        sessionId: sessionId ?? null,
        subject,
        bodyMarkdown: bodyMarkdown ?? bodyPlain,
        bodyPlain,
        status: 'sent',
        resendMessageId: data.id,
        sentAt: new Date(),
      });
    } catch {
      // non-blocking
    }

    return NextResponse.json({ ok: true, messageId: data.id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
