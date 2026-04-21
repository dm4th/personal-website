'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { SignInButton } from '@clerk/nextjs';
import { useAgentStore } from '@/stores/agent';
import MessageList from './MessageList';
import Composer from './Composer';
import SuggestionsRail from './SuggestionsRail';
import SignupNudge from './SignupNudge';
import styles from './AgentPanel.module.css';

type MemoState = 'idle' | 'saving' | 'saved' | 'error';

export default function AgentPanel() {
  const { panelState, setPanelState, messages, isStreaming, nudgeDismissed, dismissNudge, sendMessage, sessionId,
    engagementExpanded, setEngagementExpanded } = useAgentStore();
  const { isSignedIn } = useAuth();
  const [memoState, setMemoState] = useState<MemoState>('idle');
  const [memoId, setMemoId] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && panelState === 'expanded') setPanelState('sidebar');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [panelState, setPanelState]);

  const showNudge = !isSignedIn && !nudgeDismissed && messages.length >= 3;
  const canSaveMemo = isSignedIn && messages.length >= 2;
  const isEngaged = engagementExpanded && panelState === 'sidebar' && messages.length > 0;

  const handleSaveMemo = async () => {
    if (memoState !== 'idle' && memoState !== 'error') return;
    setMemoState('saving');
    try {
      const textMessages = messages
        .filter((m) => m.parts.some((p) => p.type === 'text' && p.text.trim()))
        .map((m) => ({
          role: m.role,
          text: m.parts
            .filter((p) => p.type === 'text')
            .map((p) => p.text)
            .join(''),
        }));

      const res = await fetch('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: textMessages, sessionId }),
      });
      if (!res.ok) throw new Error('Save failed');
      const json = await res.json();
      setMemoId(json.memoId);
      setMemoState('saved');
    } catch {
      setMemoState('error');
    }
  };

  if (panelState === 'collapsed') {
    return (
      <button className={styles.fab} onClick={() => setPanelState('sidebar')} aria-label="Open agent">
        <span className={styles.fabPulse} />
        ⚡
      </button>
    );
  }

  return (
    <>
      {panelState === 'expanded' && (
        <div className={styles.scrim} onClick={() => setPanelState('sidebar')} />
      )}
      {isEngaged && (
        <div className={styles.engagedScrim} onClick={() => setEngagementExpanded(false)} />
      )}
      <div className={styles.panelInner} data-expanded={panelState === 'expanded'} data-engaged={isEngaged ? 'true' : undefined}>
        <div className={styles.header}>
          <span className={styles.title}>Ask the Agent</span>
          <div className={styles.controls}>
            {canSaveMemo && memoState === 'idle' && (
              <button className={styles.memoBtn} onClick={handleSaveMemo} title="Save as memo">
                Save
              </button>
            )}
            {memoState === 'saving' && <span className={styles.memoStatus}>Saving…</span>}
            {memoState === 'saved' && memoId && (
              <a href={`/memos/${memoId}`} className={styles.memoLink} target="_blank" rel="noopener noreferrer">
                Saved ↗
              </a>
            )}
            {memoState === 'error' && (
              <button className={styles.memoBtn} onClick={handleSaveMemo} title="Retry">
                Retry
              </button>
            )}
            {!isSignedIn && <span className={styles.guestBadge}>Guest</span>}
            {isEngaged && (
              <button
                className={styles.controlBtn}
                title="Collapse panel"
                onClick={() => setEngagementExpanded(false)}
              >
                ›
              </button>
            )}
            <button
              className={styles.controlBtn}
              title={panelState === 'expanded' ? 'Exit focus mode' : 'Focus mode'}
              onClick={() => setPanelState(panelState === 'expanded' ? 'sidebar' : 'expanded')}
            >
              {panelState === 'expanded' ? '⊙' : '⤢'}
            </button>
            <button className={styles.controlBtn} title="Minimize" onClick={() => setPanelState('collapsed')}>
              ×
            </button>
          </div>
        </div>

        <MessageList messages={messages} isStreaming={isStreaming} onSend={sendMessage} />

        {showNudge && (
          <div className={styles.nudgeRow}>
            <SignupNudge reason="Sign up to save this conversation as a memo." />
            <button className={styles.nudgeDismiss} onClick={dismissNudge}>×</button>
          </div>
        )}

        <SuggestionsRail messages={messages} onSend={sendMessage} disabled={isStreaming} />
        <Composer onSend={sendMessage} disabled={isStreaming} />
      </div>
    </>
  );
}
