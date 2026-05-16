'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { ToolUsePart } from '@/stores/agent';
import type { GenerateMaterialsOutput } from '@/lib/agent/tools/generateApplicationMaterials';
import styles from './ApplicationMaterialsCard.module.css';

export default function ApplicationMaterialsCard({ part }: { part: ToolUsePart }) {
  const [expanded, setExpanded] = useState(true);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [openStrengths, setOpenStrengths] = useState<Set<number>>(new Set());

  const isPending = part.status === 'pending';
  const isError = part.status === 'error';
  const data = part.payload as GenerateMaterialsOutput | undefined;

  const toggleStrength = (i: number) =>
    setOpenStrengths((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const scoreColor =
    !data ? 'var(--muted)'
    : data.fitScore >= 90 ? '#22c55e'
    : data.fitScore >= 85 ? '#3b82f6'
    : data.fitScore >= 80 ? '#eab308'
    : data.fitScore >= 70 ? '#f59e0b'
    : '#ef4444';

  return (
    <div className={styles.card}>
      <button className={styles.header} onClick={() => setExpanded((v) => !v)}>
        <span className={styles.icon}>{isPending ? '⏳' : isError ? '✗' : '📝'}</span>
        <span className={styles.label}>
          {isPending ? 'Generating application materials…' : (part.summary ?? 'Application Materials')}
        </span>
        {!isPending && <span className={styles.chevron}>{expanded ? '▲' : '▼'}</span>}
      </button>

      {expanded && !isPending && (
        <div className={styles.body}>
          {isError && (
            <p className={styles.error}>
              {(data as unknown as { error?: string })?.error ?? 'Materials generation failed - try again or paste the JD text directly.'}
            </p>
          )}

          {data && !isError && (
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
                  {data.notionUpdated && (
                    <span className={styles.notionBadge}>✓ Saved to Notion</span>
                  )}
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
                      {s.evidence && s.evidence.length > 0 && (
                        <button className={styles.evidenceToggle} onClick={() => toggleStrength(i)}>
                          {openStrengths.has(i)
                            ? 'Hide sources'
                            : `${s.evidence.length} source${s.evidence.length !== 1 ? 's' : ''} →`}
                        </button>
                      )}
                      {openStrengths.has(i) && s.evidence && (
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

              {/* Cover letter */}
              {data.coverLetter && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h4 className={styles.colTitle}>Cover Letter</h4>
                    <button
                      className={styles.toggleBtn}
                      onClick={() => setShowCoverLetter((v) => !v)}
                    >
                      {showCoverLetter ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                  {showCoverLetter ? (
                    <div className={styles.coverLetterFull}>
                      {data.coverLetter.split('\n\n').map((para, i) => (
                        <p key={i} className={styles.coverPara}>{para}</p>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.coverLetterPreview}>{data.coverLetter.slice(0, 200)}…</p>
                  )}
                </div>
              )}

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
                  <h4 className={styles.colTitle}>Opening Pitch</h4>
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
