import React from 'react';
import styles from './SiteFooter.module.css';

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerColumn}>
          <h3 className={styles.heading}>Contact</h3>
          <p>
            <a href="mailto:danny.mathieson233@gmail.com">danny.mathieson233@gmail.com</a>
          </p>
          <p>
            <a
              href="https://www.linkedin.com/in/daniel-mathieson-572b7958/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </p>
          <p>
            <a href="https://github.com/dm4th" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </p>
        </div>
        <div className={styles.footerColumn}>
          <h3 className={styles.heading}>Built with</h3>
          <p>Next.js 15 · Clerk · Neon · Claude Agent SDK</p>
          <p className={styles.muted}>© {new Date().getFullYear()} Dan Mathieson</p>
        </div>
      </div>
    </footer>
  );
}
