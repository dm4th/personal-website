'use client';

import React, { useState } from 'react';
import { useAuth, SignInButton } from '@clerk/nextjs';
import type { ToolUsePart } from '@/stores/agent';
import type { ComposeEmailOutput } from '@/lib/agent/tools/composeEmail';
import styles from './EmailDraftCard.module.css';

type SendState = 'idle' | 'sending' | 'sent' | 'error';

export default function EmailDraftCard({ part }: { part: ToolUsePart }) {
  const [expanded, setExpanded] = useState(true);
  const [sendState, setSendState] = useState<SendState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { isSignedIn } = useAuth();

  const isPending = part.status === 'pending';
  const isError = part.status === 'error';
  const data = part.payload as ComposeEmailOutput | undefined;

  const handleSend = async () => {
    if (!data || sendState !== 'idle') return;
    setSendState('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/agent/tools/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: data.subject,
          bodyMarkdown: data.bodyMarkdown,
          bodyPlain: data.bodyPlain,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Send failed');
      }
      setSendState('sent');
    } catch (err) {
      setErrorMsg(String(err));
      setSendState('error');
    }
  };

  return (
    <div className={styles.card}>
      <button className={styles.header} onClick={() => setExpanded((v) => !v)}>
        <span className={styles.icon}>{isPending ? '⏳' : isError ? '✗' : '✉️'}</span>
        <span className={styles.label}>
          {isPending ? 'Drafting email…' : (part.summary ?? 'Email draft')}
        </span>
        {!isPending && <span className={styles.chevron}>{expanded ? '▲' : '▼'}</span>}
      </button>

      {expanded && !isPending && (
        <div className={styles.body}>
          {isError && <p className={styles.error}>Failed to generate email draft.</p>}

          {data && sendState !== 'sent' && (
            <>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Subject</span>
                <span className={styles.fieldValue}>{data.subject}</span>
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Body</span>
                <pre className={styles.bodyPreview}>{data.bodyPlain}</pre>
              </div>

              <div className={styles.sendRow}>
                {isSignedIn ? (
                  <button
                    className={styles.sendBtn}
                    onClick={handleSend}
                    disabled={sendState === 'sending'}
                  >
                    {sendState === 'sending' ? 'Sending…' : 'Send email →'}
                  </button>
                ) : (
                  <div className={styles.guestSend}>
                    <span className={styles.guestNote}>Sign in to send this email as yourself</span>
                    <SignInButton mode="modal">
                      <button className={styles.sendBtn}>Sign in to send →</button>
                    </SignInButton>
                  </div>
                )}
                {sendState === 'error' && (
                  <p className={styles.sendError}>{errorMsg}</p>
                )}
              </div>
            </>
          )}

          {sendState === 'sent' && (
            <div className={styles.sentConfirmation}>
              <span className={styles.sentIcon}>✓</span>
              <p className={styles.sentText}>Email sent to Dan. He&apos;ll reply to your email address.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
