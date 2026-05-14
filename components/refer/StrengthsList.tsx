import Link from 'next/link';
import { JobStrength } from '@/lib/content/jobApplications';
import styles from './StrengthsList.module.css';

type Props = { strengths: JobStrength[] };

export default function StrengthsList({ strengths }: Props) {
  if (strengths.length === 0) return null;
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Why I am a strong fit</h2>
      <div className={styles.list}>
        {strengths.map((s, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.checkIcon}>✓</span>
              <p className={styles.title}>{s.title}</p>
            </div>
            <p className={styles.description}>{s.description}</p>
            {s.citations.length > 0 && (
              <div className={styles.citations}>
                <p className={styles.citationsLabel}>Additional context</p>
                <div className={styles.chips}>
                  {s.citations.map((c, j) => (
                    <Link key={j} href={c.path} className={styles.chip} target="_blank">
                      {c.label} →
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
