'use client';

import { useState } from 'react';
import styles from './NotionConnectFlow.module.css';
import type {
  AgentResults,
  MeetingMetadata,
  NotionConnectState,
} from '@/lib/projects/notion-meeting-intelligence/types';
import type { NotionConfig } from './NotionSetupPanel';

const AGENT_LABELS: Record<string, string> = {
  sales: '⚡ Sales Coach',
  commercial: '💰 Pricing',
  delivery: '🔧 Delivery',
  product: '🧪 Product',
  icp: '🎯 ICP Fit',
  summary: '📋 Summary',
};

type Props = {
  results: AgentResults;
  metadata: MeetingMetadata;
  notionConfig: NotionConfig;
  isLoggedIn: boolean;
};

export default function NotionConnectFlow({ results, metadata, notionConfig, isLoggedIn }: Props) {
  const [connectState, setConnectState] = useState<NotionConnectState>({ status: 'idle' });

  const { token, meetingNotesDbId, agentAnalysesDbId, hasSavedToken } = notionConfig;

  const isConfigured =
    (token.length >= 10 || hasSavedToken) &&
    meetingNotesDbId.length >= 10 &&
    agentAnalysesDbId.length >= 10;

  async function handleCreate() {
    setConnectState({ status: 'loading' });

    if (isLoggedIn) {
      const { agentLibraryDbId, icpRubricDbId } = notionConfig;
      const saveBody: Record<string, string> = {
        meeting_notes_db_id: meetingNotesDbId,
        agent_analyses_db_id: agentAnalysesDbId,
      };
      if (token) saveBody.notion_token = token;
      if (agentLibraryDbId) saveBody.agent_library_db_id = agentLibraryDbId;
      if (icpRubricDbId) saveBody.icp_rubric_db_id = icpRubricDbId;
      fetch('/api/user/notion-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveBody),
      }).catch(() => {});
    }

    try {
      const res = await fetch('/api/projects/notion-meeting-intelligence/create-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notion_token: token || '__use_saved__',
          meeting_notes_db_id: meetingNotesDbId,
          agent_analyses_db_id: agentAnalysesDbId,
          ...(agentLibraryDbId ? { agent_library_db_id: agentLibraryDbId } : {}),
          results,
          metadata,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setConnectState({ status: 'error', message: data.error ?? 'Failed to create pages' });
        return;
      }
      setConnectState({
        status: 'success',
        meeting_page_url: data.meeting_page_url,
        agent_analysis_urls: data.agent_analysis_urls ?? [],
      });
    } catch {
      setConnectState({ status: 'error', message: 'Network error. Please try again.' });
    }
  }

  if (connectState.status === 'success') {
    const agentKeys = ['summary', 'sales', 'commercial', 'delivery', 'product', 'icp'];
    return (
      <div className={styles.wrapper}>
        <div className={styles.success}>
          <div className={styles.successHeader}>
            <span className={styles.successIcon}>✓</span>
            <div>
              <p className={styles.successTitle}>Created in Notion!</p>
              <a
                href={connectState.meeting_page_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.successLink}
              >
                Open Meeting Note →
              </a>
            </div>
          </div>
          {connectState.agent_analysis_urls.length > 0 && (
            <div className={styles.agentLinks}>
              <p className={styles.agentLinksLabel}>Agent Analysis rows:</p>
              <div className={styles.agentLinkList}>
                {connectState.agent_analysis_urls.map((url, i) => {
                  const key = agentKeys[i] ?? `agent-${i}`;
                  return (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.agentLink}
                    >
                      {AGENT_LABELS[key] ?? key} →
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.notionLogo}>N</span>
          <div>
            <p className={styles.headerTitle}>Write to Notion Workspace</p>
            <p className={styles.headerSub}>
              {isConfigured
                ? 'Creates Meeting Note + 6 Agent Analysis rows, all linked'
                : 'Complete Notion setup above to enable this'}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.createRow}>
        {connectState.status === 'error' && (
          <p className={styles.errorText}>{connectState.message}</p>
        )}
        <button
          className={styles.createBtn}
          onClick={handleCreate}
          disabled={!isConfigured || connectState.status === 'loading'}
        >
          {connectState.status === 'loading'
            ? 'Creating 6 pages...'
            : isConfigured
            ? 'Create in Notion (6 pages) →'
            : 'Complete setup above to enable'}
        </button>
      </div>
    </div>
  );
}
