import styles from './TranscriptLibrary.module.css';
import TranscriptCard from './TranscriptCard';
import type { TranscriptSample } from '@/lib/projects/notion-meeting-intelligence/types';

type Props = {
  samples: TranscriptSample[];
  activeId: string | null;
  onLoad: (sample: TranscriptSample) => void;
};

export default function TranscriptLibrary({ samples, activeId, onLoad }: Props) {
  return (
    <div className={styles.library}>
      <p className={styles.heading}>Sample Transcripts</p>
      <div className={styles.list}>
        {samples.map((s) => (
          <TranscriptCard
            key={s.id}
            sample={s}
            isActive={activeId === s.id}
            onLoad={onLoad}
          />
        ))}
      </div>
    </div>
  );
}
