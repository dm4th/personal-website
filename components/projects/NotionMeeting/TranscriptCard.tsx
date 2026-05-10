import styles from './TranscriptCard.module.css';
import type { TranscriptSample } from '@/lib/projects/notion-meeting-intelligence/types';

type Props = {
  sample: TranscriptSample;
  isActive: boolean;
  onLoad: (sample: TranscriptSample) => void;
};

export default function TranscriptCard({ sample, isActive, onLoad }: Props) {
  return (
    <button
      className={`${styles.card} ${isActive ? styles.active : ''}`}
      onClick={() => onLoad(sample)}
    >
      <div className={styles.top}>
        <span className={styles.label}>{sample.label}</span>
        <span className={styles.duration}>{sample.duration_hint}</span>
      </div>
      <p className={styles.preview}>{sample.transcript.slice(0, 100)}...</p>
    </button>
  );
}
