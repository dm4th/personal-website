import styles from './DeterminationBadge.module.css';

type Props = {
  covered: boolean;
  confidence: number;
};

export default function DeterminationBadge({ covered, confidence }: Props) {
  const isReview = confidence < 0.5;

  if (isReview) {
    return <span className={`${styles.badge} ${styles.review}`}>Human Review Required</span>;
  }
  if (covered) {
    return <span className={`${styles.badge} ${styles.covered}`}>Covered</span>;
  }
  return <span className={`${styles.badge} ${styles.notCovered}`}>Not Covered</span>;
}
