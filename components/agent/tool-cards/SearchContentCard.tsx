'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { ToolUsePart } from '@/stores/agent';
import styles from './SearchContentCard.module.css';

type FileMatch = { file: string; line: number; text: string };
type FileEntry = { name: string; type: 'file' | 'directory'; path: string };

export default function SearchContentCard({ part }: { part: ToolUsePart }) {
  const [expanded, setExpanded] = useState(false);
  const payload = part.payload as Record<string, unknown> | undefined;

  const isPending = part.status === 'pending';
  const isError = part.status === 'error';

  const input = (() => {
    try { return JSON.parse(part.displayInput); } catch { return {}; }
  })();

  const label =
    input.action === 'list' ? `Listing ${input.category ?? '/info'}…` :
    input.action === 'read' ? `Reading ${input.path}…` :
    input.action === 'grep' ? `Searching for "${input.pattern}"…` : 'Searching…';

  const matches = payload?.matches as FileMatch[] | undefined;
  const files = payload?.content
    ? undefined
    : payload as FileEntry[] | undefined;
  const fileContent = payload?.content as string | undefined;

  return (
    <div className={`${styles.card} ${isPending ? styles.pending : ''}`}>
      <button className={styles.header} onClick={() => setExpanded((v) => !v)}>
        <span className={styles.icon}>{isPending ? '⏳' : isError ? '✗' : '🔍'}</span>
        <span className={styles.label}>{isPending ? label : part.summary ?? label}</span>
        {!isPending && <span className={styles.chevron}>{expanded ? '▲' : '▼'}</span>}
      </button>

      {expanded && !isPending && (
        <div className={styles.body}>
          {isError && <p className={styles.error}>Tool error</p>}

          {/* Grep results */}
          {matches && matches.length > 0 && (
            <ul className={styles.matchList}>
              {matches.map((m, i) => (
                <li key={i} className={styles.match}>
                  <Link href={`/info/${m.file.replace(/\.md$/, '')}`} className={styles.fileLink}>
                    {m.file}:{m.line}
                  </Link>
                  <span className={styles.matchText}>{m.text.slice(0, 120)}</span>
                </li>
              ))}
            </ul>
          )}
          {matches && matches.length === 0 && <p className={styles.empty}>No matches found.</p>}

          {/* Directory listing */}
          {Array.isArray(payload) && (
            <ul className={styles.fileList}>
              {(payload as FileEntry[]).map((f) => (
                <li key={f.path}>
                  {f.type === 'file' ? (
                    <Link href={`/info/${f.path.replace(/\.md$/, '')}`} className={styles.fileLink}>
                      {f.name}
                    </Link>
                  ) : (
                    <span className={styles.dirEntry}>📁 {f.name}/</span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* File content preview */}
          {fileContent && (
            <pre className={styles.preview}>{fileContent.slice(0, 800)}{fileContent.length > 800 ? '\n…' : ''}</pre>
          )}
        </div>
      )}
    </div>
  );
}
