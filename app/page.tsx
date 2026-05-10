import Image from 'next/image';
import Link from 'next/link';
import { getSortedInfo } from '@/lib/content/infoDocs';
import SiteHeader from '@/components/shell/SiteHeader';
import SiteFooter from '@/components/shell/SiteFooter';
import AgentPanel from '@/components/agent/AgentPanel';
import WebsiteProjectCard from './WebsiteProjectCard';
import styles from './page.module.css';

const ROLES = [
  {
    title: 'Director of Solutions Engineering',
    company: 'Smarter Technologies',
    period: 'Sept 2025 – Present',
    slug: '/info/career/smarter-technologies',
  },
  {
    title: 'Lead Technical Product Manager → Customer Engineer',
    company: 'Thoughtful AI',
    period: 'Sept 2023 – Sept 2025',
    slug: '/info/career/thoughtful',
  },
  {
    title: 'Director of Analytics',
    company: 'Action Network',
    period: '2022 – 2023',
    slug: '/info/career/action-network',
  },
  {
    title: 'Financial Analyst, Google Cloud',
    company: 'Google',
    period: '2019 – 2020',
    slug: '/info/career/google',
  },
  {
    title: 'Financial Analyst → Revenue Team Lead',
    company: 'FanDuel',
    period: '2016 – 2019',
    slug: '/info/career/fanduel',
  },
];

const PROJECTS = [
  {
    title: 'AI-Native GTM Engine',
    description: 'Paste a sales transcript and six Claude agents analyze it in parallel - sales coaching, commercial pricing, delivery, product feedback, ICP fit, and an executive summary. Writes a Meeting Note + 6 Agent Analysis rows to your Notion GTM Hub template.',
    demoSlug: '/projects/notion-meeting-intelligence',
    infoSlug: null,
    tags: ['Claude AI', 'Notion', 'Multi-Agent', 'GTM'],
    stat: '6 agents in parallel',
  },
  {
    title: 'Dental Eligibility Intelligence',
    description: 'Hybrid-RAG eligibility verification engine built in production at Thoughtful AI. 95%+ accuracy within two days. Exact matches bypass the LLM; approve results live to grow the case library.',
    demoSlug: '/projects/dental-eligibility',
    infoSlug: '/info/career/thoughtful/dental-eligibility-intelligence',
    tags: ['Hybrid RAG', 'GPT-4o', 'Healthcare RCM'],
    stat: '95%+ accuracy',
  },
  {
    title: 'Agent-First Personal Website',
    description: 'This site, built with Claude Agent SDK, Clerk, and Neon. Visitors interact with an agent that can search my experience, analyze job descriptions, and schedule meetings.',
    demoSlug: null,
    infoSlug: '/info/projects/personal-website',
    tags: ['Next.js', 'Claude SDK', 'Clerk', 'Neon'],
    stat: null,
  },
  {
    title: 'DocWow',
    description: 'AI-powered document understanding platform with RAG and structured extraction pipelines.',
    demoSlug: null,
    infoSlug: '/info/projects/docwow',
    tags: ['RAG', 'LLMs', 'Document AI'],
    stat: null,
  },
];

export default async function HomePage() {
  const allInfoData = getSortedInfo();

  return (
    <>
      <SiteHeader allInfoData={allInfoData} />
      <div className={styles.layout}>
        <main className={styles.main}>
          {/* Hero */}
          <section className={styles.hero}>
            <div className={styles.heroLeft}>
              <Image
                src="/images/danny-headshot.jpeg"
                alt="Dan Mathieson"
                width={96}
                height={96}
                className={styles.avatar}
                priority
              />
              <div>
                <h1 className={styles.name}>Dan Mathieson</h1>
                <p className={styles.role}>
                  Director of Solutions Engineering ·{' '}
                  <span className={styles.company}>Smarter Technologies</span>
                </p>
                <p className={styles.location}>San Francisco, CA</p>
              </div>
            </div>
            <div className={styles.heroLinks}>
              <a href="mailto:danny.mathieson233@gmail.com" className={styles.chip}>Email</a>
              <a href="https://www.linkedin.com/in/daniel-mathieson-572b7958/" target="_blank" rel="noopener noreferrer" className={styles.chip}>LinkedIn</a>
              <a href="https://github.com/dm4th" target="_blank" rel="noopener noreferrer" className={styles.chip}>GitHub</a>
              <Link href="/info/career/resume" className={styles.chip}>Resume</Link>
            </div>
          </section>

          <div className={styles.bio}>
            <p>
              I build AI systems that actually ship: agent harnesses, agentic loops, and SE operations platforms managing $30M+ enterprise pipelines. Currently focused on agentic engineering, tool composition, harness design, and the Claude Agent SDK.
            </p>
          </div>

          {/* Career Timeline */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Career</h2>
            <div className={styles.timeline}>
              {ROLES.map((role) => (
                <Link key={role.slug} href={role.slug} className={styles.timelineEntry}>
                  <div className={styles.timelinePeriod}>{role.period}</div>
                  <div className={styles.timelineContent}>
                    <span className={styles.timelineTitle}>{role.title}</span>
                    <span className={styles.timelineCompany}>{role.company}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Projects</h2>
            <div className={styles.projectCarousel}>
              {PROJECTS.map((project) => {
                if (project.demoSlug === null && project.infoSlug === '/info/projects/personal-website') {
                  return (
                    <WebsiteProjectCard
                      key={project.infoSlug}
                      title={project.title}
                      description={project.description}
                      tags={project.tags}
                    />
                  );
                }
                const href = project.demoSlug ?? project.infoSlug;
                return (
                  <Link key={project.infoSlug} href={href} className={styles.projectCard}>
                    <div className={styles.projectCardTop}>
                      <div className={styles.projectCardHeader}>
                        <h3 className={styles.projectTitle}>{project.title}</h3>
                        {project.demoSlug && (
                          <span className={styles.liveBadge}>Live Demo</span>
                        )}
                      </div>
                      <p className={styles.projectDesc}>{project.description}</p>
                    </div>
                    <div className={styles.projectCardBottom}>
                      {project.stat && (
                        <span className={styles.projectStat}>{project.stat}</span>
                      )}
                      <div className={styles.tagRow}>
                        {project.tags.map((tag) => (
                          <span key={tag} className={styles.tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Content Index */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Explore</h2>
            <div className={styles.contentGrid}>
              {allInfoData.map(({ subDirectory, flatEntries, subGroups, dropdownTitle }) => {
                const allEntries = [
                  ...subGroups.map((sg) => ({ file: sg.subDir, Title: sg.displayTitle, type: 'group' as const, isGroup: true })),
                  ...flatEntries,
                ];
                return (
                  <div key={subDirectory} className={styles.contentGroup}>
                    <h3 className={styles.contentGroupTitle}>{dropdownTitle}</h3>
                    <ul className={styles.contentList}>
                      {allEntries.map(({ file, Title, type }) => (
                        <li key={file}>
                          <Link
                            href={`/info/${subDirectory}/${file}`}
                            className={styles.contentLink}
                          >
                            {type === 'pdf'
                              ? file.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
                              : (Title ?? file)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        </main>

        <aside className={styles.agentPanel}>
          <AgentPanel />
        </aside>
      </div>
      <SiteFooter />
    </>
  );
}
