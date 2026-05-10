'use client';

import { useState } from 'react';
import styles from './WorkspaceSetupModal.module.css';
import type { NotionConfig } from './NotionSetupPanel';

const NOTION_TEMPLATE_URL =
  'https://dm4th.notion.site/AI-Native-GTM-Hub-357fc8f4554c806a908be47807ac63df';
const NOTION_INTEGRATIONS_URL = 'https://www.notion.so/my-integrations';

type Step = 1 | 2 | 3;

type WorkspaceDb = { id: string; name: string };

/** Names we're looking for in the user's workspace (case-insensitive substring match). */
const DB_TARGETS = [
  { key: 'meetingNotesDbId' as const,   label: '📝 Meeting Notes',          match: 'meeting notes' },
  { key: 'agentAnalysesDbId' as const,  label: '🤖 Agent Analyses',         match: 'agent anal' },
  { key: 'agentLibraryDbId' as const,   label: '🧠 Agent Library',          match: 'agent lib' },
  { key: 'icpRubricDbId' as const,      label: '🎯 ICP Scoring Rubric',     match: 'icp' },
] as const;

type DbKey = (typeof DB_TARGETS)[number]['key'];

/**
 * Extract the 32-char hex Notion database ID from either:
 *   - a raw 32-char hex string
 *   - a UUID (with hyphens) — strip the hyphens
 *   - a full Notion URL — pull the last path segment and grab the trailing 32 hex chars
 * Returns the raw input if nothing matches (user may still be typing).
 */
function extractNotionId(raw: string): string {
  const s = raw.trim();

  // Already a bare 32-char hex
  if (/^[0-9a-f]{32}$/i.test(s)) return s.toLowerCase();

  // UUID format with hyphens (8-4-4-4-12)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) {
    return s.replace(/-/g, '').toLowerCase();
  }

  // Notion URL: grab last path segment (before any ?), then pull trailing 32 hex chars
  // e.g. https://notion.so/myworkspace/Meeting-Notes-abc123...?v=...
  try {
    const url = new URL(s);
    const segments = url.pathname.split('/').filter(Boolean);
    for (const seg of [...segments].reverse()) {
      // Strip UUID hyphens from segment, then check for 32-char suffix
      const noHyphens = seg.replace(/-/g, '');
      const match = noHyphens.match(/([0-9a-f]{32})$/i);
      if (match) return match[1].toLowerCase();
    }
  } catch {
    // Not a URL — fall through
  }

  return s;
}

type Props = {
  onComplete: (config: NotionConfig) => void;
  onDismiss: () => void;
};

export default function WorkspaceSetupModal({ onComplete, onDismiss }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [token, setToken] = useState('');

  // DB ID fields — stored as processed IDs but display raw input while user types
  const [fields, setFields] = useState<Record<DbKey, string>>({
    meetingNotesDbId: '',
    agentAnalysesDbId: '',
    agentLibraryDbId: '',
    icpRubricDbId: '',
  });

  // Workspace search state
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchMatches, setSearchMatches] = useState<Record<DbKey, string> | null>(null);

  const canAdvanceStep2 = token.length >= 10;
  const canFinish = DB_TARGETS.every(({ key }) => extractNotionId(fields[key]).length === 32);

  function setField(key: DbKey, raw: string) {
    const parsed = extractNotionId(raw);
    // Store the parsed value (or raw if it didn't parse yet, so the input stays editable)
    setFields((prev) => ({ ...prev, [key]: parsed.length === 32 ? parsed : raw }));
    setSearchMatches(null); // clear search highlights when user edits manually
  }

  async function handleSearchWorkspace() {
    setSearching(true);
    setSearchError(null);
    setSearchMatches(null);

    try {
      const res = await fetch('/api/projects/notion-meeting-intelligence/search-workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notion_token: token }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSearchError(data.detail ?? data.error ?? 'Search failed');
        return;
      }

      const dbs: WorkspaceDb[] = data.databases ?? [];

      // Try to match each target DB by name substring (case-insensitive)
      const matched: Partial<Record<DbKey, string>> = {};
      for (const target of DB_TARGETS) {
        const hit = dbs.find((db) =>
          db.name.toLowerCase().includes(target.match),
        );
        if (hit) matched[target.key] = hit.id;
      }

      if (Object.keys(matched).length === 0) {
        setSearchError(
          'No matching databases found inside that hub page. Make sure the integration has access to it (... → Connections), then try again.',
        );
        return;
      }

      // Merge matches into fields (don't overwrite fields the user already filled)
      setFields((prev) => {
        const next = { ...prev };
        for (const [k, v] of Object.entries(matched) as [DbKey, string][]) {
          if (!prev[k] || prev[k].length < 32) next[k] = v;
        }
        return next;
      });
      setSearchMatches(matched as Record<DbKey, string>);
    } catch {
      setSearchError('Network error. Please try again.');
    } finally {
      setSearching(false);
    }
  }

  function handleFinish() {
    const resolved: Record<DbKey, string> = {
      meetingNotesDbId: extractNotionId(fields.meetingNotesDbId),
      agentAnalysesDbId: extractNotionId(fields.agentAnalysesDbId),
      agentLibraryDbId: extractNotionId(fields.agentLibraryDbId),
      icpRubricDbId: extractNotionId(fields.icpRubricDbId),
    };
    onComplete({
      token,
      ...resolved,
      hasSavedToken: false,
    });
  }

  return (
    <div className={styles.backdrop} onClick={onDismiss}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.stepPills}>
            {([1, 2, 3] as Step[]).map((s) => (
              <div
                key={s}
                className={[
                  styles.pill,
                  step === s ? styles.pillActive : '',
                  step > s ? styles.pillDone : '',
                ].join(' ')}
              >
                {step > s ? '✓' : s}
              </div>
            ))}
          </div>
          <button className={styles.closeBtn} onClick={onDismiss} aria-label="Close">
            ✕
          </button>
        </div>

        {/* ── Step 1: Clone the template ── */}
        {step === 1 && (
          <div className={styles.stepBody}>
            <p className={styles.stepLabel}>Step 1 of 3</p>
            <h2 className={styles.stepTitle}>Clone the GTM Hub template</h2>
            <p className={styles.stepDesc}>
              The template includes all four Notion databases the pipeline writes to:
            </p>

            <div className={styles.dbList}>
              {[
                { emoji: '📝', name: 'Meeting Notes', desc: 'One page per meeting with full AI debrief' },
                { emoji: '🤖', name: 'Agent Analyses', desc: 'Six rows per meeting, one per agent, all linked' },
                { emoji: '🧠', name: 'Agent Library', desc: 'Data-driven agent definitions: edit prompts directly in Notion' },
                { emoji: '🎯', name: 'ICP Scoring Rubric', desc: 'Live scoring dimensions injected into the ICP agent' },
              ].map(({ emoji, name, desc }) => (
                <div key={name} className={styles.dbRow}>
                  <span className={styles.dbEmoji}>{emoji}</span>
                  <div>
                    <p className={styles.dbName}>{name}</p>
                    <p className={styles.dbDesc}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href={NOTION_TEMPLATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.templateBtn}
            >
              Open GTM Hub Template →
            </a>
            <p className={styles.templateNote}>
              ⏳ Template pending review by the Notion team — duplication coming soon.
            </p>

            <button className={styles.primaryBtn} onClick={() => setStep(2)}>
              I&apos;ve cloned it, continue →
            </button>
          </div>
        )}

        {/* ── Step 2: Create integration + paste token ── */}
        {step === 2 && (
          <div className={styles.stepBody}>
            <p className={styles.stepLabel}>Step 2 of 3</p>
            <h2 className={styles.stepTitle}>Create a Notion integration</h2>
            <p className={styles.stepDesc}>
              This gives the demo permission to write meeting notes to your workspace.
            </p>

            <ol className={styles.instructionList}>
              <li>
                Go to{' '}
                <a href={NOTION_INTEGRATIONS_URL} target="_blank" rel="noopener noreferrer">
                  notion.so/my-integrations
                </a>{' '}
                and click <strong>New integration</strong>.
              </li>
              <li>
                Name it anything (e.g. &ldquo;GTM Demo&rdquo;), set type to <strong>Internal</strong>, submit.
              </li>
              <li>
                Copy the <strong>Internal Integration Token</strong> shown on the next screen.
              </li>
              <li>
                Open each of the 4 databases in your cloned template. In each one:
                click <strong>&hellip;</strong> &rarr; <strong>Connections</strong> &rarr;{' '}
                <strong>Add a connection</strong> &rarr; select your integration.
                <span className={styles.altNote}>
                  Alternatively, if you&apos;re a workspace owner you can grant your integration
                  workspace-wide access from <strong>Settings &rarr; Connections</strong> - then
                  the search in step 3 will find all your databases automatically.
                </span>
              </li>
            </ol>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Integration Token</label>
              <input
                type="password"
                className={styles.input}
                placeholder="secret_..."
                value={token}
                onChange={(e) => setToken(e.target.value.trim())}
                autoFocus
              />
            </div>

            <div className={styles.btnRow}>
              <button className={styles.backBtn} onClick={() => setStep(1)}>
                &larr; Back
              </button>
              <button
                className={styles.primaryBtn}
                disabled={!canAdvanceStep2}
                onClick={() => setStep(3)}
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Database IDs ── */}
        {step === 3 && (
          <div className={styles.stepBody}>
            <p className={styles.stepLabel}>Step 3 of 3</p>
            <h2 className={styles.stepTitle}>Connect your databases</h2>
            <p className={styles.stepDesc}>
              Paste a database URL or the 32-character ID from the URL. You can also let us
              search your workspace and fill these in automatically.
            </p>

            {/* Search workspace button */}
            <div className={styles.searchRow}>
              <button
                className={styles.searchBtn}
                onClick={handleSearchWorkspace}
                disabled={searching}
              >
                {searching ? 'Searching...' : '🔍 Search my workspace'}
              </button>
              {searchMatches && (
                <span className={styles.searchSuccess}>
                  Found {Object.keys(searchMatches).length} of 4 databases
                </span>
              )}
            </div>
            {searchError && <p className={styles.searchError}>{searchError}</p>}

            <div className={styles.fields}>
              {DB_TARGETS.map(({ key, label }) => {
                const val = fields[key];
                const resolved = extractNotionId(val);
                const isValid = resolved.length === 32;
                const wasSearched = searchMatches && key in searchMatches;
                return (
                  <div key={key} className={styles.field}>
                    <label className={styles.fieldLabel}>
                      {label}
                      {isValid && (
                        <span className={styles.validBadge}>
                          {wasSearched ? 'Found' : '✓'}
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      className={`${styles.input} ${isValid ? styles.inputValid : ''}`}
                      placeholder="Paste a database URL or 32-char ID"
                      value={val}
                      onChange={(e) => setField(key, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>

            <div className={styles.btnRow}>
              <button className={styles.backBtn} onClick={() => setStep(2)}>
                &larr; Back
              </button>
              <button
                className={styles.primaryBtn}
                disabled={!canFinish}
                onClick={handleFinish}
              >
                Start using my workspace &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
