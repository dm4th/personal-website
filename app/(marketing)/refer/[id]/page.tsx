import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getAllJobApplicationConfigs, getJobApplicationBySlug } from '@/lib/content/jobApplications';
import { getAllCompanyOverviews, getCompanyOverviewBySlug } from '@/lib/content/companyOverviews';
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
import FitScoreDimensions from '@/components/refer/FitScoreDimensions';
import CompanyOverviewPanel from '@/components/refer/CompanyOverviewPanel';
import { getSortedInfo } from '@/lib/content/infoDocs';
import styles from './page.module.css';

export async function generateStaticParams() {
  const jobConfigs = getAllJobApplicationConfigs();
  const companyOverviews = getAllCompanyOverviews();
  return [
    ...jobConfigs.map(({ config }) => ({ id: config.id })),
    ...companyOverviews.map(({ config }) => ({ id: config.id })),
  ];
}

type Props = { params: Promise<{ id: string }> };

export default async function ReferPage({ params }: Props) {
  const { id } = await params;
  const allInfoData = getSortedInfo();

  // ── Company overview pages ───────────────────────────────────────
  const companyEntry = getCompanyOverviewBySlug(id);
  if (companyEntry) {
    const { config: overview } = companyEntry;
    const allJobConfigs = getAllJobApplicationConfigs();
    const roles = allJobConfigs
      .filter((e) => e.config.company === overview.company)
      .sort((a, b) => b.config.fitScore - a.config.fitScore);

    return (
      <>
        <SiteHeader allInfoData={allInfoData} />
        <div className={styles.wrapper}>

          {/* ── Page header ─────────────────────────────────── */}
          <header className={styles.pageHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.logoRow}>
                {overview.companyLogoUrl ? (
                  <Image
                    src={overview.companyLogoUrl}
                    alt={`${overview.company} logo`}
                    width={48}
                    height={48}
                    className={styles.logo}
                    unoptimized
                  />
                ) : (
                  <div className={styles.logoFallback}>{overview.company.charAt(0)}</div>
                )}
                <div className={styles.metaStack}>
                  <span className={styles.company}>{overview.company}</span>
                  <span className={styles.date}>Dan Mathieson</span>
                </div>
              </div>
              <h1 className={styles.role}>I researched {roles.length} roles.</h1>
              <p className={styles.overviewSubtitle}>
                Here is my honest, AI-scored assessment of each one. Click through any role to
                see the full breakdown.
              </p>
            </div>
          </header>

          {/* ── Interactive role panel + radar chart ─────────── */}
          <div className={styles.overviewContent}>
            <CompanyOverviewPanel
              roles={roles}
              personalNote={overview.personalNote}
            />
          </div>

          <div className={styles.backLink}>
            <Link href="/">← danielmathieson.com</Link>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  // ── Role-specific referral pages ──────────────────────────────────
  const entry = getJobApplicationBySlug(id);
  if (!entry) notFound();

  const { config } = entry;

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

        {/* ── Job fit analysis: quote + bullets (standalone, always visible) ── */}
        {(config.fitScoreNote || (config.summary && config.summary.length > 0)) && (
          <div className={styles.framingBlock}>
            <div className={styles.framingLabelRow}>
              <p className={styles.framingLabel}>Job fit analysis</p>
              <span className={styles.aiTag}>AI generated</span>
            </div>
            {config.fitScoreNote && (
              <blockquote className={styles.framingQuote}>{config.fitScoreNote}</blockquote>
            )}
            {config.summary && config.summary.length > 0 && (
              <div className={styles.summaryBlock}>
                <QualificationsSummary items={config.summary} />
              </div>
            )}
          </div>
        )}

        {/* ── Collapsible sections ─────────────────────────── */}
        <div className={styles.sections}>

          {/* ── Fit scoring detail: full-width dimension table ── */}
          {config.dimensions && (
            <CollapsibleSection title="Fit scoring detail" badge="AI generated">
              <FitScoreDimensions dimensions={config.dimensions} />
            </CollapsibleSection>
          )}

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
