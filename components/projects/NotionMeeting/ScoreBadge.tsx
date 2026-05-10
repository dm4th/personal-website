import styles from './ScoreBadge.module.css';

type Props = {
  score: number;
  max?: number;
  label?: string;
};

export default function ScoreBadge({ score, max = 10, label }: Props) {
  const pct = Math.min(1, Math.max(0, score / max));
  const color = pct >= 0.7 ? '#22c55e' : pct >= 0.45 ? '#f59e0b' : '#ef4444';

  return (
    <span className={styles.badge} style={{ '--score-color': color } as React.CSSProperties}>
      <span className={styles.num}>{typeof score === 'number' ? score.toFixed(score % 1 === 0 ? 0 : 1) : score}</span>
      <span className={styles.denom}>/{max}</span>
      {label && <span className={styles.label}>{label}</span>}
    </span>
  );
}
