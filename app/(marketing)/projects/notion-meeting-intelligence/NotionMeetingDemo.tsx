'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import styles from './NotionMeetingDemo.module.css';
import MeetingBanner from '@/components/projects/NotionMeeting/MeetingBanner';
import WorkspaceGate from '@/components/projects/NotionMeeting/WorkspaceGate';
import TranscriptLibrary from '@/components/projects/NotionMeeting/TranscriptLibrary';
import TranscriptInput from '@/components/projects/NotionMeeting/TranscriptInput';
import AgentResultsTabs from '@/components/projects/NotionMeeting/AgentResultsTabs';
import NotionConnectFlow from '@/components/projects/NotionMeeting/NotionConnectFlow';
import { deriveMetadata } from '@/lib/projects/notion-meeting-intelligence/metadata';
import type { AgentName } from '@/lib/projects/notion-meeting-intelligence/prompts';
import type {
  TranscriptSample,
  MeetingDemoState,
  AgentResults,
  MeetingMetadata,
  PartialAgentResults,
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
  const [agentPromptBodies, setAgentPromptBodies] = useState<Record<AgentName, string> | null>(null);

  // Pre-fetch Notion agent prompts as soon as a workspace mode is selected,
  // so they're ready before the user clicks "Run 6 Agents".
  useEffect(() => {
    if (!workspaceMode) return;
    fetch('/api/projects/notion-meeting-intelligence/agent-prompts')
      .then((r) => r.json())
      .then((data: { promptBodies: Record<AgentName, string> | null }) => {
        if (data.promptBodies) setAgentPromptBodies(data.promptBodies);
      })
      .catch(() => {/* silently fall back to hardcoded prompts */});
  }, [workspaceMode]);

  function handleLoadSample(sample: TranscriptSample) {
    setTranscript(sample.transcript);
    setMeetingType(sample.meeting_type);
    setActiveTranscriptId(sample.id);
    setDemoState({ status: 'idle' });
  }

  async function handleSubmit() {
    if (transcript.trim().length < 50) return;
    setDemoState({ status: 'loading', agentsComplete: 0 });

    const base = '/api/projects/notion-meeting-intelligence/agents';
    const today = new Date().toISOString().slice(0, 10);

    async function callAgent(agentKey: AgentName, extra?: object) {
      const res = await fetch(`${base}/${agentKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          meeting_type: meetingType,
          promptBody: agentPromptBodies?.[agentKey],
          ...extra,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? `${agentKey} agent failed`);
      }
      return res.json();
    }

    try {
      // Phase 1: fire all 5 non-summary agents in parallel
      const [salesRes, commercialRes, deliveryRes, productRes, icpRes] =
        await Promise.allSettled([
          callAgent('sales'),
          callAgent('commercial'),
          callAgent('delivery'),
          callAgent('product'),
          callAgent('icp'),
        ]);

      const settled = [salesRes, commercialRes, deliveryRes, productRes, icpRes];
      const failed = settled.find((r) => r.status === 'rejected');
      if (failed) {
        const reason = (failed as PromiseRejectedResult).reason;
        const msg = reason instanceof Error ? reason.message : 'An agent failed. Please try again.';
        setDemoState({ status: 'error', message: msg });
        return;
      }

      setDemoState({ status: 'loading', agentsComplete: 5 });

      const partialResults: PartialAgentResults = {
        sales: (salesRes as PromiseFulfilledResult<PartialAgentResults['sales']>).value,
        commercial: (commercialRes as PromiseFulfilledResult<PartialAgentResults['commercial']>).value,
        delivery: (deliveryRes as PromiseFulfilledResult<PartialAgentResults['delivery']>).value,
        product: (productRes as PromiseFulfilledResult<PartialAgentResults['product']>).value,
        icp: (icpRes as PromiseFulfilledResult<PartialAgentResults['icp']>).value,
      };

      // Phase 2: summary agent depends on all 5 results
      const summary = await callAgent('summary', { partialResults });

      // Phase 3: derive metadata client-side and update state
      const results: AgentResults = { ...partialResults, summary };
      const metadata = deriveMetadata(results, transcript, meetingType, today);
      setLastResults(results);
      setLastMetadata(metadata);
      setDemoState({ status: 'success', results, metadata });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      setDemoState({ status: 'error', message });
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
