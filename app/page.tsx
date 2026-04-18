import Image from 'next/image';
import Link from 'next/link';
import { getSortedInfo } from '@/lib/content/infoDocs';
import SiteHeader from '@/components/shell/SiteHeader';
import SiteFooter from '@/components/shell/SiteFooter';
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
    title: 'Financial Analyst → Revenue Team Lead',
    company: 'FanDuel',
    period: '2019 – 2022',
    slug: '/info/career/fanduel',
  },
  {
    title: 'Financial Analyst, Google Cloud',
    company: 'Google',
    period: '2018 – 2019',
    slug: '/info/career/google',
  },
];

const PROJECTS = [
  {
    title: 'Agent-First Personal Website',
    description: 'This site — built with Claude Agent SDK, Clerk, and Neon. Visitors interact with an agent that can search my experience, analyze job descriptions, and schedule meetings.',
    slug: '/info/projects/personal-website',
    tags: ['Next.js', 'Claude SDK', 'Clerk', 'Neon'],
  },
  {
    title: 'SE Operations Platform at Thoughtful AI',
    description: '23 skills, 57 Python scripts, 5 AI agents, 943 commits. Automated the full SE lifecycle for a $31.8M pipeline of enterprise healthcare deals.',
    slug: '/info/career/thoughtful',
    tags: ['Python', 'AI Agents', 'Healthcare RCM'],
  },
  {
    title: 'DocWow',
    description: 'AI-powered document understanding platform with RAG and structured extraction pipelines.',
    slug: '/info/projects/docwow',
    tags: ['RAG', 'LLMs', 'Document AI'],
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
                src="/images/headshot.jpg"
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
              I build AI systems that actually ship — from agent harnesses and agentic loops to SE operations platforms managing $30M+ enterprise pipelines. Currently focused on agentic engineering: tool composition, harness design, and Claude Agent SDK.
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
            <div className={styles.projectGrid}>
              {PROJECTS.map((project) => (
                <Link key={project.slug} href={project.slug} className={styles.projectCard}>
                  <h3 className={styles.projectTitle}>{project.title}</h3>
                  <p className={styles.projectDesc}>{project.description}</p>
                  <div className={styles.tagRow}>
                    {project.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Content Index */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Explore</h2>
            <div className={styles.contentGrid}>
              {allInfoData.map(({ subDirectory, allSubInfoData, dropdownTitle }) => (
                <div key={subDirectory} className={styles.contentGroup}>
                  <h3 className={styles.contentGroupTitle}>{dropdownTitle}</h3>
                  <ul className={styles.contentList}>
                    {allSubInfoData.map(({ file, Title, type }) => (
                      <li key={file}>
                        <Link href={`/info/${subDirectory}/${file}`} className={styles.contentLink}>
                          {type === 'pdf'
                            ? file.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
                            : (Title ?? file)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Agent Panel — placeholder for Sub-phase 1.2 */}
        <aside className={styles.agentPanel}>
          <div className={styles.agentPanelInner}>
            <div className={styles.agentHeader}>
              <span className={styles.agentTitle}>Ask the Agent</span>
              <span className={styles.agentBadge}>Coming soon</span>
            </div>
            <div className={styles.agentPlaceholder}>
              <div className={styles.agentPlaceholderIcon}>⚡</div>
              <p className={styles.agentPlaceholderText}>
                An AI agent is being built here. Soon you&apos;ll be able to search my experience, analyze job descriptions, and schedule a meeting — all with visible tool calls.
              </p>
              <div className={styles.agentTools}>
                <span className={styles.agentTool}>🔍 Content search</span>
                <span className={styles.agentTool}>📄 JD fit analysis</span>
                <span className={styles.agentTool}>✉️ Email composer</span>
                <span className={styles.agentTool}>📅 Calendar scheduling</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
      <SiteFooter />
    </>
  );
}
