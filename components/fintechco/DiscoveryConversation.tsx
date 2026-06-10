'use client';

import { useEffect, useRef, useState } from 'react';
import { useFintechcoDiscoveryStore } from '@/stores/fintechcoDiscovery';
import { DISCOVERY_PERSONAS, type DiscoveryPersona } from '@/lib/fintechco/discoveryPrompt';
import styles from './DiscoveryConversation.module.css';

const PERSONA_ORDER: DiscoveryPersona[] = ['cto', 'head_of_dt', 'other'];
const WRAP_UP_MESSAGE = "I need to wrap up now, thanks.";

export default function DiscoveryConversation() {
  const {
    persona,
    messages,
    transcript,
    isStreaming,
    completed,
    visitorLabel,
    submitted,
    selectPersona,
    send,
    setVisitorLabel,
    submitResponse,
  } = useFintechcoDiscoveryStore();
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ID of the message currently being streamed: empty text means still thinking
  const activeMessageId = isStreaming ? messages[messages.length - 1]?.id : undefined;

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming || completed) return;
    send(trimmed);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleWrapUp = () => {
    if (isStreaming || completed) return;
    send(WRAP_UP_MESSAGE);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  if (!persona) {
    return (
      <div className={styles.chooser}>
        <span className={styles.kicker}>FinTechCo · Before we meet</span>
        <h1 className={styles.title}>Pre-Meeting Discovery</h1>
        <p className={styles.intro}>
          Pick the seat that&apos;s closest to yours. We&apos;ll ask a handful of quick
          questions so the session is shaped around your priorities.
        </p>
        <div className={styles.cards}>
          {PERSONA_ORDER.map((key) => {
            const config = DISCOVERY_PERSONAS[key];
            return (
              <button key={key} className={styles.card} onClick={() => selectPersona(key)}>
                <h2 className={styles.cardTitle}>{config.label}</h2>
                <p className={styles.cardBlurb}>{config.blurb}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.conversation}>
      <div className={styles.messages}>
        {messages.map((m) => {
          const isActive = m.id === activeMessageId;
          const isThinking = isActive && m.text === '';
          return (
            <div
              key={m.id}
              className={m.role === 'user' ? styles.userBubble : styles.assistantBubble}
            >
              {isThinking ? (
                <span className={styles.thinkingDots} aria-label="Thinking">
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </span>
              ) : (
                <>
                  {m.text}
                  {isActive && <span className={styles.streamCursor} aria-hidden />}
                </>
              )}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      {completed ? (
        <div className={styles.details}>
          {submitted ? (
            <div className={styles.done}>
              Thanks for sharing your perspective! We&apos;ll use this to shape the session.
            </div>
          ) : (
            <div className={styles.detailsInput}>
              <input
                type="text"
                className={styles.nameInput}
                placeholder="Your name (optional)"
                value={visitorLabel}
                onChange={(e) => setVisitorLabel(e.target.value)}
              />
              <button className={styles.doneBtn} onClick={submitResponse}>
                Done
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={`${styles.composer} ${isStreaming ? styles.composerStreaming : ''}`}>
          <div className={styles.composerRow}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={isStreaming ? 'Responding…' : 'Type your answer…'}
              disabled={isStreaming}
              rows={2}
            />
            <button
              className={styles.sendBtn}
              onClick={handleSubmit}
              disabled={isStreaming || !input.trim()}
              aria-label="Send"
            >
              ↑
            </button>
          </div>
          {transcript.length > 0 && (
            <div className={styles.wrapUp}>
              <button
                className={styles.wrapUpBtn}
                onClick={handleWrapUp}
                disabled={isStreaming}
              >
                Wrap up early
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
