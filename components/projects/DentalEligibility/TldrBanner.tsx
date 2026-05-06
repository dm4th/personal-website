import Link from 'next/link';
import styles from './TldrBanner.module.css';

type Props = {
  baseCaseCount: number;
  sessionCaseCount: number;
};

export default function TldrBanner({ baseCaseCount, sessionCaseCount }: Props) {
  return (
    <div className={styles.banner}>
      <div className={styles.left}>
        <h1 className={styles.title}>Dental Eligibility Intelligence</h1>
        <p className={styles.desc}>
          A live demo of the hybrid-RAG eligibility verification engine built in production at Thoughtful AI.
          The system achieved{' '}
          <strong className={styles.stat}>95%+ accuracy within two days</strong> on a live dental billing workflow.
        </p>
        <div className={styles.howItWorks}>
          <span className={styles.step}>
            <span className={styles.stepIcon}>🔒</span>
            <span>Exact matches bypass the LLM entirely</span>
          </span>
          <span className={styles.stepSep}>·</span>
          <span className={styles.step}>
            <span className={styles.stepIcon}>✦</span>
            <span>Novel cases go through GPT-4o with retrieved context</span>
          </span>
          <span className={styles.stepSep}>·</span>
          <span className={styles.step}>
            <span className={styles.stepIcon}>+</span>
            <span>Approved results expand the library automatically</span>
          </span>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{baseCaseCount}</span>
            <span className={styles.statLabel}>base cases</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum}>{sessionCaseCount}</span>
            <span className={styles.statLabel}>session approved</span>
          </div>
        </div>
        <Link href="/info/career/thoughtful/dental-eligibility-intelligence" className={styles.link}>
          Technical writeup →
        </Link>
      </div>
    </div>
  );
}
