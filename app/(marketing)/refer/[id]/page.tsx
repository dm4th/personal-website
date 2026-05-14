import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getAllJobApplicationConfigs, getJobApplicationBySlug } from '@/lib/content/jobApplications';
import SiteHeader from '@/components/shell/SiteHeader';
import SiteFooter from '@/components/shell/SiteFooter';
import FitScoreWheel from '@/components/refer/FitScoreWheel';
import CollapsibleSection from '@/components/refer/CollapsibleSection';
import QualificationsSummary from '@/components/refer/QualificationsSummary';
import StrengthsList from '@/components/refer/StrengthsList';
import WeaknessesList from '@/components/refer/WeaknessesList';
import DocumentSection from '@/components/refer/DocumentSection';
import ReferralBlurb from '@/components/refer/ReferralBlurb';
import ApplicationQA from '@/components/refer/ApplicationQA';
import ProjectCallouts from '@/components/refer/ProjectCallouts';
import { getSortedInfo } from '@/lib/content/infoDocs';
import styles from './page.module.css';

export async function generateStaticParams() {
  const configs = getAllJobApplicationConfigs();
  return configs.map(({ config }) => ({ id: config.id }));
}

type Props = { params: Promise<{ id: string }> };

export default async function ReferPage({ params }: Props) {
  const { id } = await params;
  const entry = getJobApplicationBySlug(id);
  if (!entry) notFound();

  const { config } = entry;
  const allInfoData = getSortedInfo();

  const hasStrengthsOrWeaknesses = config.strengths.length > 0 || config.weaknesses.length > 0;

  return (
    <>
      <SiteHeader allInfoData={allInfoData} />
      <div className={styles.wrapper}>

        {/* ── Page header ─────────────────────────────────── */}
        <header className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.logoRow}>
              {config.companyLogoUrl ? (
                <Image
                  src={config.companyLogoUrl}
                  alt={`${config.company} logo`}
                  width={48}
                  height={48}
                  className={styles.logo}
                  unoptimized
                />
              ) : (
                <div className={styles.logoFallback}>
                  {config.company.charAt(0)}
                </div>
              )}
              <div className={styles.metaStack}>
                <span className={styles.company}>{config.company}</span>
                {config.appliedDate && (
                  <span className={styles.date}>Last updated {config.appliedDate}</span>
                )}
              </div>
            </div>

            <h1 className={styles.role}>{config.role}</h1>

            {config.jobDescriptionUrl && (
              <a
                href={config.jobDescriptionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.jdLink}
              >
                View job description ↗
              </a>
            )}
          </div>

          {config.fitScore > 0 && (
            <div className={styles.scoreStack}>
              <FitScoreWheel score={config.fitScore} />
              <p className={styles.scoreLabel}>Job Fit Score</p>
              <p className={styles.scoreAttrib}>Scored by my personal agent</p>
            </div>
          )}
        </header>

        {/* ── Job fit analysis ─────────────────────────── */}
        {config.fitScoreNote && (
          <div className={styles.framingBlock}>
            <p className={styles.framingLabel}>Job fit analysis</p>
            <blockquote className={styles.framingQuote}>{config.fitScoreNote}</blockquote>
          </div>
        )}

        {/* ── Summary of qualifications (always visible) ──── */}
        {config.summary && config.summary.length > 0 && (
          <div className={styles.summaryBlock}>
            <p className={styles.summaryLabel}>Summary of qualifications</p>
            <QualificationsSummary items={config.summary} />
          </div>
        )}

        {/* ── Collapsible sections ─────────────────────────── */}
        <div className={styles.sections}>

          {config.projects.length > 0 && (
            <CollapsibleSection title="Relevant projects" defaultOpen>
              <ProjectCallouts projects={config.projects} />
            </CollapsibleSection>
          )}

          {hasStrengthsOrWeaknesses && (
            <CollapsibleSection title="Fit analysis" defaultOpen>
              <div className={styles.swGrid}>
                <StrengthsList strengths={config.strengths} />
                <WeaknessesList weaknesses={config.weaknesses} />
              </div>
            </CollapsibleSection>
          )}

          {(config.resumeFile || config.coverLetterFile) && (
            <CollapsibleSection title="Application materials">
              <DocumentSection
                id={config.id}
                company={config.company}
                resumeFile={config.resumeFile}
                coverLetterFile={config.coverLetterFile}
              />
            </CollapsibleSection>
          )}

          {config.referralBlurb && (
            <CollapsibleSection title="Ready-to-use referral note">
              <ReferralBlurb blurb={config.referralBlurb} />
            </CollapsibleSection>
          )}

          {config.applicationQuestions.length > 0 && (
            <CollapsibleSection title="Application questions">
              <ApplicationQA questions={config.applicationQuestions} />
            </CollapsibleSection>
          )}

        </div>

        <div className={styles.backLink}>
          <Link href="/">← danielmathieson.com</Link>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
