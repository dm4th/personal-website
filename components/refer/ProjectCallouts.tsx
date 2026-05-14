import Link from 'next/link';
import { JobProject } from '@/lib/content/jobApplications';
import styles from './ProjectCallouts.module.css';

type Props = { projects: JobProject[] };

export default function ProjectCallouts({ projects }: Props) {
  if (projects.length === 0) return null;
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Relevant projects</h2>
      <div className={styles.grid}>
        {projects.map((p, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.nameRow}>
              <p className={styles.name}>{p.name}</p>
              <span className={styles.liveBadge}>Live Demo</span>
            </div>
            <p className={styles.relevance}>{p.relevance}</p>
            <Link href={p.path} className={styles.link}>
              View demo →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
