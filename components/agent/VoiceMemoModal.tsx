'use client';

import { useState } from 'react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import styles from './VoiceMemoModal.module.css';

type Props = { onClose: () => void };

type SubmitState = 'idle' | 'sending' | 'sent' | 'error';

export default function VoiceMemoModal({ onClose }: Props) {
  const [pendingTranscript, setPendingTranscript] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  const { isListening, partialTranscript, startListening, stopListening } = useVoiceInput({
    onFinalTranscript: (text) => setPendingTranscript(text),
  });

  const displayText = isListening ? partialTranscript : pendingTranscript;

  const handleMicClick = () => {
    if (isListening) stopListening();
    else {
      setPendingTranscript('');
      startListening();
    }
  };

  const handleSend = async () => {
    if (!pendingTranscript.trim() || submitState === 'sending') return;
    setSubmitState('sending');
    try {
      const res = await fetch('/api/voice-memo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: pendingTranscript }),
      });
      if (!res.ok) throw new Error('Send failed');
      setSubmitState('sent');
      setTimeout(onClose, 1800);
    } catch {
      setSubmitState('error');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <p className={styles.title}>Leave Dan a voice memo</p>
        <p className={styles.subtitle}>Record a message — Dan will get it by email with the transcript.</p>

        {submitState === 'sent' ? (
          <p className={styles.success}>Got it! Dan will hear from you.</p>
        ) : (
          <>
            <div className={styles.micArea}>
              <button
                className={`${styles.micBtn} ${isListening ? styles.recording : ''}`}
                onClick={handleMicClick}
                aria-label={isListening ? 'Stop recording' : 'Start recording'}
              >
                🎙
              </button>
              <span className={styles.hint}>
                {isListening ? 'Recording… click to stop' : pendingTranscript ? 'Re-record or send below' : 'Click to start recording'}
              </span>
            </div>

            {displayText && (
              <div className={styles.transcript}>{displayText}</div>
            )}

            <div className={styles.actions}>
              <button className={styles.btn} onClick={onClose}>Cancel</button>
              <button
                className={`${styles.btn} ${styles.primary}`}
                onClick={handleSend}
                disabled={!pendingTranscript.trim() || submitState === 'sending' || isListening}
              >
                {submitState === 'sending' ? 'Sending…' : submitState === 'error' ? 'Retry' : 'Send to Dan'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
