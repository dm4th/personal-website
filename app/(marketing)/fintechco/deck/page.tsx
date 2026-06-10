import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Deck | FinTechCo Workspace',
  robots: { index: false, follow: false },
};

export default function DeckPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <span className={styles.label}>FinTechCo Workspace - Main Deck</span>
        <a
          href="/presentations/fintechco/main-deck.html"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.openLink}
        >
          Open in new tab
        </a>
      </div>
      <iframe
        src="/presentations/fintechco/main-deck.html"
        className={styles.frame}
        title="Main deck"
        allowFullScreen
      />
    </div>
  );
}
