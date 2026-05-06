'use client';

import { useAgentStore } from '@/stores/agent';
import styles from './page.module.css';

type Props = {
  title: string;
  description: string;
  tags: string[];
};

export default function WebsiteProjectCard({ title, description, tags }: Props) {
  const { setPanelState, clearMessages } = useAgentStore();

  const handleClick = () => {
    clearMessages();
    setPanelState('expanded');
  };

  return (
    <button className={styles.projectCardBtn} onClick={handleClick}>
      <div className={styles.projectCardTop}>
        <div className={styles.projectCardHeader}>
          <h3 className={styles.projectTitle}>{title}</h3>
          <span className={styles.youreHereBadge}>You&apos;re here</span>
        </div>
        <p className={styles.projectDesc}>{description}</p>
      </div>
      <div className={styles.projectCardBottom}>
        <div className={styles.tagRow}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>
    </button>
  );
}
