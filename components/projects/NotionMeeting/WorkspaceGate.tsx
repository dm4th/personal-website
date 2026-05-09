'use client';

import { useState } from 'react';
import styles from './WorkspaceGate.module.css';
import WorkspaceSetupModal from './WorkspaceSetupModal';
import type { NotionConfig } from './NotionSetupPanel';

export type WorkspaceMode = 'own' | 'demo';

type Props = {
  onDemoSelect: () => void;
  onOwnSelect: (config: NotionConfig) => void;
};

export default function WorkspaceGate({ onDemoSelect, onOwnSelect }: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className={styles.gate}>
        <div className={styles.headline}>
          <h2 className={styles.title}>How do you want to explore this?</h2>
          <p className={styles.sub}>
            This demo runs a 6-agent parallel pipeline against any meeting transcript.
            Choose how you want to experience it.
          </p>
        </div>

        <div className={styles.cards}>
          {/* Card A: Own Notion workspace */}
          <button className={styles.card} onClick={() => setShowModal(true)}>
            <div className={styles.cardIcon}>🏗️</div>
            <p className={styles.cardTitle}>Set up my own workspace</p>
            <p className={styles.cardDesc}>
              Duplicate the AI-Native GTM Hub template into your Notion, link it here, and
              every analysis you run syncs directly to your workspace - Meeting Notes, Agent
              Analyses rows, all linked.
            </p>
            <ul className={styles.cardBullets}>
              <li>Results write to your Notion databases</li>
              <li>Full Meeting Note + 6 Agent rows per call</li>
              <li>Customize agent prompts directly in Notion</li>
            </ul>
            <span className={styles.cardCta}>Set up workspace →</span>
          </button>

          {/* Card B: Demo mode */}
          <button className={styles.card} onClick={onDemoSelect}>
            <div className={styles.cardIcon}>⚡</div>
            <p className={styles.cardTitle}>Try it instantly</p>
            <p className={styles.cardDesc}>
              Skip setup and run the 6-agent pipeline right now using the demo backend.
              See all the structured outputs live in your browser.
            </p>
            <ul className={styles.cardBullets}>
              <li>No Notion account or setup required</li>
              <li>Full analysis, all 6 agents in parallel</li>
              <li>Results shown in-browser, not saved</li>
            </ul>
            <span className={styles.cardCta}>Try the demo →</span>
          </button>
        </div>
      </div>

      {showModal && (
        <WorkspaceSetupModal
          onComplete={(config) => {
            setShowModal(false);
            onOwnSelect(config);
          }}
          onDismiss={() => setShowModal(false)}
        />
      )}
    </>
  );
}
