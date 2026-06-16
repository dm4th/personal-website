import Link from 'next/link';
import { HUB_CONFIG } from '@/lib/fintechco/config';
import type { HubCard, PrimaryFocus, ResourceItem, ResourceSection } from '@/lib/fintechco/types';
import styles from './page.module.css';

function Card({ card, tag, focus }: { card: HubCard; tag?: string; focus?: PrimaryFocus }) {
  // closed is a hard gate (grayed-out, non-clickable); comingSoon is a soft gate
  // (the label discourages clicking, the link stays live). A closed card never
  // carries focus and never reads as "coming soon".
  const isClosed = !!card.closed;
  const eFocus = isClosed ? undefined : focus;
  const soon = !isClosed && (!card.live || card.comingSoon);
  const body = (
    <>
      {(tag || soon || isClosed || eFocus || (card.date && !isClosed)) && (
        <div className={styles.cardTop}>
          <span className={styles.cardTopGroup}>
            {eFocus && <span className={styles.focusChip}>{eFocus.label}</span>}
            {tag && <span className={styles.tag}>{tag}</span>}
          </span>
          <span className={styles.cardTopGroup}>
            {isClosed && <span className={styles.closed}>Closed</span>}
            {soon && <span className={styles.soon}>Coming soon</span>}
            {card.date && !isClosed && <span className={styles.dateChip}>{card.date}</span>}
          </span>
        </div>
      )}
      <h2 className={styles.cardTitle}>{card.title}</h2>
      <p className={styles.cardBlurb}>{card.blurb}</p>
      {eFocus?.note && <p className={styles.focusNote}>{eFocus.note}</p>}
    </>
  );

  const featured = eFocus ? styles.cardFeatured : '';
  return card.live && !isClosed ? (
    <Link
      href={card.href}
      className={`${styles.card} ${featured} ${card.comingSoon ? styles.cardSoon : ''}`}
    >
      {body}
    </Link>
  ) : (
    <div className={`${styles.card} ${featured} ${styles.cardDisabled}`}>{body}</div>
  );
}

const RESOURCE_STATUS_LABEL = { 'coming-soon': 'Coming soon', 'on-request': 'Available on request' } as const;

function ResourceRows({ items }: { items: ResourceItem[] }) {
  return (
    <ul className={styles.resourceList}>
      {items.map((item) => {
        const inner = (
          <>
            <span className={styles.resourceText}>
              <span className={styles.resourceTitle}>
                {item.title}
                {item.status === 'live' && <span aria-hidden> &#8599;</span>}
              </span>
              {item.note && <span className={styles.resourceNote}>{item.note}</span>}
            </span>
            {item.status !== 'live' && (
              <span className={styles.resourceStatus}>{RESOURCE_STATUS_LABEL[item.status]}</span>
            )}
          </>
        );
        return (
          <li key={item.title}>
            {item.status === 'live' && item.href ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer" className={styles.resourceRowLink}>
                {inner}
              </a>
            ) : (
              <div className={styles.resourceRow}>{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Resources({ section }: { section: ResourceSection }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeading}>{section.heading}</h2>
      {section.blurb && <p className={styles.sectionBlurb}>{section.blurb}</p>}
      {section.items.length === 0 ? (
        <p className={styles.resourceEmpty}>Items appear here as our conversation progresses.</p>
      ) : (
        <ResourceRows items={section.items} />
      )}
    </section>
  );
}

function Section({
  heading,
  children,
  footnote,
}: {
  heading: React.ReactNode;
  children: React.ReactNode;
  footnote?: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeading}>{heading}</h2>
      <div className={styles.sectionGrid}>{children}</div>
      {footnote}
    </section>
  );
}

export default function FintechcoHub() {
  const { deck, discovery, demos, primaryFocus, resourceSections, availableOnRequest } = HUB_CONFIG;

  // Exactly one tile carries the focus treatment, chosen by deal stage in config
  const focusFor = (target: PrimaryFocus['target']) =>
    primaryFocus?.target === target ? primaryFocus : undefined;

  const demoCards = demos.map((d) => ({
    key: d.key,
    card: { title: d.title, blurb: d.blurb, href: d.href, live: d.live, comingSoon: d.comingSoon, date: d.date },
    tag: d.team,
  }));

  return (
    <main className={styles.wrapper}>
      <Link href="/" className={styles.backLink}>&#8592; Back to Dan&#39;s Website</Link>

      <header className={styles.header}>
        <h1 className={styles.title}>FinTechCo · Anthropic | Claude Code Discovery &amp; Solutions</h1>
        <p className={styles.intro}>
          Welcome FinTechCo! You can find all of the relevant presentation materials here on your
          prospect portal. If you have any questions, please feel free to reach out to your
          Solutions Architect Dan at{' '}
          <a href="mailto:danny.mathieson233@gmail.com" className={styles.emailLink}>
            danny.mathieson233@gmail.com
          </a>.
        </p>
      </header>

      <Section heading="Presentation">
        <Card card={deck} focus={focusFor('deck')} />
      </Section>

      <Section
        heading={<>Live &amp; Recorded Demos</>}
        footnote={
          <div className={styles.sectionFootnote}>
            <h3 className={styles.footnoteHeading}>Also Available on Request</h3>
            <ResourceRows items={availableOnRequest} />
          </div>
        }
      >
        {demoCards.map((item) => (
          <Card key={item.key} card={item.card} tag={item.tag} focus={focusFor(item.key)} />
        ))}
      </Section>

      <Section heading="Before We Meet">
        <Card card={discovery} focus={focusFor('discovery')} />
      </Section>

      {resourceSections.map((section) => (
        <Resources key={section.heading} section={section} />
      ))}
    </main>
  );
}
