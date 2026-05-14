import { JobWeakness } from '@/lib/content/jobApplications';
import styles from './WeaknessesList.module.css';

type Props = { weaknesses: JobWeakness[] };

export default function WeaknessesList({ weaknesses }: Props) {
  if (weaknesses.length === 0) return null;
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Where I would be ramping up</h2>
      <div className={styles.list}>
        {weaknesses.map((w, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.warnIcon}>⚠</span>
              <p className={styles.title}>{w.title}</p>
            </div>
            <p className={styles.description}>{w.description}</p>
            {w.mitigation && (
              <div className={styles.mitigationBlock}>
                <span className={styles.mitigationLabel}>How I'd address it</span>
                <p className={styles.mitigation}>{w.mitigation}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
