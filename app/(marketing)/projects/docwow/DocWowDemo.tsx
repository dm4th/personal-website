'use client';

import { useState, useCallback } from 'react';
import type {
  AnalysisProfile,
  ChatMessage,
  Citation,
  DemoPhase,
  ExtractedBlock,
  SampleDoc,
} from '@/lib/projects/docwow/types';
import ProfileSetup from '@/components/projects/DocWow/ProfileSetup';
import UploadPanel from '@/components/projects/DocWow/UploadPanel';
import ProcessingView from '@/components/projects/DocWow/ProcessingView';
import PDFViewer from '@/components/projects/DocWow/PDFViewer';
import ChatPanel from '@/components/projects/DocWow/ChatPanel';
import styles from './DocWowDemo.module.css';

interface Props {
  samples: SampleDoc[];
}

export default function DocWowDemo({ samples }: Props) {
  const [phase, setPhase] = useState<DemoPhase>({ status: 'idle' });
  const [profile, setProfile] = useState<AnalysisProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingSample, setPendingSample] = useState<SampleDoc | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  const requestProfile = (file?: File, sample?: SampleDoc) => {
    if (file) setPendingFile(file);
    if (sample) setPendingSample(sample);
    setShowProfileModal(true);
  };

  const handleProfileConfirm = async (selectedProfile: AnalysisProfile) => {
    setProfile(selectedProfile);
    setShowProfileModal(false);
    if (pendingFile) {
      await processFile(pendingFile, selectedProfile);
      setPendingFile(null);
    } else if (pendingSample) {
      await processSample(pendingSample, selectedProfile);
      setPendingSample(null);
    }
  };

  const processSample = async (sample: SampleDoc, selectedProfile: AnalysisProfile) => {
    setMessages([]);
    setActiveCitation(null);
    setSuggestedQuestions(sample.suggestedQuestions);
    const s3Key = `samples/${sample.filename}`;
    const localUrl = `/sample-docs/${sample.filename}`;
    setPdfUrl(localUrl);
    await runProcessing(s3Key, selectedProfile);
  };

  const processFile = async (file: File, selectedProfile: AnalysisProfile) => {
    setMessages([]);
    setActiveCitation(null);
    setSuggestedQuestions([]);
    setPhase({ status: 'processing', stage: 'uploading' });
    const urlRes = await fetch(`/api/projects/docwow/upload-url?filename=${encodeURIComponent(file.name)}`);
    if (!urlRes.ok) {
      setPhase({ status: 'error', message: 'Failed to get upload URL. Please try again.' });
      return;
    }
    const { url, key } = await urlRes.json();
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', 'application/pdf');
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setPhase({ status: 'uploading', progress: pct });
        }
      };
      xhr.onload = () => (xhr.status < 400 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
      xhr.onerror = () => reject(new Error('Upload error'));
      xhr.send(file);
    }).catch((err) => {
      setPhase({ status: 'error', message: err.message ?? 'Upload failed' });
      return;
    });
    setPdfUrl(URL.createObjectURL(file));
    await runProcessing(key, selectedProfile);
  };

  const runProcessing = async (s3Key: string, selectedProfile: AnalysisProfile) => {
    // Phase 1: kick off Textract job — returns in ~1s
    setPhase({ status: 'processing', stage: 'textract' });
    const startRes = await fetch('/api/projects/docwow/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ s3Key, profile: selectedProfile }),
    });
    if (!startRes.ok) {
      const err = await startRes.json().catch(() => ({}));
      setPhase({ status: 'error', message: (err as { error?: string }).error ?? 'Processing failed. Please try again.' });
      return;
    }
    const { sessionId } = await startRes.json() as { sessionId: string };

    // Phase 2: poll /status every 3s until Textract finishes
    setPhase({ status: 'processing', stage: 'parsing' });
    const MAX_POLLS = 40; // 2 minute cap
    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const statusRes = await fetch(`/api/projects/docwow/status?sessionId=${sessionId}`);
      if (!statusRes.ok) {
        setPhase({ status: 'error', message: 'Status check failed. Please try again.' });
        return;
      }
      const statusData = await statusRes.json() as
        | { status: 'processing'; pagesProcessed: number }
        | { status: 'ready'; blocks: ExtractedBlock[]; pageCount: number }
        | { status: 'failed'; message: string };

      if (statusData.status === 'failed') {
        setPhase({ status: 'error', message: statusData.message });
        return;
      }
      if (statusData.status === 'ready') {
        setPhase({ status: 'ready', sessionId, pageCount: statusData.pageCount, blocks: statusData.blocks });
        return;
      }
      // Still processing — update pagesProcessed so progress bar advances
      setPhase({ status: 'processing', stage: 'textract', pagesProcessed: statusData.pagesProcessed });
    }
    setPhase({ status: 'error', message: 'Processing timed out. Please try again.' });
  };

  const handleSend = useCallback(async (userMessage: string) => {
    if (phase.status !== 'ready') return;
    const { sessionId } = phase;
    const userMsg: ChatMessage = { role: 'user', content: userMessage };
    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);
    setActiveCitation(null);
    try {
      const res = await fetch('/api/projects/docwow/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userMessage }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setMessages((prev) => [...prev, { role: 'assistant', content: (err as { error?: string }).error ?? 'Something went wrong. Please try again.' }]);
        return;
      }
      const { answer, citations } = await res.json() as { answer: string; citations: Citation[] };
      setMessages((prev) => [...prev, { role: 'assistant', content: answer, citations }]);
      if (citations?.length > 0) setActiveCitation(citations[0]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Network error. Please check your connection and try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  }, [phase]);

  const handleCitationClick = useCallback((citation: Citation) => {
    setActiveCitation(citation);
  }, []);

  const handleReset = () => {
    setPhase({ status: 'idle' });
    setMessages([]);
    setActiveCitation(null);
    setPdfUrl(null);
    setProfile(null);
    setSuggestedQuestions([]);
  };

  const isReady = phase.status === 'ready';
  const isProcessing = phase.status === 'processing' || phase.status === 'uploading';

  return (
    <div className={styles.root}>
      {showProfileModal && (
        <ProfileSetup
          onConfirm={handleProfileConfirm}
          onCancel={() => { setShowProfileModal(false); setPendingFile(null); setPendingSample(null); }}
        />
      )}
      <div className={styles.layout}>
        <div className={styles.leftCol}>
          {isReady && pdfUrl ? (
            <>
              <div className={styles.pdfHeader}>
                <span className={styles.profileBadge}>{profile?.role}</span>
                <button className={styles.resetBtn} onClick={handleReset}>← New Document</button>
              </div>
              <div className={styles.pdfViewer}>
                <PDFViewer pdfUrl={pdfUrl} activeCitation={activeCitation} />
              </div>
              {activeCitation && (
                <div className={styles.citationCallout}>
                  <span className={styles.calloutLabel}>Cited From Page {activeCitation.pageNumber} · {activeCitation.type.charAt(0).toUpperCase() + activeCitation.type.slice(1)}</span>
                  <p className={styles.calloutQuote}>&ldquo;{activeCitation.quote}&rdquo;</p>
                </div>
              )}
            </>
          ) : isProcessing ? (
            <ProcessingView
              stage={phase.status === 'uploading' ? 'uploading' : (phase as { status: 'processing'; stage: string }).stage}
              uploadProgress={phase.status === 'uploading' ? phase.progress : undefined}
              pagesProcessed={phase.status === 'processing' ? (phase as { status: 'processing'; stage: string; pagesProcessed?: number }).pagesProcessed : undefined}
            />
          ) : phase.status === 'error' ? (
            <div className={styles.errorBox}>
              <p>{phase.message}</p>
              <button className={styles.resetBtn} onClick={handleReset}>Try Again</button>
            </div>
          ) : (
            <UploadPanel
              samples={samples}
              onSampleSelect={(s) => requestProfile(undefined, s)}
              onFileUpload={(f) => requestProfile(f)}
            />
          )}
        </div>
        <div className={`${styles.rightCol} ${!isReady ? styles.dimmed : ''}`}>
          <ChatPanel
            messages={messages}
            isLoading={isChatLoading}
            activeCitationId={activeCitation?.blockId ?? null}
            suggestedQuestions={suggestedQuestions}
            onSend={handleSend}
            onCitationClick={handleCitationClick}
          />
        </div>
      </div>
    </div>
  );
}
