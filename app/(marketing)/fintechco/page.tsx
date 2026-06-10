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

  // Discovery first, then deck, then demos; preserves HUB_CONFIG as source of truth
  const allItems = [
    { card: discovery, tag: 'Before we meet' },
    { card: deck, tag: 'Presentation' },
    ...demos.map((d) => ({
      card: { title: d.title, blurb: d.blurb, href: d.href, live: d.live },
      tag: d.team,
    })),
  ];
  const liveItems = allItems.filter((item) => item.card.live);
  const soonItems = allItems.filter((item) => !item.card.live);

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

      {liveItems.length > 0 && (
        <section className={styles.grid}>
          {liveItems.map((item) => (
            <Card key={item.card.title} card={item.card} tag={item.tag} />
          ))}
        </section>
      )}

      {soonItems.length > 0 && (
        <section className={styles.comingSoon}>
          <h2 className={styles.comingSoonHeading}>Coming Soon</h2>
          <div className={styles.comingSoonGrid}>
            {soonItems.map((item) => (
              <Card key={item.card.title} card={item.card} tag={item.tag} />
            ))}
          </div>
        </section>
      )}

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
