import styles from './ConfidenceMeter.module.css';

type Props = {
  confidence: number;
};

function getBarColor(confidence: number): string {
  if (confidence >= 0.9) return 'var(--success)';
  if (confidence >= 0.75) return 'var(--accent)';
  if (confidence >= 0.5) return '#f59e0b';
  return '#ef4444';
}

function getLabel(confidence: number): string {
  if (confidence >= 0.9) return 'High';
  if (confidence >= 0.75) return 'Good';
  if (confidence >= 0.5) return 'Moderate';
  return 'Low, human review recommended';
}

export default function ConfidenceMeter({ confidence }: Props) {
  const pct = Math.round(confidence * 100);
  const color = getBarColor(confidence);
  const label = getLabel(confidence);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>Confidence</span>
        <span className={styles.value} style={{ color }}>{pct}%</span>
      </div>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${pct}%`, background: color }}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
      <span className={styles.label} style={{ color }}>{label}</span>
    </div>
  );
}
