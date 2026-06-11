import Link from 'next/link';
import { HUB_CONFIG } from '@/lib/fintechco/config';
import type { HubCard } from '@/lib/fintechco/types';
import styles from './page.module.css';

function Card({ card, tag }: { card: HubCard; tag?: string }) {
  // comingSoon is a soft gate: the label discourages clicking, the link stays live
  const soon = !card.live || card.comingSoon;
  const body = (
    <>
      {(tag || soon) && (
        <div className={styles.cardTop}>
          {tag && <span className={styles.tag}>{tag}</span>}
          {soon && <span className={styles.soon}>Coming soon</span>}
        </div>
      )}
      <h2 className={styles.cardTitle}>{card.title}</h2>
      <p className={styles.cardBlurb}>{card.blurb}</p>
    </>
  );

  return card.live ? (
    <Link
      href={card.href}
      className={`${styles.card} ${card.comingSoon ? styles.cardSoon : ''}`}
    >
      {body}
    </Link>
  ) : (
    <div className={`${styles.card} ${styles.cardDisabled}`}>{body}</div>
  );
}

function Section({ heading, children }: { heading: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeading}>{heading}</h2>
      <div className={styles.sectionGrid}>{children}</div>
    </section>
  );
}

export default function FintechcoHub() {
  const { deck, discovery, demos, availableOnRequest } = HUB_CONFIG;

  const demoCards: { card: HubCard; tag: string }[] = demos.map((d) => ({
    card: { title: d.title, blurb: d.blurb, href: d.href, live: d.live, comingSoon: d.comingSoon },
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

      <Section heading="Before We Meet">
        <Card card={discovery} />
      </Section>

      <Section heading="Presentation">
        <Card card={deck} />
      </Section>

      <Section heading={<>Live &amp; Recorded Demos</>}>
        {demoCards.map((item) => (
          <Card key={item.card.title} card={item.card} tag={item.tag} />
        ))}
      </Section>

      <footer className={styles.footer}>
        <h3 className={styles.footerHeading}>Also available on request</h3>
        <ul className={styles.footerList}>
          {availableOnRequest.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </footer>
    </main>
  );
}
