import Link from 'next/link';
import { HUB_CONFIG } from '@/lib/fintechco/config';
import type { HubCard } from '@/lib/fintechco/types';
import styles from './page.module.css';

function Card({ card, tag }: { card: HubCard; tag?: string }) {
  const body = (
    <>
      <div className={styles.cardTop}>
        {tag && <span className={styles.tag}>{tag}</span>}
        {!card.live && <span className={styles.soon}>Coming soon</span>}
      </div>
      <h2 className={styles.cardTitle}>{card.title}</h2>
      <p className={styles.cardBlurb}>{card.blurb}</p>
    </>
  );

  return card.live ? (
    <Link href={card.href} className={styles.card}>{body}</Link>
  ) : (
    <div className={`${styles.card} ${styles.cardDisabled}`}>{body}</div>
  );
}

export default function FintechcoHub() {
  const { deck, discovery, demos, availableOnRequest } = HUB_CONFIG;

  return (
    <main className={styles.wrapper}>
      <header className={styles.header}>
        <span className={styles.kicker}>FinTechCo · Claude Code</span>
        <h1 className={styles.title}>Workspace</h1>
        <p className={styles.intro}>
          Materials prepared for the FinTechCo engineering organization: the main
          walkthrough, one demo per team, and a short discovery conversation to
          shape the session around your priorities.
        </p>
      </header>

      <section className={styles.grid}>
        <Card card={deck} tag="Presentation" />
        <Card card={discovery} tag="Before we meet" />
        {demos.map((demo) => (
          <Card
            key={demo.key}
            card={{ title: demo.title, blurb: demo.blurb, href: demo.href, live: demo.live }}
            tag={demo.team}
          />
        ))}
      </section>

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
