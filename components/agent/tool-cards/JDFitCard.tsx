'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { ToolUsePart, LiveDimensionScore } from '@/stores/agent';
import type { JdFitOutput } from '@/lib/agent/tools/analyzeJdFit';
import styles from './JDFitCard.module.css';

// ─── Dimension metadata ───────────────────────────────────────────────────────

const DIMENSIONS = [
  { key: 'coreJobFunction',  label: 'Core job function',   weight: 3,   max: 30 },
  { key: 'seniority',        label: 'Seniority / years',   weight: 2,   max: 20 },
  { key: 'technicalSkills',  label: 'Technical skills',    weight: 2.5, max: 25 },
  { key: 'industryVertical', label: 'Industry / vertical', weight: 1.5, max: 15 },
  { key: 'logistics',        label: 'Logistics / misc',    weight: 1,   max: 10 },
] as const;

function dimScoreColor(score: number): string {
  if (score >= 9) return '#22c55e';
  if (score >= 7) return '#3b82f6';
  if (score >= 6) return '#eab308';
  if (score >= 5) return '#f59e0b';
  return '#ef4444';
}

// ─── Pending: live dimension cards ───────────────────────────────────────────

function DimensionScoring({ dimensionScores }: { dimensionScores?: Record<string, LiveDimensionScore> }) {
  const scored = dimensionScores ?? {};
  const completedCount = Object.keys(scored).length;

  return (
    <div className={styles.dimScoringWrapper}>
      <p className={styles.dimScoringLabel}>
        Scoring {completedCount}/5 dimensions…
      </p>
      <div className={styles.dimList}>
        {DIMENSIONS.map(({ key, label, weight, max }) => {
          const result = scored[key];
          const isComplete = !!result;

          return (
            <div key={key} className={`${styles.dimRow} ${isComplete ? styles.dimRowDone : styles.dimRowPending}`}>
              <div className={styles.dimRowHeader}>
                <span className={styles.dimRowLabel}>{label}</span>
                {isComplete ? (
                  <span
                    className={styles.dimScoreChip}
                    style={{ color: dimScoreColor(result.score), borderColor: dimScoreColor(result.score) + '55', background: dimScoreColor(result.score) + '18' }}
                  >
                    {result.score}/10
                  </span>
                ) : (
                  <span className={styles.dimScorePulse} />
                )}
                <span className={styles.dimWeight}>×{weight} / {max}pts</span>
              </div>
              {isComplete && (
                <p className={styles.dimRationale}>{result.rationale}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Complete: full card ──────────────────────────────────────────────────────

// ─── Normalise citation paths from sub-agents ────────────────────────────────

function normalizeCitationPath(p: string): string {
  return p.replace(/^\/+/, '').replace(/^info\//, '');
}

function citationLabel(p: string): string {
  return normalizeCitationPath(p)
    .replace(/\/index\.md$/, '')
    .replace(/\.md$/, '')
    .split('/')
    .map((s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(' / ');
}

function citationHref(p: string): string {
  return '/info/' + normalizeCitationPath(p).replace(/\/index\.md$/, '').replace(/\.md$/, '');
}

// ─── Complete: full card ──────────────────────────────────────────────────────

export default function JDFitCard({ part }: { part: ToolUsePart }) {
  const [expanded, setExpanded] = useState(true);
  const [dimExpanded, setDimExpanded] = useState(false);
  const [openStrengths, setOpenStrengths] = useState<Set<number>>(new Set());
  const [expandedDimKey, setExpandedDimKey] = useState<string | null>(null);

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
        {isPending ? (
          <span className={styles.label}>Scoring job fit…</span>
        ) : (
          <span className={styles.labelTitle}>{part.summary ?? 'JD Fit Analysis'}</span>
        )}
        {!isPending && <span className={styles.chevron}>{expanded ? '▲' : '▼'}</span>}
      </button>

      {/* Pending: show live dimension scoring cards */}
      {isPending && (
        <div className={styles.body}>
          <DimensionScoring dimensionScores={part.dimensionScores} />
        </div>
      )}

      {/* Complete or error */}
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

              {/* Score breakdown table — after framing, sub-header toggle */}
              {data.dimensions && (
                <div className={styles.dimSection}>
                  <button
                    className={`${styles.dimSubHeader} ${dimExpanded ? styles.dimSubHeaderOpen : ''}`}
                    onClick={() => setDimExpanded((v) => !v)}
                  >
                    <span className={styles.dimSubHeaderLabel}>Score breakdown</span>
                    <span className={styles.chevron}>{dimExpanded ? '▲' : '▼'}</span>
                  </button>
                  {dimExpanded && (
                    <div className={styles.dimTableWrapper}>
                      <table className={styles.dimTable}>
                        <thead>
                          <tr>
                            <th className={styles.dtCriterion}>Criterion</th>
                            <th className={styles.dtScore}>Score</th>
                            <th className={styles.dtWeight}>Weight</th>
                            <th className={styles.dtSources}>Sources</th>
                          </tr>
                        </thead>
                        <tbody>
                          {DIMENSIONS.map(({ key, label, max }) => {
                            const dim = data.dimensions[key];
                            if (!dim) return null;
                            const weightPct = max;
                            const color = dimScoreColor(dim.score);
                            const isRowExpanded = expandedDimKey === key;
                            return (
                              <>
                                <tr
                                  key={key}
                                  className={`${styles.dtRow} ${isRowExpanded ? styles.dtRowExpanded : ''}`}
                                >
                                  <td className={styles.dtTdCriterion}>
                                    <span className={styles.dtLabel}>{label}</span>
                                  </td>
                                  <td className={styles.dtTdScore}>
                                    <div className={styles.dtScoreInner}>
                                      <div className={styles.dtBarWrap}>
                                        <div className={styles.dtBarFill} style={{ width: `${dim.score * 10}%`, background: color }} />
                                      </div>
                                      <span className={styles.dtScoreNum} style={{ color }}>{dim.score}/10</span>
                                    </div>
                                  </td>
                                  <td className={styles.dtTdWeight}>
                                    <span className={styles.dtWeight}>{weightPct}%</span>
                                  </td>
                                  <td className={styles.dtTdSources}>
                                    <button
                                      className={styles.dtMoreInfo}
                                      onClick={(e) => { e.stopPropagation(); setExpandedDimKey(isRowExpanded ? null : key); }}
                                    >
                                      {isRowExpanded ? 'Less info ▲' : `More info ▼`}
                                    </button>
                                  </td>
                                </tr>
                                {isRowExpanded && (
                                  <tr key={`${key}-detail`} className={styles.dtDetailRow}>
                                    <td colSpan={4} className={styles.dtDetailCell}>
                                      <p className={styles.dtRationale}>{dim.rationale}</p>
                                      {dim.citations.length > 0 && (
                                        <div className={styles.dtCitations}>
                                          {dim.citations.map((c) => (
                                            <Link key={c} href={citationHref(c)} className={styles.dtChip} target="_blank">
                                              {citationLabel(c)} →
                                            </Link>
                                          ))}
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
