import styles from './CaseLibrary.module.css';
import CaseLibraryCard from './CaseLibraryCard';
import type { EligibilityCase, SessionCase } from '@/lib/projects/dental-eligibility/types';

type DisplayCase = Omit<EligibilityCase, 'embedding'> | Omit<SessionCase, 'embedding'>;

type Props = {
  baseCases: Omit<EligibilityCase, 'embedding'>[];
  sessionCases: Omit<SessionCase, 'embedding'>[];
  onUseAsInput: (c: DisplayCase) => void;
};

export default function CaseLibrary({ baseCases, sessionCases, onUseAsInput }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>Case Library</span>
        <span className={styles.count}>
          {baseCases.length} base · {sessionCases.length} session
        </span>
      </div>

      <div className={styles.scrollArea}>
        {sessionCases.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>This Session</span>
              <span className={styles.sectionBadge}>{sessionCases.length}</span>
            </div>
            <div className={styles.list}>
              {sessionCases.map((c) => (
                <CaseLibraryCard key={c.id} c={c} onUseAsInput={onUseAsInput} />
              ))}
            </div>
          </div>
        )}

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Base Library</span>
            <span className={styles.sectionCount}>{baseCases.length} verified cases</span>
          </div>
          <div className={styles.list}>
            {baseCases.map((c) => (
              <CaseLibraryCard key={c.id} c={c} onUseAsInput={onUseAsInput} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
