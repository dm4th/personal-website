import styles from './ReasoningTrace.module.css';

type Props = {
  reasoning: string;
  complianceNote: string;
};

export default function ReasoningTrace({ reasoning, complianceNote }: Props) {
  return (
    <details className={styles.details}>
      <summary className={styles.summary}>
        <span className={styles.summaryText}>Reasoning trace</span>
        <span className={styles.toggle} aria-hidden="true">›</span>
      </summary>
      <div className={styles.body}>
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Determination reasoning</span>
          <p className={styles.text}>{reasoning}</p>
        </div>
        <div className={styles.divider} />
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Compliance note</span>
          <p className={`${styles.text} ${styles.compliance}`}>{complianceNote}</p>
        </div>
      </div>
    </details>
  );
}
