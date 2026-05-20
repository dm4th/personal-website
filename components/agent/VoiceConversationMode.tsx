'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAgentStore, type TextPart } from '@/stores/agent';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import styles from './VoiceConversationMode.module.css';

type ConvPhase = 'listening' | 'thinking' | 'speaking' | 'idle';

export default function VoiceConversationMode() {
  const { sendMessage, isStreaming } = useAgentStore();

  const TOOL_LINES: Record<string, string> = {
    search_content: "Searching Dan's background.",
    analyze_jd_fit: "Running fit analysis. This one takes a moment.",
    compose_email_to_danny: "Drafting an email.",
    schedule_meeting: "Checking Dan's calendar.",
    submit_job_lead: "Logging that opportunity.",
    generate_application_materials: "Generating application materials.",
  };
  const [phase, setPhase] = useState<ConvPhase>('idle');
  const [muted, setMuted] = useState(false);

  // Whether this component is still mounted — guards async callbacks after unmount
  const activeRef = useRef(true);
  useEffect(() => () => { activeRef.current = false; }, []);

  // Stable ref to startListening so the TTS onend closure never goes stale
  const startListeningRef = useRef<() => void>(() => {});

  const ACKS = ['Let me check on that.', 'One moment.', 'On it.', 'Let me look into that.'];

  const handleFinalTranscript = useCallback((text: string) => {
    setPhase('thinking');
    // Speak an immediate acknowledgment so the user hears something while the agent works
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const ack = ACKS[Math.floor(Math.random() * ACKS.length)];
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(ack));
    }
    sendMessage(text, { voiceMode: true });
  }, [sendMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  const { isListening, partialTranscript, error, startListening, stopListening } = useVoiceInput({
    onFinalTranscript: handleFinalTranscript,
  });

  // Keep ref in sync so TTS onend always calls the latest startListening
  useEffect(() => { startListeningRef.current = startListening; }, [startListening]);

  // When streaming ends: read response aloud, then restart mic
  const wasStreamingRef = useRef(false);
  useEffect(() => {
    if (isStreaming) {
      wasStreamingRef.current = true;
      setPhase('thinking');
      return;
    }
    if (!wasStreamingRef.current) return; // streaming never started — skip
    wasStreamingRef.current = false;

    prevToolRef.current = null; // reset so tool lines fire again next turn
    if (muted) {
      if (activeRef.current) setPhase('idle');
      return;
    }

    // Read the last assistant message aloud
    const { messages } = useAgentStore.getState();
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    const text = lastAssistant?.parts
      .filter((p): p is TextPart => p.type === 'text')
      .map((p) => p.text)
      .join('') ?? '';

    if (!text.trim() || !('speechSynthesis' in window)) {
      if (activeRef.current) setPhase('idle');
      return;
    }

    setPhase('speaking');
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.onend = () => {
      if (activeRef.current) setPhase('idle');
    };
    utt.onerror = () => {
      if (activeRef.current) setPhase('idle');
    };
    window.speechSynthesis.speak(utt);
  }, [isStreaming, muted]);

  // Sync listening state → phase
  useEffect(() => {
    if (isListening) setPhase('listening');
  }, [isListening]);

  // Speak tool progress lines — use subscribe (not useEffect) to catch every
  // intermediate activeToolName value before React batches them away
  const prevToolRef = useRef<string | null>(null);
  const mutedRef = useRef(muted);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  useEffect(() => {
    const unsub = useAgentStore.subscribe((state, prev) => {
      const toolName = state.activeToolName;
      if (!toolName || toolName === prev.activeToolName || toolName === prevToolRef.current || mutedRef.current) return;
      prevToolRef.current = toolName;
      const line = TOOL_LINES[toolName];
      if (!line || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(line));
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clean up on unmount only — don't auto-start
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      stopListening();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      setPhase('idle');
    } else {
      startListening();
    }
  };

  const phaseLabel: Record<ConvPhase, string> = {
    listening: partialTranscript ? `"${partialTranscript}"` : 'Listening…',
    thinking: 'Thinking…',
    speaking: 'Speaking…',
    idle: 'Click mic to speak',
  };

  const micDisabled = phase === 'thinking' || phase === 'speaking';

  return (
    <div className={styles.bar}>
      <button
        className={`${styles.micBtn} ${isListening ? styles.active : ''}`}
        onClick={handleMicClick}
        disabled={micDisabled}
        aria-label={isListening ? 'Stop recording' : 'Try voice'}
        title={isListening ? 'Stop recording' : 'Talk to the agent'}
      >
        {isListening && <span className={styles.ring} />}
        🎙
        {!isListening && !micDisabled && <span>Try voice</span>}
      </button>
      <div className={`${styles.orb} ${styles[phase]}`} />
      <span className={styles.label}>
        {error ? <span className={styles.error}>{error}</span> : phaseLabel[phase]}
      </span>
      {(phase === 'speaking' || phase === 'idle') && (
        <button
          className={styles.muteBtn}
          onClick={() => setMuted((m) => !m)}
          title={muted ? 'Unmute agent voice' : 'Mute agent voice'}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      )}
    </div>
  );
}
