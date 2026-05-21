import styles from './ProcessingView.module.css';

interface Props {
  stage: string;
  uploadProgress?: number;
  pagesProcessed?: number;
}

const STAGES = [
  { key: 'uploading', label: 'Uploading PDF' },
  { key: 'textract', label: 'Extracting Text' },
  { key: 'parsing', label: 'Parsing Blocks' },
];

function getBarPercent(stage: string, uploadProgress?: number, pagesProcessed?: number): number {
  if (stage === 'uploading') return uploadProgress ?? 0;
  if (stage === 'textract') {
    // Pulse between 15-75% while Textract runs; nudge up with each page processed
    const base = 15;
    const nudge = Math.min((pagesProcessed ?? 0) * 8, 60);
    return Math.min(base + nudge, 75);
  }
  if (stage === 'parsing') return 90;
  return 0;
}

export default function ProcessingView({ stage, uploadProgress, pagesProcessed }: Props) {
  const currentIdx = STAGES.findIndex((s) => s.key === stage);
  const barPercent = getBarPercent(stage, uploadProgress, pagesProcessed);
  const isTextract = stage === 'textract';

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.barTrack}>
          <div
            className={`${styles.barFill} ${isTextract ? styles.barPulse : ''}`}
            style={{ width: `${barPercent}%` }}
          />
        </div>

        <div className={styles.stages}>
          {STAGES.map((s, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div
                key={s.key}
                className={`${styles.stage} ${done ? styles.done : ''} ${active ? styles.active : ''}`}
              >
                <span className={styles.dot}>{done ? '✓' : active ? '›' : '·'}</span>
                <span className={styles.stageLabel}>
                  {s.label}
                  {active && s.key === 'uploading' && uploadProgress !== undefined
                    ? ` - ${uploadProgress}%`
                    : ''}
                  {active && s.key === 'textract' && pagesProcessed !== undefined && pagesProcessed > 0
                    ? ` - ${pagesProcessed} page${pagesProcessed === 1 ? '' : 's'} processed`
                    : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
