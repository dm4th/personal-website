'use client';

import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Highlight, themes } from 'prism-react-renderer';
import RecordingEmbed from '@/components/fintechco/RecordingEmbed';
import styles from './SreTriageArtifact.module.css';

type Props = {
  recordingUrl?: string;
  rootCause: string;
  fixDiff: string;
  runbookBefore: string;
  runbookAfter: string;
  mttrNarrative: string;
};

function DiffCard({ diff }: { diff: string }) {
  return (
    <Highlight theme={themes.nightOwl} code={diff.trim()} language="diff">
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={`${className} ${styles.diffPre}`} style={style}>
          {tokens.map((line, i) => {
            const lineText = line.map((t) => t.content).join('');
            const isAdded = lineText.startsWith('+');
            const isRemoved = lineText.startsWith('-');
            return (
              <div
                key={i}
                {...getLineProps({ line })}
                className={`${styles.diffLine} ${isAdded ? styles.diffAdded : ''} ${isRemoved ? styles.diffRemoved : ''}`}
              >
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            );
          })}
        </pre>
      )}
    </Highlight>
  );
}

// Side by side on purpose: the sparse Before panel next to the dense After
// panel is the story, and the empty space under Before dramatizes the gap.
// The grid collapses to stacked panels on narrow screens.
function RunbookComparison({ runbookBefore, runbookAfter }: { runbookBefore: string; runbookAfter: string }) {
  return (
    <div className={styles.runbookGrid}>
      <div className={styles.runbookPanel}>
        <p className={styles.runbookLabel}>Before: the runbook on call that day</p>
        <div className={styles.markdownBody}>
          <ReactMarkdown>{runbookBefore}</ReactMarkdown>
        </div>
      </div>
      <div className={styles.runbookPanel}>
        <p className={styles.runbookLabel}>After: updated during the triage</p>
        <div className={styles.markdownBody}>
          <ReactMarkdown>{runbookAfter}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default function SreTriageArtifact({
  recordingUrl,
  rootCause,
  fixDiff,
  runbookBefore,
  runbookAfter,
  mttrNarrative,
}: Props) {
  return (
    <main className={styles.wrapper}>
      <Link href="/fintechco" className={styles.backLink}>&#8592; Back to hub</Link>

      <header className={styles.header}>
        <span className={styles.kicker}>SRE Team Demo</span>
        <h1 className={styles.title}>Incident Triage to Runbook</h1>
        <p className={styles.intro}>
          Checkout latency spiked 4x after a deploy. An on-call engineer uses Claude Code to
          trace root cause, ship the fix, and update the runbook so the pattern never costs
          28 minutes again.
        </p>
        <div className={styles.mttrKpi}>
          <div className={styles.kpiItem}>
            <span className={styles.kpiValue}>28 min</span>
            <span className={styles.kpiLabel}>Traditional MTTR</span>
          </div>
          <div className={styles.kpiDivider} aria-hidden>&#8594;</div>
          <div className={styles.kpiItem}>
            <span className={styles.kpiValueAccent}>9 min</span>
            <span className={styles.kpiLabel}>With Claude Code</span>
          </div>
          <div className={styles.kpiBadge}>68% faster</div>
        </div>
        <p className={styles.accountability}>
          The engineer reviews and approves each step. Claude proposes; humans decide.
        </p>
      </header>

      <section className={styles.section}>
        <RecordingEmbed recordingUrl={recordingUrl} title="SRE Incident Triage Demo" />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Root Cause Analysis</h2>
        <div className={`${styles.card} ${styles.markdownBody}`}>
          <ReactMarkdown>{rootCause}</ReactMarkdown>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>The Fix</h2>
        <p className={styles.sectionNote}>One config line resolved the retry amplification storm.</p>
        <div className={styles.card}>
          <DiffCard diff={fixDiff} />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Runbook: Before and After</h2>
        <p className={styles.sectionNote}>
          Claude updated the runbook with a new diagnosis path, monitoring suggestion, and
          recovery playbook for timeout mismatches.
        </p>
        <RunbookComparison runbookBefore={runbookBefore} runbookAfter={runbookAfter} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>MTTR Narrative</h2>
        <div className={`${styles.card} ${styles.markdownBody}`}>
          <ReactMarkdown>{mttrNarrative}</ReactMarkdown>
        </div>
      </section>
    </main>
  );
}
