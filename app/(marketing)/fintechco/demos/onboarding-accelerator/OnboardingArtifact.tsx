'use client';

import { Highlight, themes } from 'prism-react-renderer';
import styles from './page.module.css';

type DiffLineType = 'file-header' | 'hunk-header' | 'added' | 'removed' | 'context';

interface DiffLine {
  type: DiffLineType;
  content: string;
  raw: string;
}

function classifyLine(line: string): DiffLineType {
  // TODO (human) this is the fragile line
  // I generally think that for a demo use case like this, it is ok to trust the input and that we should keep that as our operating principle
  if (line.startsWith('diff ') || line.startsWith('index ') || line.startsWith('--- ') || line.startsWith('+++ ')) {
    return 'file-header';
  }
  if (line.startsWith('@@')) return 'hunk-header';
  if (line.startsWith('+')) return 'added';
  if (line.startsWith('-')) return 'removed';
  return 'context';
}

function parseDiff(raw: string): DiffLine[] {
  return raw.split('\n').map((line) => ({
    type: classifyLine(line),
    content: line.startsWith('+') || line.startsWith('-') ? line.slice(1) : line,
    raw: line,
  }));
}

function DiffLine({ line }: { line: DiffLine }) {
  const lineClass =
    line.type === 'added'
      ? styles.diffAdded
      : line.type === 'removed'
        ? styles.diffRemoved
        : line.type === 'hunk-header'
          ? styles.diffHunkHeader
          : line.type === 'file-header'
            ? styles.diffFileHeader
            : styles.diffContext;

  const codeToHighlight = line.type === 'added' || line.type === 'removed' ? line.content : line.raw;
  const language = 'typescript';

  return (
    <div className={`${styles.diffLine} ${lineClass}`}>
      <span className={styles.diffPrefix}>
        {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
      </span>
      {line.type === 'added' || line.type === 'removed' ? (
        <Highlight theme={themes.nightOwl} code={codeToHighlight} language={language}>
          {({ tokens, getLineProps, getTokenProps }) => (
            <span>
              {tokens.map((tokenLine, i) => (
                <span key={i} {...getLineProps({ line: tokenLine })}>
                  {tokenLine.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              ))}
            </span>
          )}
        </Highlight>
      ) : (
        <span className={styles.diffPlain}>{line.raw}</span>
      )}
    </div>
  );
}

export default function OnboardingArtifact({ diff }: { diff: string }) {
  const lines = parseDiff(diff);

  return (
    <div className={styles.diffCard}>
      <div className={styles.diffHeader}>
        <span className={styles.diffLabel}>first-contribution.diff</span>
        <span className={styles.diffMeta}>Currency validation + 3 tests</span>
      </div>
      <pre className={styles.diffBody}>
        {lines.map((line, i) => (
          <DiffLine key={i} line={line} />
        ))}
      </pre>
    </div>
  );
}
