'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { UIMessage } from '@/stores/agent';
import ToolCallCard from './ToolCallCard';
import styles from './MessageBubble.module.css';

export default function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user';

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
    </div>
  );
}
