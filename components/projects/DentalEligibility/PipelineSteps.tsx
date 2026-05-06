'use client';

import { useEffect, useState } from 'react';
import styles from './PipelineSteps.module.css';

type Props = {
  totalCases: number;
};

const STEPS = [
  { icon: '⚡', text: (n: number) => `Embedding query with text-embedding-3-small...`, delay: 0 },
  { icon: '🔍', text: (n: number) => `Searching ${n} case${n !== 1 ? 's' : ''} in library...`, delay: 350 },
  { icon: '🧠', text: (_n: number) => `Checking for exact match · Synthesizing with GPT-4o if needed...`, delay: 700 },
];

export default function PipelineSteps({ totalCases }: Props) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    const timers = STEPS.map((step, i) =>
      setTimeout(() => setVisibleCount(i + 1), step.delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className={styles.wrapper}>
      <p className={styles.heading}>Running eligibility check...</p>
      <div className={styles.steps}>
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={`${styles.step} ${i < visibleCount ? styles.visible : ''}`}
          >
            <span className={styles.icon}>{step.icon}</span>
            <span className={styles.text}>{step.text(totalCases)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
