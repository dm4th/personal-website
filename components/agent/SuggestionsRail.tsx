'use client';

import React from 'react';
import type { UIMessage, ToolUsePart } from '@/stores/agent';
import styles from './SuggestionsRail.module.css';

const TOOL_SUGGESTIONS: Record<string, string[]> = {
  search_content: [
    'How does this relate to his AI work?',
    'Paste a job description to check fit →',
  ],
  analyze_jd_fit: [
    'Draft an intro email for this role →',
    'Schedule a call to discuss →',
  ],
  compose_email_to_danny: [
    'Schedule a call instead →',
    "What else would you like to know about Dan?",
  ],
  schedule_meeting: [
    'Draft a follow-up email →',
    "Tell me more about Dan's background",
  ],
};

const DEFAULT_SUGGESTIONS = [
  "What's Dan's background in AI?",
  'Paste a job description to check fit →',
  'Schedule a call with Dan →',
];

function getLastToolName(messages: UIMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role !== 'assistant') continue;
    for (let j = msg.parts.length - 1; j >= 0; j--) {
      const part = msg.parts[j];
      if (part.type === 'tool_use') return (part as ToolUsePart).name;
    }
  }
  return null;
}

type Props = {
  messages: UIMessage[];
  onSend: (prompt: string) => void;
  disabled?: boolean;
};

export default function SuggestionsRail({ messages, onSend, disabled }: Props) {
  const lastTool = getLastToolName(messages);
  const suggestions = lastTool ? (TOOL_SUGGESTIONS[lastTool] ?? DEFAULT_SUGGESTIONS) : DEFAULT_SUGGESTIONS;

  if (messages.length === 0) return null;

  return (
    <div className={styles.rail}>
      {suggestions.map((s) => (
        <button
          key={s}
          className={styles.chip}
          onClick={() => onSend(s)}
          disabled={disabled}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
