'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { UIMessage } from '@/stores/agent';
import ToolCallCard from './ToolCallCard';
import styles from './MessageBubble.module.css';

function FeedbackButtons() {
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);
  return (
    <div className={styles.feedback}>
      <button
        className={`${styles.thumb} ${voted === 'up' ? styles.thumbActive : ''}`}
        onClick={() => setVoted(voted === 'up' ? null : 'up')}
        aria-label="Helpful"
      >
        ↑
      </button>
      <button
        className={`${styles.thumb} ${voted === 'down' ? styles.thumbDown : ''}`}
        onClick={() => setVoted(voted === 'down' ? null : 'down')}
        aria-label="Not helpful"
      >
        ↓
      </button>
    </div>
  );
}

export default function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user';
  const hasText = message.parts.some((p) => p.type === 'text' && p.text.trim());

  return (
    <div className={`${styles.bubble} ${isUser ? styles.user : styles.assistant}`}>
      {message.parts.map((part, i) => {
        if (part.type === 'text') {
          return (
            <div key={i} className={styles.textPart}>
              <ReactMarkdown>{part.text}</ReactMarkdown>
            </div>
          );
        }
        if (part.type === 'tool_use') {
          return <ToolCallCard key={part.toolUseId} part={part} />;
        }
        return null;
      })}
      {!isUser && hasText && <FeedbackButtons />}
    </div>
  );
}
