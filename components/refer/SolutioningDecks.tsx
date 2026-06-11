import { SolutioningDeck } from '@/lib/content/jobApplications';
import styles from './SolutioningDecks.module.css';

type Props = { decks: SolutioningDeck[] };

export default function SolutioningDecks({ decks }: Props) {
  if (!decks || decks.length === 0) return null;
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {decks.map((deck, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardHeader}>
              <p className={styles.title}>{deck.title}</p>
              <span className={styles.scenarioBadge}>{deck.scenario}</span>
            </div>
            <p className={styles.description}>{deck.description}</p>
            <a href={deck.path} target="_blank" rel="noopener noreferrer" className={styles.link}>
              {deck.linkLabel ?? 'View deck'} ↗
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
