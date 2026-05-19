'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { UIMessage, ToolUsePart } from '@/stores/agent';
import ToolCallCard from './ToolCallCard';
import SearchGroupCard from './tool-cards/SearchGroupCard';
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

type RenderItem =
  | { kind: 'text'; index: number }
  | { kind: 'search_group'; parts: ToolUsePart[] }
  | { kind: 'tool'; part: ToolUsePart };

function buildRenderItems(message: UIMessage): RenderItem[] {
  const searchParts = message.parts.filter(
    (p): p is ToolUsePart => p.type === 'tool_use' && p.name === 'search_content',
  );

  const items: RenderItem[] = [];
  let searchGroupInserted = false;

  message.parts.forEach((part, i) => {
    if (part.type === 'text') {
      items.push({ kind: 'text', index: i });
    } else if (part.type === 'tool_use' && part.name === 'search_content') {
      if (!searchGroupInserted && searchParts.length > 0) {
        items.push({ kind: 'search_group', parts: searchParts });
        searchGroupInserted = true;
      }
    } else if (part.type === 'tool_use') {
      items.push({ kind: 'tool', part: part as ToolUsePart });
    }
  });

  return items;
}

export default function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user';
  const hasText = message.parts.some((p) => p.type === 'text' && p.text.trim());
  const items = buildRenderItems(message);

  return (
    <div className={`${styles.bubble} ${isUser ? styles.user : styles.assistant}`}>
      {items.map((item, i) => {
        if (item.kind === 'text') {
          const part = message.parts[item.index];
          if (part.type !== 'text') return null;
          return (
            <div key={i} className={styles.textPart}>
              <ReactMarkdown>{part.text}</ReactMarkdown>
            </div>
          );
        }
        if (item.kind === 'search_group') {
          return <SearchGroupCard key="search-group" parts={item.parts} />;
        }
        if (item.kind === 'tool') {
          return <ToolCallCard key={item.part.toolUseId} part={item.part} />;
        }
        return null;
      })}
      {!isUser && hasText && <FeedbackButtons />}
    </div>
  );
}
