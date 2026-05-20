'use client';

import { useCallback } from 'react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import styles from './VoiceFab.module.css';

type Props = {
  onTranscript: (text: string) => void;
  disabled?: boolean;
};

export default function VoiceFab({ onTranscript, disabled }: Props) {
  const { isListening, partialTranscript, error, startListening, stopListening } = useVoiceInput({
    onFinalTranscript: onTranscript,
  });

  const handleClick = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  return (
    <div style={{ position: 'relative' }}>
      {partialTranscript && <div className={styles.partial}>{partialTranscript}</div>}
      {error && !isListening && <div className={styles.error}>{error}</div>}
      <button
        className={`${styles.btn} ${isListening ? styles.listening : ''}`}
        onClick={handleClick}
        disabled={disabled && !isListening}
        aria-label={isListening ? 'Stop recording' : 'Start voice input'}
        title={isListening ? 'Click to stop' : 'Click to speak'}
      >
        {isListening && <span className={styles.ring} />}
        🎙
      </button>
    </div>
  );
}
