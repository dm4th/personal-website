'use client';

import { useRef, useState } from 'react';
import { DISCOVERY_PERSONAS, type DiscoveryPersona } from '@/lib/fintechco/discoveryPrompt';
import type { DiscoveryMessage, TranscriptEntry } from '@/stores/fintechcoDiscovery';
import styles from './DiscoveryResults.module.css';

type DiscoveryResponseRow = {
  id: string;
  persona: DiscoveryPersona;
  visitorLabel: string | null;
  transcript: TranscriptEntry[];
  messages: DiscoveryMessage[];
  createdAt: string;
};

export default function DiscoveryResults() {
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<DiscoveryResponseRow[]>([]);
  const [expandedRaw, setExpandedRaw] = useState<Set<string>>(new Set());
  const codeRef = useRef<HTMLInputElement>(null);

  async function tryUnlock() {
    const code = codeRef.current?.value ?? '';
    if (!code) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/fintechco/discovery/results', {
        headers: { 'x-fintechco-results-code': code },
      });

      if (!res.ok) {
        setError('Incorrect results code.');
        return;
      }

      const data: { responses: DiscoveryResponseRow[] } = await res.json();
      setResponses(data.responses);
      setUnlocked(true);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function toggleRaw(id: string) {
    setExpandedRaw((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!unlocked) {
    return (
      <div className={styles.gate}>
        <h1 className={styles.title}>Discovery Results</h1>
        <p className={styles.intro}>Enter the results code to view submitted discovery responses.</p>
        <input
          ref={codeRef}
          type="password"
          placeholder="Results code"
          autoComplete="off"
          onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
          className={styles.input}
        />
        <p className={styles.error}>{error}</p>
        <button onClick={tryUnlock} disabled={loading} className={styles.unlockBtn}>
          {loading ? 'Checking…' : 'View results'}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.results}>
      <h1 className={styles.title}>Discovery Results</h1>
      <p className={styles.intro}>{responses.length} response{responses.length === 1 ? '' : 's'} submitted.</p>
      {responses.map((r) => (
        <div key={r.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.persona}>{DISCOVERY_PERSONAS[r.persona]?.label ?? r.persona}</span>
            {r.visitorLabel && <span className={styles.visitorLabel}>{r.visitorLabel}</span>}
            <span className={styles.timestamp}>{new Date(r.createdAt).toLocaleString()}</span>
          </div>
          <div className={styles.transcript}>
            {r.transcript.map((entry, i) => (
              <div key={i} className={styles.qa}>
                <p className={styles.question}>{entry.question}</p>
                <p className={styles.answer}>{entry.answer}</p>
              </div>
            ))}
          </div>
          <button className={styles.rawToggle} onClick={() => toggleRaw(r.id)}>
            {expandedRaw.has(r.id) ? 'Hide raw conversation' : 'Show raw conversation'}
          </button>
          {expandedRaw.has(r.id) && (
            <div className={styles.raw}>
              {r.messages.map((m) => (
                <div key={m.id} className={styles.rawMessage}>
                  <span className={styles.rawRole}>{m.role}:</span> {m.text}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
