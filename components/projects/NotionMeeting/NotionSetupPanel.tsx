'use client';

import { useState, useEffect } from 'react';
import styles from './NotionSetupPanel.module.css';
import type { NotionConfigGetResponse } from '@/lib/projects/notion-meeting-intelligence/types';

const NOTION_HUB_URL = 'https://dm4th.notion.site/AI-Native-GTM-Hub-357fc8f4554c806a908be47807ac63df';
const NOTION_INTEGRATIONS_URL = 'https://www.notion.so/my-integrations';

export type NotionConfig = {
  token: string;
  meetingNotesDbId: string;
  agentAnalysesDbId: string;
  /** DB ID for the user's own Agent Library (cloned from template) */
  agentLibraryDbId: string;
  /** DB ID for the user's own ICP Scoring Rubric (cloned from template) */
  icpRubricDbId: string;
  hasSavedToken: boolean;
};

type Props = {
  isLoggedIn: boolean;
  onConfigChange: (config: NotionConfig) => void;
  /** When false, the Skip button is hidden (used when user has committed to 'own workspace' mode) */
  allowSkip?: boolean;
};

export default function NotionSetupPanel({ isLoggedIn, onConfigChange, allowSkip = true }: Props) {
  const [skipped, setSkipped] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [token, setToken] = useState('');
  const [meetingNotesDbId, setMeetingNotesDbId] = useState('');
  const [agentAnalysesDbId, setAgentAnalysesDbId] = useState('');
  const [agentLibraryDbId, setAgentLibraryDbId] = useState('');
  const [icpRubricDbId, setIcpRubricDbId] = useState('');
  const [hasSavedToken, setHasSavedToken] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch('/api/user/notion-config')
      .then((r) => r.json())
      .then((data: NotionConfigGetResponse) => {
        if (data.meeting_notes_db_id) setMeetingNotesDbId(data.meeting_notes_db_id);
        if (data.agent_analyses_db_id) setAgentAnalysesDbId(data.agent_analyses_db_id);
        if (data.agent_library_db_id) setAgentLibraryDbId(data.agent_library_db_id);
        if (data.icp_rubric_db_id) setIcpRubricDbId(data.icp_rubric_db_id);
        setHasSavedToken(data.has_token);
      })
      .catch(() => {});
  }, [isLoggedIn]);

  useEffect(() => {
    onConfigChange({ token, meetingNotesDbId, agentAnalysesDbId, agentLibraryDbId, icpRubricDbId, hasSavedToken });
  }, [token, meetingNotesDbId, agentAnalysesDbId, agentLibraryDbId, icpRubricDbId, hasSavedToken, onConfigChange]);

  const isConfigured =
    (token.length >= 10 || hasSavedToken) &&
    meetingNotesDbId.length >= 10 &&
    agentAnalysesDbId.length >= 10;

  if (skipped) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header} onClick={() => setExpanded((e) => !e)}>
        <div className={styles.headerLeft}>
          <span className={styles.notionLogo}>N</span>
          <div>
            <p className={styles.title}>Notion Workspace Setup</p>
            <p className={styles.sub}>
              {isConfigured
                ? 'Connected - results will write to your workspace'
                : 'Optional - connect to write results to Notion'}
            </p>
          </div>
          {isConfigured && <span className={styles.readyBadge}>Ready</span>}
        </div>
        <div className={styles.headerRight}>
          <a
            href={NOTION_HUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.templateLink}
            onClick={(e) => e.stopPropagation()}
          >
            Get template
          </a>
          {allowSkip && (
            <button
              className={styles.skipBtn}
              onClick={(e) => { e.stopPropagation(); setSkipped(true); }}
            >
              Skip
            </button>
          )}
          <span className={styles.chevron}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className={styles.body}>
          <div className={styles.steps}>
            <div className={styles.step}>
              <span className={styles.stepNum}>1</span>
              <p className={styles.stepText}>
                <a href={NOTION_HUB_URL} target="_blank" rel="noopener noreferrer">
                  Duplicate the GTM Hub template
                </a>{' '}
                into your workspace.
              </p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <p className={styles.stepText}>
                Create an internal integration at{' '}
                <a href={NOTION_INTEGRATIONS_URL} target="_blank" rel="noopener noreferrer">
                  notion.so/my-integrations
                </a>
                . Copy the token.
              </p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>3</span>
              <p className={styles.stepText}>
                In each database: <strong>Share</strong> &rarr; <strong>Add Connection</strong> &rarr; select your integration. Copy the database ID from the URL (32-char hex after the last slash).
              </p>
            </div>
          </div>

          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                Integration Token
                {hasSavedToken && !token && (
                  <span className={styles.savedBadge}>Saved</span>
                )}
              </label>
              <input
                type="password"
                className={styles.input}
                placeholder={hasSavedToken ? 'Using saved token (leave blank to keep)' : 'secret_...'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Meeting Notes DB ID</label>
              <input
                type="text"
                className={styles.input}
                placeholder="32-char hex from URL"
                value={meetingNotesDbId}
                onChange={(e) => setMeetingNotesDbId(e.target.value.trim())}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Agent Analyses DB ID</label>
              <input
                type="text"
                className={styles.input}
                placeholder="32-char hex from URL"
                value={agentAnalysesDbId}
                onChange={(e) => setAgentAnalysesDbId(e.target.value.trim())}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Agent Library DB ID</label>
              <input
                type="text"
                className={styles.input}
                placeholder="32-char hex from URL"
                value={agentLibraryDbId}
                onChange={(e) => setAgentLibraryDbId(e.target.value.trim())}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>ICP Scoring Rubric DB ID</label>
              <input
                type="text"
                className={styles.input}
                placeholder="32-char hex from URL"
                value={icpRubricDbId}
                onChange={(e) => setIcpRubricDbId(e.target.value.trim())}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
