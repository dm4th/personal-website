'use client';
import type { ChatMessage, Citation } from '@/lib/projects/docwow/types';
import CitationPill from './CitationPill';
import styles from './MessageBubble.module.css';

interface Props {
  message: ChatMessage;
  activeCitationId: string | null;
  onCitationClick: (citation: Citation) => void;
}

export default function MessageBubble({ message, activeCitationId, onCitationClick }: Props) {
  const isUser = message.role === 'user';
  return (
    <div className={`${styles.bubble} ${isUser ? styles.user : styles.assistant}`}>
      <p className={styles.content}>{message.content}</p>
      {message.citations && message.citations.length > 0 && (
        <div className={styles.citations}>
          {message.citations.map((c) => (
            <CitationPill
              key={c.blockId}
              citation={c}
              isActive={activeCitationId === c.blockId}
              onClick={onCitationClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
