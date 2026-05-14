'use client';

import { useState } from 'react';
import { JobApplicationQuestion } from '@/lib/content/jobApplications';
import styles from './ApplicationQA.module.css';

type Props = { questions: JobApplicationQuestion[] };

function QACard({ qa }: { qa: JobApplicationQuestion }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(qa.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <p className={styles.question}>{qa.question}</p>
        <button className={styles.copyBtn} onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className={styles.answer}>{qa.answer}</p>
    </div>
  );
}

export default function ApplicationQA({ questions }: Props) {
  if (questions.length === 0) return null;
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Application questions</h2>
      <div className={styles.list}>
        {questions.map((qa, i) => (
          <QACard key={i} qa={qa} />
        ))}
      </div>
    </section>
  );
}
