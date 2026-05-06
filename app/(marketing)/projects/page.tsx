import type { Metadata } from 'next';
import Link from 'next/link';
import { getSortedInfo } from '@/lib/content/infoDocs';
import SiteHeader from '@/components/shell/SiteHeader';
import SiteFooter from '@/components/shell/SiteFooter';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Projects | Dan Mathieson',
  description: 'Interactive demos of systems built at Thoughtful AI and beyond.',
};

const DEMOS = [
  {
    slug: '/projects/dental-eligibility',
    title: 'Dental Eligibility Intelligence',
    description:
      'Hybrid-RAG eligibility verification engine built in production at Thoughtful AI. Achieves 95%+ accuracy through a determinism-first design: exact matches bypass the LLM entirely, with novel cases synthesized via GPT-4o and retrieved context. Approve results live to expand the case library.',
    tags: ['Hybrid RAG', 'GPT-4o', 'Healthcare RCM'],
    infoSlug: '/info/career/thoughtful/dental-eligibility-intelligence',
    stat: '95%+ accuracy',
    statLabel: 'within 2 days in production',
  },
];

export default function ProjectsPage() {
  const allInfoData = getSortedInfo();

  return (
    <>
      <SiteHeader allInfoData={allInfoData} />
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.subtitle}>
            Interactive demos of systems I&apos;ve built — not just writeups, but working prototypes you can try.
          </p>
        </div>

        <div className={styles.grid}>
          {DEMOS.map((demo) => (
            <div key={demo.slug} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>{demo.title}</h2>
                  <span className={styles.liveBadge}>Live Demo</span>
                </div>
                <p className={styles.cardDesc}>{demo.description}</p>
                <div className={styles.tagRow}>
                  {demo.tags.map((t) => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              </div>
              <div className={styles.cardBottom}>
                {demo.stat && (
                  <div className={styles.stat}>
                    <span className={styles.statNum}>{demo.stat}</span>
                    <span className={styles.statLabel}>{demo.statLabel}</span>
                  </div>
                )}
                <div className={styles.actions}>
                  <Link href={demo.slug} className={styles.demoBtn}>
                    Try the demo →
                  </Link>
                  {demo.infoSlug && (
                    <Link href={demo.infoSlug} className={styles.writeupLink}>
                      Technical writeup
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
