'use client';
import type { Citation } from '@/lib/projects/docwow/types';
import styles from './CitationPill.module.css';

interface Props {
  citation: Citation;
  isActive: boolean;
  onClick: (citation: Citation) => void;
}

const TYPE_LABELS = { text: 'p', table: 'tbl', 'key-value': 'kv' };

function confidenceLabel(confidence?: number): string {
  if (confidence === undefined) return '';
  if (confidence >= 99) return ''; // Perfect - no need to flag
  if (confidence >= 90) return ` · ${Math.round(confidence)}%`;
  return ` · ${Math.round(confidence)}% ⚠`;
}

export default function CitationPill({ citation, isActive, onClick }: Props) {
  const conf = confidenceLabel(citation.confidence);
  return (
    <button
      className={`${styles.pill} ${styles[citation.type]} ${isActive ? styles.active : ''}`}
      onClick={() => onClick(citation)}
      title={`${citation.quote}${citation.confidence !== undefined ? ` (OCR confidence: ${Math.round(citation.confidence)}%)` : ''}`}
    >
      p{citation.pageNumber} · {TYPE_LABELS[citation.type]}{conf}
    </button>
  );
}
