'use client';

import React from 'react';
import type { ToolUsePart } from '@/stores/agent';
import SearchContentCard from './tool-cards/SearchContentCard';

export default function ToolCallCard({ part }: { part: ToolUsePart }) {
  if (part.name === 'search_content') return <SearchContentCard part={part} />;
  // Fallback for future tools
  return (
    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
      <span>{part.status === 'pending' ? '⏳' : '✓'} {part.name}</span>
    </div>
  );
}
