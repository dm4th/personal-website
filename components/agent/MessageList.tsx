'use client';

import React, { useEffect, useRef } from 'react';
import type { UIMessage } from '@/stores/agent';
import MessageBubble from './MessageBubble';
import styles from './MessageList.module.css';

type Props = { messages: UIMessage[]; isStreaming: boolean };

export default function MessageList({ messages, isStreaming }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>Ask me anything about Dan</p>
        <ul className={styles.suggestions}>
          <li onClick={() => {}} className={styles.suggestion}>What&apos;s Dan&apos;s background in AI?</li>
          <li className={styles.suggestion}>Paste a job description to check fit →</li>
          <li className={styles.suggestion}>What projects has Dan shipped?</li>
        </ul>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isStreaming && (
        <div className={styles.typing}>
          <span /><span /><span />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
