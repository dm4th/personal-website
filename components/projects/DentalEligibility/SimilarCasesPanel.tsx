import styles from './SimilarCasesPanel.module.css';
import DeterminationBadge from './DeterminationBadge';
import type { SimilarCase } from '@/lib/projects/dental-eligibility/types';

type Props = {
  cases: SimilarCase[];
};

export default function SimilarCasesPanel({ cases }: Props) {
  if (cases.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Retrieved cases used as context</span>
      <div className={styles.list}>
        {cases.map((c) => (
          <div key={c.id} className={styles.caseRow}>
            <div className={styles.caseMain}>
              <div className={styles.caseHeader}>
                <span className={styles.scenarioLabel}>{c.scenario_label}</span>
                {c.source === 'session' && (
                  <span className={styles.sessionBadge}>Session</span>
                )}
              </div>
              <div className={styles.caseMeta}>
                <DeterminationBadge covered={c.determination.covered} confidence={c.determination.confidence} />
                {c.determination.coverage_pct > 0 && (
                  <span className={styles.pct}>{c.determination.coverage_pct}% covered</span>
                )}
              </div>
            </div>
            <div className={styles.similarity}>
              <span className={styles.simPct}>{(c.similarity * 100).toFixed(1)}%</span>
              <span className={styles.simLabel}>similar</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
