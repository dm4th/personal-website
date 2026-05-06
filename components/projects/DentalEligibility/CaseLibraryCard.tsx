import styles from './CaseLibraryCard.module.css';
import type { EligibilityCase, SessionCase } from '@/lib/projects/dental-eligibility/types';

type DisplayCase = Omit<EligibilityCase, 'embedding'> | Omit<SessionCase, 'embedding'>;

type Props = {
  c: DisplayCase;
  onUseAsInput: (c: DisplayCase) => void;
};

export default function CaseLibraryCard({ c, onUseAsInput }: Props) {
  const { determination } = c;
  const isSession = c.source === 'session';

  const coverageSnippet =
    c.input.coverage_text.length > 70
      ? c.input.coverage_text.slice(0, 70) + '…'
      : c.input.coverage_text;

  return (
    <div className={`${styles.card} ${isSession ? styles.session : ''}`}>
      <div className={styles.top}>
        <div className={styles.meta}>
          <span className={styles.code}>{c.input.procedure_code}</span>
          <span className={styles.payer}>{c.input.payer}</span>
          {isSession && <span className={styles.sessionBadge}>Session</span>}
        </div>
        <div className={styles.outcome}>
          <span
            className={`${styles.outcomeDot} ${determination.covered ? styles.covered : styles.denied}`}
          />
          <span className={styles.outcomeLabel}>
            {determination.covered
              ? `${determination.coverage_pct}% covered`
              : 'Not covered'}
          </span>
          <span className={styles.confidence}>{Math.round(determination.confidence * 100)}%</span>
        </div>
      </div>
      <p className={styles.snippet}>{coverageSnippet}</p>
      <button className={styles.useBtn} onClick={() => onUseAsInput(c)}>
        Use as input →
      </button>
    </div>
  );
}
