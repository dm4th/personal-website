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
  company?: string;
  videoUrl?: string;
};

function scoreColor(s: number): string {
  return s >= 90 ? '#22c55e' : s >= 85 ? '#3b82f6' : s >= 80 ? '#eab308' : s >= 70 ? '#f59e0b' : '#ef4444';
}

export default function CompanyOverviewPanel({ roles, personalNote, company, videoUrl }: Props) {
  const [selectedId, setSelectedId] = useState(roles[0]?.config.id ?? '');
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!personalNote) return;
    navigator.clipboard.writeText(personalNote).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const selected = roles.find((r) => r.config.id === selectedId) ?? roles[0];
  if (!selected) return null;

  const accentColor = scoreColor(selected.config.fitScore);

  return (
    <div className={styles.root}>

      {/* ── AI-scored section label ───────────────────────── */}
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>Role fit analysis</span>
        <span className={styles.aiTag}>AI generated</span>
      </div>

      {/* ── Main panel ──────────────────────────────────────  */}
      <div className={styles.panel}>

        {/* Top: clickable role list */}
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

        {/* Bottom: score ring + radar chart side by side */}
        <div className={styles.chartRow}>
          <div className={styles.ringSection}>
            <FitScoreWheel score={selected.config.fitScore} showText={false} />
            <div className={styles.wheelMeta}>
              <p className={styles.wheelScore} style={{ color: accentColor }}>
                {selected.config.fitScore}<span className={styles.wheelScoreDenom}>/100</span>
              </p>
              <p className={styles.wheelRoleLabel}>Job Fit Score</p>
              <p className={styles.wheelAttrib}>Scored by my personal agent</p>
            </div>
          </div>

          {selected.config.dimensions ? (
            <div className={styles.radarSection}>
              <RadarChart
                dimensions={selected.config.dimensions}
                accentColor={accentColor}
              />
            </div>
          ) : (
            <p className={styles.noDimensions}>
              Dimension breakdown not available for this role.
            </p>
          )}
        </div>
      </div>

      {/* ── Scoring methodology note ─────────────────────── */}
      <div className={styles.methodologyNote}>
        <p className={styles.methodologyText}>
          Each role is scored by a custom orchestrator agent that spawns five parallel sub-agents,
          one per scoring dimension: core job function match, seniority, technical skills,
          industry vertical fit, and logistics. Each sub-agent reads my full career documentation
          alongside the job description and returns a score with cited evidence. The orchestrator
          aggregates the sub-agent scores using weighted averaging (core function 3x, technical
          skills 2.5x, seniority 2x, industry 1.5x, logistics 1x), normalizes to 100, and
          presents the full output to me for review before it goes on the site.
        </p>
      </div>

      {/* ── Personal note (Why Company) ──────────────────── */}
      {(personalNote || videoUrl) && (
        <div className={styles.personalSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>{company ? `Why ${company}` : 'From Dan'}</span>
            <span className={styles.danTag}>Dan Generated</span>
          </div>
          {personalNote && (
            <div className={styles.personalCard}>
              <div className={styles.personalNote}>
                {personalNote.split('\n\n').map((para, i) => (
                  <p key={i} className={styles.personalPara}>{para}</p>
                ))}
              </div>
              <button
                className={styles.copyButton}
                onClick={handleCopy}
                aria-label="Copy to clipboard"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          )}
          {videoUrl && (
            <div className={styles.videoCard}>
              <div className={styles.videoWrapper}>
                <iframe
                  src={videoUrl.replace('/share/', '/embed/')}
                  className={styles.videoFrame}
                  allow="fullscreen"
                  title="Claude Code demo"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
