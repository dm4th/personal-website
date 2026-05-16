'use client';

import { useState } from 'react';
import Link from 'next/link';
import FitScoreWheel from './FitScoreWheel';
import RadarChart from './RadarChart';
import type { JobApplicationConfig } from '@/lib/content/jobApplications';
import styles from './CompanyOverviewPanel.module.css';

type RoleEntry = {
  config: JobApplicationConfig;
  dirName: string;
};

type Props = {
  roles: RoleEntry[];
  personalNote?: string;
};

function scoreColor(s: number): string {
  return s >= 85 ? 'var(--success)' : s >= 75 ? '#f59e0b' : '#ef4444';
}

export default function CompanyOverviewPanel({ roles, personalNote }: Props) {
  const [selectedId, setSelectedId] = useState(roles[0]?.config.id ?? '');

  const selected = roles.find((r) => r.config.id === selectedId) ?? roles[0];
  if (!selected) return null;

  return (
    <div className={styles.root}>

      {/* ── AI-scored section label ───────────────────────── */}
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>Role fit analysis</span>
        <span className={styles.aiTag}>AI generated</span>
      </div>

      {/* ── Main interactive panel ───────────────────────── */}
      <div className={styles.panel}>

        {/* Left: clickable role list */}
        <div className={styles.roleList}>
          <p className={styles.listHeading}>Roles considered</p>
          {roles.map((entry) => {
            const isSelected = entry.config.id === selectedId;
            const score = entry.config.fitScore;
            return (
              <div
                key={entry.config.id}
                className={`${styles.roleItem} ${isSelected ? styles.roleItemSelected : ''}`}
              >
                <button
                  className={styles.roleButton}
                  onClick={() => setSelectedId(entry.config.id)}
                  aria-pressed={isSelected}
                >
                  <span className={styles.roleTitle}>{entry.config.role}</span>
                  <span
                    className={styles.roleScore}
                    style={{ color: scoreColor(score) }}
                  >
                    {score}
                  </span>
                </button>

                {/* Expanded panel under selected role */}
                {isSelected && (
                  <div className={styles.roleExpanded}>
                    {entry.config.fitScoreNote && (
                      <p className={styles.roleNote}>{entry.config.fitScoreNote}</p>
                    )}
                    <Link
                      href={`/refer/${entry.config.id}`}
                      className={styles.roleLink}
                    >
                      View full analysis →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: score wheel + radar chart */}
        <div className={styles.chartPanel}>
          <div className={styles.wheelRow}>
            <FitScoreWheel score={selected.config.fitScore} />
            <div className={styles.wheelMeta}>
              <p className={styles.wheelScore} style={{ color: scoreColor(selected.config.fitScore) }}>
                {selected.config.fitScore}<span className={styles.wheelScoreDenom}>/100</span>
              </p>
              <p className={styles.wheelRoleLabel}>Job Fit Score</p>
              <p className={styles.wheelAttrib}>Scored by my personal agent</p>
            </div>
          </div>

          {selected.config.dimensions ? (
            <div className={styles.radarWrap}>
              <RadarChart dimensions={selected.config.dimensions} />
            </div>
          ) : (
            <p className={styles.noDimensions}>
              Dimension breakdown not available for this role.
            </p>
          )}
        </div>
      </div>

      {/* ── Personal note (free-form, from Dan) ─────────── */}
      {personalNote && (
        <div className={styles.personalSection}>
          <div className={styles.personalHeader}>
            <span className={styles.danTag}>From Dan</span>
          </div>
          <div className={styles.personalNote}>
            {personalNote.split('\n\n').map((para, i) => (
              <p key={i} className={styles.personalPara}>{para}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
