'use client';

import { useState } from 'react';
import styles from './CollapsibleSection.module.css';

type Props = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
};

export default function CollapsibleSection({ title, children, defaultOpen = false, badge }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.toggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.titleRow}>
          <span className={styles.title}>{title}</span>
          {badge && <span className={styles.badge}>{badge}</span>}
        </span>
        <span className={styles.chevron}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className={styles.body}>{children}</div>}
    </div>
  );
}
