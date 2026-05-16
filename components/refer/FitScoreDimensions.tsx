'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { JobFitDimensions } from '@/lib/content/jobApplications';
import styles from './FitScoreDimensions.module.css';

type Props = { dimensions: JobFitDimensions };

type DimensionMeta = {
  key: keyof JobFitDimensions;
  label: string;
  multiplier: number;
  max: number;
  weightPct: number; // percentage of total score
};

const DIMENSIONS: DimensionMeta[] = [
  { key: 'coreJobFunction',  label: 'Core job function',   multiplier: 3,   max: 30, weightPct: 30 },
  { key: 'seniority',        label: 'Seniority / years',   multiplier: 2,   max: 20, weightPct: 20 },
  { key: 'technicalSkills',  label: 'Technical skills',    multiplier: 2.5, max: 25, weightPct: 25 },
  { key: 'industryVertical', label: 'Industry / vertical', multiplier: 1.5, max: 15, weightPct: 15 },
  { key: 'logistics',        label: 'Logistics / misc',    multiplier: 1,   max: 10, weightPct: 10 },
];

function scoreColor(score: number): string {
  if (score >= 10) return '#22c55e';
  if (score >= 9)  return '#3b82f6';
  if (score >= 8)  return '#eab308';
  if (score >= 7)  return '#f59e0b';
  return '#ef4444';
}

function normalizeCitationPath(filePath: string): string {
  return filePath
    .replace(/^\/+/, '')
    .replace(/^info\//, '');
}

function infoPathToLabel(filePath: string): string {
  return normalizeCitationPath(filePath)
    .replace(/\/index\.md$/, '')
    .replace(/\.md$/, '')
    .split('/')
    .map((p) => p.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(' / ');
}

function infoPathToHref(filePath: string): string {
  return '/info/' + normalizeCitationPath(filePath)
    .replace(/\/index\.md$/, '')
    .replace(/\.md$/, '');
}

export default function FitScoreDimensions({ dimensions }: Props) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const toggle = (key: string) =>
    setExpandedKey((prev) => (prev === key ? null : key));

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thCriterion}>Criterion</th>
            <th className={styles.thScore}>Score</th>
            <th className={styles.thWeight}>Weight</th>
            <th className={styles.thCitations}>Sources</th>
          </tr>
        </thead>
        <tbody>
          {DIMENSIONS.map(({ key, label, weightPct }) => {
            const dim = dimensions[key];
            const color = scoreColor(dim.score);
            const isExpanded = expandedKey === key;

            return (
              <>
                <tr
                  key={key}
                  className={`${styles.row} ${isExpanded ? styles.rowExpanded : ''}`}
                  onClick={() => toggle(key)}
                  title="Click to expand rationale"
                >
                  <td className={styles.tdCriterion}>
                    <span className={styles.criterionLabel}>{label}</span>
                  </td>
                  <td className={styles.tdScore}>
                    <div className={styles.barWrap}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${dim.score * 10}%`, background: color }}
                      />
                    </div>
                    <span className={styles.scoreNum} style={{ color }}>{dim.score}/10</span>
                  </td>
                  <td className={styles.tdWeight}>
                    <span className={styles.weightBadge}>{weightPct}%</span>
                  </td>
                  <td className={styles.tdCitations} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.citationsInner}>
                      {dim.citations.length > 0 ? (
                        <div className={styles.chips}>
                          {dim.citations.map((c) => (
                            <Link
                              key={c}
                              href={infoPathToHref(c)}
                              className={styles.chip}
                              target="_blank"
                            >
                              {infoPathToLabel(c)} →
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <span className={styles.noCitations}>—</span>
                      )}
                      <button
                        className={`${styles.moreInfo} ${isExpanded ? styles.moreInfoActive : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggle(key); }}
                      >
                        {isExpanded ? 'Less info ▲' : 'More info ▼'}
                      </button>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${key}-rationale`} className={styles.rationaleRow}>
                    <td colSpan={4} className={styles.rationaleCell}>
                      <p className={styles.rationaleText}>{dim.rationale}</p>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
