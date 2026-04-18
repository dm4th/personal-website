'use client';

import React from 'react';
import type { ToolUsePart } from '@/stores/agent';
import SearchContentCard from './tool-cards/SearchContentCard';
import JDFitCard from './tool-cards/JDFitCard';
import EmailDraftCard from './tool-cards/EmailDraftCard';
import MeetingSchedulerCard from './tool-cards/MeetingSchedulerCard';
import styles from './ToolCallCard.module.css';

export default function ToolCallCard({ part }: { part: ToolUsePart }) {
  if (part.name === 'search_content') return <SearchContentCard part={part} />;
  if (part.name === 'analyze_jd_fit') return <JDFitCard part={part} />;
  if (part.name === 'compose_email_to_danny') return <EmailDraftCard part={part} />;
  if (part.name === 'schedule_meeting') return <MeetingSchedulerCard part={part} />;

  return (
    <div className={styles.fallback}>
      <span>{part.status === 'pending' ? '⏳' : '✓'} {part.name}</span>
    </div>
  );
}
