import styles from './PathIndicator.module.css';
import type { SimilarCase } from '@/lib/projects/dental-eligibility/types';

type Props =
  | {
      path: 'exact_match';
      matchedCaseId: string;
      topSimilarCase: SimilarCase | undefined;
    }
  | {
      path: 'hybrid_rag';
      similarCaseCount: number;
    };

export default function PathIndicator(props: Props) {
  if (props.path === 'exact_match') {
    const similarity = props.topSimilarCase?.similarity ?? 1;
    const isSession = props.topSimilarCase?.source === 'session';
    return (
      <div className={`${styles.indicator} ${styles.exactMatch}`}>
        <div className={styles.main}>
          <span className={styles.icon}>🔒</span>
          <span className={styles.text}>
            {isSession ? 'Exact Match: from your session!' : 'Exact Match: LLM bypassed'}
          </span>
          <span className={`${styles.badge} ${styles.badgeGreen}`}>
            {isSession ? 'Session' : 'Library'}
          </span>
        </div>
        <div className={styles.sub}>
          {(similarity * 100).toFixed(1)}% similar to &ldquo;{props.topSimilarCase?.scenario_label ?? props.matchedCaseId}&rdquo;
          {!isSession && ' · No LLM tokens consumed'}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.indicator} ${styles.hybridRag}`}>
      <div className={styles.main}>
        <span className={styles.icon}>✦</span>
        <span className={styles.text}>Hybrid RAG: GPT-4o synthesis</span>
        <span className={`${styles.badge} ${styles.badgeBlue}`}>Live inference</span>
      </div>
      <div className={styles.sub}>
        {props.similarCaseCount} case{props.similarCaseCount !== 1 ? 's' : ''} retrieved as context · New case eligible for approval
      </div>
    </div>
  );
}
