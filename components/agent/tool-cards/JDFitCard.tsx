'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { ToolUsePart } from '@/stores/agent';
import type { JdFitOutput } from '@/lib/agent/tools/analyzeJdFit';
import styles from './JDFitCard.module.css';

export default function JDFitCard({ part }: { part: ToolUsePart }) {
  const [expanded, setExpanded] = useState(true);
  const [openStrengths, setOpenStrengths] = useState<Set<number>>(new Set());

  const isPending = part.status === 'pending';
  const isError = part.status === 'error';
  const data = part.payload as JdFitOutput | undefined;

  const toggleStrength = (i: number) =>
    setOpenStrengths((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const scoreColor =
    !data ? 'var(--muted)'
    : data.fitScore >= 80 ? '#22c55e'
    : data.fitScore >= 60 ? '#f59e0b'
    : '#ef4444';

  return (
    <div className={styles.card}>
      <button className={styles.header} onClick={() => setExpanded((v) => !v)}>
        <span className={styles.icon}>{isPending ? '⏳' : isError ? '✗' : '📄'}</span>
        <span className={styles.label}>
          {isPending ? 'Analyzing job description…' : (part.summary ?? 'JD Fit Analysis')}
        </span>
        {!isPending && <span className={styles.chevron}>{expanded ? '▲' : '▼'}</span>}
      </button>

      {expanded && !isPending && (
        <div className={styles.body}>
          {isError && <p className={styles.error}>Analysis failed - try pasting the job description again.</p>}

          {data && (
            <>
              {/* Score + role */}
              <div className={styles.scoreRow}>
                <div className={styles.scoreRing} style={{ '--score-color': scoreColor } as React.CSSProperties}>
                  <span className={styles.scoreNum}>{data.fitScore}</span>
                  <span className={styles.scoreDenom}>/100</span>
                </div>
                <div className={styles.roleInfo}>
                  <p className={styles.roleTitle}>{data.roleTitle}</p>
                  {data.company && <p className={styles.company}>{data.company}</p>}
                </div>
              </div>

              {/* Strengths / Gaps columns */}
              <div className={styles.grid}>
                <div className={styles.col}>
                  <h4 className={styles.colTitle}>Strengths</h4>
                  {data.strengths.map((s, i) => (
                    <div key={i} className={styles.item}>
                      <p className={styles.itemPoint}>
                        <span className={styles.checkmark}>✓</span> {s.point}
                      </p>
                      {s.evidence.length > 0 && (
                        <button className={styles.evidenceToggle} onClick={() => toggleStrength(i)}>
                          {openStrengths.has(i)
                            ? 'Hide sources'
                            : `${s.evidence.length} source${s.evidence.length !== 1 ? 's' : ''} →`}
                        </button>
                      )}
                      {openStrengths.has(i) && (
                        <ul className={styles.evidenceList}>
                          {s.evidence.map((e, j) => (
                            <li key={j} className={styles.evidenceItem}>
                              <Link
                                href={`/info/${e.file.replace(/\.md$/, '')}`}
                                className={styles.fileLink}
                              >
                                {e.file}
                              </Link>
                              <span className={styles.excerpt}>{e.excerpt}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>

                <div className={styles.col}>
                  <h4 className={styles.colTitle}>Gaps</h4>
                  {data.gaps.length === 0 && (
                    <p className={styles.noGaps}>No significant gaps identified.</p>
                  )}
                  {data.gaps.map((g, i) => (
                    <div key={i} className={styles.item}>
                      <p className={styles.itemPoint}>
                        <span className={styles.gap}>△</span> {g.point}
                      </p>
                      {g.mitigation && (
                        <p className={styles.mitigation}>{g.mitigation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Talking points */}
              {data.suggestedTalkingPoints.length > 0 && (
                <div className={styles.section}>
                  <h4 className={styles.colTitle}>Talking Points</h4>
                  <ul className={styles.tpList}>
                    {data.suggestedTalkingPoints.map((tp, i) => (
                      <li key={i} className={styles.tp}>{tp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended framing */}
              {data.recommendedRoleFraming && (
                <div className={styles.section}>
                  <h4 className={styles.colTitle}>Recommended Framing</h4>
                  <p className={styles.framingText}>{data.recommendedRoleFraming}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
