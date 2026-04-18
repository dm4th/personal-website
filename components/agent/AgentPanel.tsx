'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useAgentStore } from '@/stores/agent';
import MessageList from './MessageList';
import Composer from './Composer';
import SignupNudge from './SignupNudge';
import styles from './AgentPanel.module.css';

export default function AgentPanel() {
  const { panelState, setPanelState, messages, isStreaming, nudgeDismissed, dismissNudge, sendMessage } =
    useAgentStore();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && panelState === 'expanded') {
        setPanelState('sidebar');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [panelState, setPanelState]);

  const showNudge = !isSignedIn && !nudgeDismissed && messages.length >= 3;

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
      <div className={styles.panelInner} data-expanded={panelState === 'expanded'}>
        <div className={styles.header}>
          <span className={styles.title}>Ask the Agent</span>
          <div className={styles.controls}>
            {!isSignedIn && <span className={styles.guestBadge}>Guest</span>}
            <button
              className={styles.controlBtn}
              title={panelState === 'expanded' ? 'Exit focus mode' : 'Focus mode'}
              onClick={() => setPanelState(panelState === 'expanded' ? 'sidebar' : 'expanded')}
            >
              {panelState === 'expanded' ? '⊙' : '⤢'}
            </button>
            <button
              className={styles.controlBtn}
              title="Minimize"
              onClick={() => setPanelState('collapsed')}
            >
              ×
            </button>
          </div>
        </div>

        <MessageList messages={messages} isStreaming={isStreaming} />

        {showNudge && (
          <div className={styles.nudgeRow}>
            <SignupNudge reason="Want to save this conversation? Create an account." />
            <button className={styles.nudgeDismiss} onClick={dismissNudge}>×</button>
          </div>
        )}

        <Composer onSend={sendMessage} disabled={isStreaming} />
      </div>
    </>
  );
}
