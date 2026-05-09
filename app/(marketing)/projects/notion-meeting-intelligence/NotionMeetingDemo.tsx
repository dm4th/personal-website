'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import styles from './NotionMeetingDemo.module.css';
import MeetingBanner from '@/components/projects/NotionMeeting/MeetingBanner';
import WorkspaceGate from '@/components/projects/NotionMeeting/WorkspaceGate';
import TranscriptLibrary from '@/components/projects/NotionMeeting/TranscriptLibrary';
import TranscriptInput from '@/components/projects/NotionMeeting/TranscriptInput';
import AgentResultsTabs from '@/components/projects/NotionMeeting/AgentResultsTabs';
import NotionConnectFlow from '@/components/projects/NotionMeeting/NotionConnectFlow';
import type {
  TranscriptSample,
  MeetingDemoState,
  AgentResults,
  MeetingMetadata,
  AgentAnalyzeResponse,
} from '@/lib/projects/notion-meeting-intelligence/types';
import type { NotionConfig } from '@/components/projects/NotionMeeting/NotionSetupPanel';
import type { WorkspaceMode } from '@/components/projects/NotionMeeting/WorkspaceGate';

type Props = {
  samples: TranscriptSample[];
};

const EMPTY_CONFIG: NotionConfig = {
  token: '',
  meetingNotesDbId: '',
  agentAnalysesDbId: '',
  agentLibraryDbId: '',
  icpRubricDbId: '',
  hasSavedToken: false,
};

export default function NotionMeetingDemo({ samples }: Props) {
  const { isSignedIn } = useAuth();

  /** null = gate visible; 'own' or 'demo' = gate passed */
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode | null>(null);

  const [transcript, setTranscript] = useState('');
  const [meetingType, setMeetingType] = useState('Discovery');
  const [activeTranscriptId, setActiveTranscriptId] = useState<string | null>(null);
  const [demoState, setDemoState] = useState<MeetingDemoState>({ status: 'idle' });
  const [lastResults, setLastResults] = useState<AgentResults | null>(null);
  const [lastMetadata, setLastMetadata] = useState<MeetingMetadata | null>(null);
  const [notionConfig, setNotionConfig] = useState<NotionConfig>(EMPTY_CONFIG);

  function handleLoadSample(sample: TranscriptSample) {
    setTranscript(sample.transcript);
    setMeetingType(sample.meeting_type);
    setActiveTranscriptId(sample.id);
    setDemoState({ status: 'idle' });
  }

  async function handleSubmit() {
    if (transcript.trim().length < 50) return;
    setDemoState({ status: 'loading' });

    try {
      const res = await fetch('/api/projects/notion-meeting-intelligence/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, meeting_type: meetingType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDemoState({ status: 'error', message: data.error ?? 'Analysis failed. Please try again.' });
        return;
      }

      const { results, metadata } = data as AgentAnalyzeResponse;
      setLastResults(results);
      setLastMetadata(metadata);
      setDemoState({ status: 'success', results, metadata });
    } catch {
      setDemoState({ status: 'error', message: 'Network error. Please check your connection.' });
    }
  }

  function handleReturnToGate() {
    setWorkspaceMode(null);
    setDemoState({ status: 'idle' });
    setLastResults(null);
    setLastMetadata(null);
    setNotionConfig(EMPTY_CONFIG);
  }

  /** Gate: user has not chosen a mode yet */
  if (workspaceMode === null) {
    return (
      <div className={styles.demo}>
        <MeetingBanner />
        <WorkspaceGate
          onDemoSelect={() => setWorkspaceMode('demo')}
          onOwnSelect={(config) => {
            setNotionConfig(config);
            setWorkspaceMode('own');
          }}
        />
      </div>
    );
  }

  return (
    <div className={styles.demo}>
      <MeetingBanner />

      {/* Mode indicator - lets user switch back to the gate */}
      <div className={styles.modeBanner}>
        <span className={styles.modeBannerText}>
          {workspaceMode === 'own'
            ? '🏗️ Own workspace mode - analyses sync to your Notion'
            : '⚡ Demo mode - results shown in-browser only'}
        </span>
        <button className={styles.modeSwitchBtn} onClick={handleReturnToGate}>
          Switch mode
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.left}>
          <TranscriptLibrary
            samples={samples}
            activeId={activeTranscriptId}
            onLoad={handleLoadSample}
          />
          <TranscriptInput
            transcript={transcript}
            meetingType={meetingType}
            onChange={(t) => { setTranscript(t); setActiveTranscriptId(null); }}
            onMeetingTypeChange={setMeetingType}
            onSubmit={handleSubmit}
            loading={demoState.status === 'loading'}
          />
        </div>

        <div className={styles.right}>
          <AgentResultsTabs state={demoState} />

          {/* Notion write flow: only in 'own' mode after a successful analysis */}
          {workspaceMode === 'own' && demoState.status === 'success' && lastResults && lastMetadata && (
            <NotionConnectFlow
              results={lastResults}
              metadata={lastMetadata}
              notionConfig={notionConfig}
              isLoggedIn={Boolean(isSignedIn)}
            />
          )}

          {/* Demo mode: soft nudge after seeing results */}
          {workspaceMode === 'demo' && demoState.status === 'success' && (
            <div className={styles.demoNudge}>
              <p className={styles.demoNudgeText}>
                Want these results in your Notion? Set up the GTM Hub template and link it here.
              </p>
              <button
                className={styles.demoNudgeBtn}
                onClick={() => {
                  // Return to gate so user can choose 'own workspace' and go through the modal
                  handleReturnToGate();
                }}
              >
                Set up workspace →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
