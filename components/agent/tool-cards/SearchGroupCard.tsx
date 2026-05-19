'use client';

import React, { useState } from 'react';
import type { ToolUsePart } from '@/stores/agent';
import SearchContentCard from './SearchContentCard';
import styles from './SearchGroupCard.module.css';

export default function SearchGroupCard({ parts }: { parts: ToolUsePart[] }) {
  const [expanded, setExpanded] = useState(false);

  const anyPending = parts.some((p) => p.status === 'pending');
  const errorCount = parts.filter((p) => p.status === 'error').length;
  const total = parts.length;

  const label = anyPending
    ? `Researching… (${total} search${total !== 1 ? 'es' : ''})`
    : errorCount > 0
    ? `Researched (${total} searches, ${errorCount} skipped)`
    : `Researched (${total} search${total !== 1 ? 'es' : ''})`;

  return (
    <div className={styles.group}>
      <button className={styles.header} onClick={() => setExpanded((v) => !v)}>
        <span className={styles.icon}>{anyPending ? '⏳' : '🔍'}</span>
        <span className={styles.label}>{label}</span>
        {!anyPending && <span className={styles.chevron}>{expanded ? '▲' : '▼'}</span>}
      </button>
      {expanded && (
        <div className={styles.body}>
          {parts.map((p) => (
            <SearchContentCard key={p.toolUseId} part={p} />
          ))}
        </div>
      )}
    </div>
  );
}
