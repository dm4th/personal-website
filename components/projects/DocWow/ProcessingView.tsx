import styles from './ProcessingView.module.css';

interface Props {
  stage: string;
  uploadProgress?: number;
}

const STAGES = [
  { key: 'uploading', label: 'Uploading PDF' },
  { key: 'textract', label: 'Extracting text (AWS Textract)' },
  { key: 'parsing', label: 'Parsing blocks' },
];

export default function ProcessingView({ stage, uploadProgress }: Props) {
  const currentIdx = STAGES.findIndex((s) => s.key === stage);
  return (
    <div className={styles.root}>
      <div className={styles.stages}>
        {STAGES.map((s, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={s.key} className={`${styles.stage} ${done ? styles.done : ''} ${active ? styles.active : ''}`}>
              <div className={styles.dot}>{done ? '✓' : active ? <span className={styles.spinner} /> : ''}</div>
              <span>{s.label}{active && s.key === 'uploading' && uploadProgress !== undefined ? ` ${uploadProgress}%` : ''}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
