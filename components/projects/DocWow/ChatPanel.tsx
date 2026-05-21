'use client';
import { useRef, useEffect, useState } from 'react';
import type { ChatMessage, Citation } from '@/lib/projects/docwow/types';
import MessageBubble from './MessageBubble';
import styles from './ChatPanel.module.css';

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
  activeCitationId: string | null;
  suggestedQuestions: string[];
  onSend: (msg: string) => void;
  onCitationClick: (citation: Citation) => void;
}

export default function ChatPanel({ messages, isLoading, activeCitationId, suggestedQuestions, onSend, onCitationClick }: Props) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const submit = () => {
    const msg = input.trim();
    if (!msg || isLoading) return;
    setInput('');
    onSend(msg);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.messages}>
        {messages.length === 0 && suggestedQuestions.length > 0 && (
          <div className={styles.suggestions}>
            <p className={styles.suggestLabel}>Try asking:</p>
            {suggestedQuestions.map((q) => (
              <button key={q} className={styles.suggestion} onClick={() => onSend(q)}>{q}</button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} activeCitationId={activeCitationId} onCitationClick={onCitationClick} />
        ))}
        {isLoading && (
          <div className={`${styles.bubble} ${styles.assistant}`}>
            <span className={styles.dots}><span /><span /><span /></span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className={styles.inputRow}>
        <textarea
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder="Ask about this document..."
          rows={2}
        />
        <button className={styles.sendBtn} onClick={submit} disabled={isLoading || !input.trim()}>Send</button>
      </div>
    </div>
  );
}
