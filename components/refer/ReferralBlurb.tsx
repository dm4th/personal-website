'use client';

import { useState } from 'react';
import styles from './ReferralBlurb.module.css';

type Props = { blurb: string };

export default function ReferralBlurb({ blurb }: Props) {
  const [copied, setCopied] = useState(false);

  if (!blurb.trim()) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(blurb);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Ready-to-use referral note</h2>
        <button className={styles.copyBtn} onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <blockquote className={styles.blurb}>{blurb}</blockquote>
    </section>
  );
}
