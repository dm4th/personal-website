'use client';

import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import styles from './VoiceAgentMode.module.css';

const PHASE_LABEL: Record<string, string> = {
  connecting: 'Connecting…',
  listening: 'Listening…',
  thinking: 'Thinking…',
  speaking: 'Speaking…',
};

const TOOL_LABEL: Record<string, string> = {
  search_dans_background: 'Researching…',
  analyze_job_fit: 'Analyzing job fit…',
  submit_job_lead: 'Logging opportunity…',
};

export default function VoiceAgentMode() {
  const { phase, transcript, error, activeTool, lastSearch, connect, disconnect } = useVoiceAgent();
  const connected = phase !== 'idle' && phase !== 'error';

  const handleBarClick = () => {
    if (!connected) connect();
  };

  const phaseLabel = activeTool && phase === 'thinking'
    ? activeTool === 'search_dans_background' && lastSearch
      ? `Researching: ${lastSearch}…`
      : TOOL_LABEL[activeTool] ?? 'Thinking…'
    : PHASE_LABEL[phase] ?? '';

  return (
    <div
      className={`${styles.bar} ${connected ? styles.connected : ''}`}
      onClick={handleBarClick}
      role={connected ? undefined : 'button'}
      tabIndex={connected ? undefined : 0}
      onKeyDown={connected ? undefined : (e) => e.key === 'Enter' && connect()}
      aria-label={connected ? undefined : 'Start voice conversation'}
    >
      {!connected ? (
        <span className={styles.connectLabel}>
          ✨ Chat with my Voice Assistant ✨
        </span>
      ) : (
        <>
          <div className={`${styles.orb} ${styles[phase]}`} />
          <div className={styles.labelStack}>
            <span className={styles.label}>
              {error
                ? <span className={styles.error}>{error}</span>
                : transcript
                  ? `"${transcript}"`
                  : phaseLabel}
            </span>
            {lastSearch && (phase === 'listening' || phase === 'speaking') && (
              <span className={styles.searchHint}>Searched: {lastSearch}</span>
            )}
          </div>
          <button
            className={styles.disconnectBtn}
            onClick={(e) => { e.stopPropagation(); disconnect(); }}
            title="End voice session"
            aria-label="Disconnect"
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
}
