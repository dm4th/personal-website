'use client';

import { useState } from 'react';
import styles from './JobDescriptionSection.module.css';

type Props = {
  role: string;
  company: string;
  jobDescriptionUrl: string;
  jobDescriptionText: string;
};

export default function JobDescriptionSection({ role, company, jobDescriptionUrl, jobDescriptionText }: Props) {
  const [open, setOpen] = useState(false);
  const hasContent = jobDescriptionText.trim().length > 0;
  const hasUrl = jobDescriptionUrl.trim().length > 0;

  if (!hasContent && !hasUrl) return null;

  return (
    <section className={styles.section}>
      <button
        className={styles.toggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.label}>
          View job description
          {hasUrl && (
            <a
              href={jobDescriptionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalLink}
              onClick={(e) => e.stopPropagation()}
            >
              {role} at {company} ↗
            </a>
          )}
          {!hasUrl && ` — ${role} at ${company}`}
        </span>
        <span className={styles.chevron}>{open ? '▲' : '▼'}</span>
      </button>
      {open && hasContent && (
        <div className={styles.body}>
          <pre className={styles.text}>{jobDescriptionText}</pre>
        </div>
      )}
    </section>
  );
}
