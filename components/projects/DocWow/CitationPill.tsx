'use client';
import type { Citation } from '@/lib/projects/docwow/types';
import styles from './CitationPill.module.css';

interface Props {
  citation: Citation;
  isActive: boolean;
  onClick: (citation: Citation) => void;
}

const TYPE_LABELS = { text: 'p', table: 'tbl', 'key-value': 'kv' };

export default function CitationPill({ citation, isActive, onClick }: Props) {
  return (
    <button
      className={`${styles.pill} ${styles[citation.type]} ${isActive ? styles.active : ''}`}
      onClick={() => onClick(citation)}
      title={citation.quote}
    >
      p{citation.pageNumber} · {TYPE_LABELS[citation.type]}
    </button>
  );
}
