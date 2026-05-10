'use client';

import { useState, useEffect } from 'react';
import styles from './ResultsCard.module.css';
import DeterminationBadge from './DeterminationBadge';
import PipelineSteps from './PipelineSteps';
import ResolvedPipeline from './ResolvedPipeline';
import LookupTrace from './LookupTrace';
import type { DemoState, SimilarCase } from '@/lib/projects/dental-eligibility/types';

type Props = {
  state: DemoState;
  totalCases: number;
  approvalState: 'pending' | 'approved';
  threshold: number;
  onApprove: () => void;
  onClear: () => void;
};

function patientDollar(estimatedBenefit: number | null, coveragePct: number, patientPct: number): number | null {
  if (estimatedBenefit === null || coveragePct === 0) return null;
  return Math.round(estimatedBenefit * patientPct / coveragePct);
}

function SimilarCaseRow({ sc, index }: { sc: SimilarCase; index: number }) {
  const pct = Math.round(sc.similarity * 100);
  return (
    <div className={styles.similarRow}>
      <div className={styles.similarMeta}>
        <span className={styles.similarRank}>#{index + 1}</span>
        <span className={styles.similarLabel}>{sc.scenario_label}</span>
        {sc.source === 'session' && <span className={styles.sessionChip}>session</span>}
      </div>
      <div className={styles.similarBottom}>
        <div className={styles.simBar}>
          <div className={styles.simBarFill} style={{ width: `${pct}%` }} />
        </div>
        <span className={styles.simPct}>{pct}% match</span>
        <span className={sc.determination.covered ? styles.simCovered : styles.simNotCovered}>
          {sc.determination.covered ? `Covered ${sc.determination.coverage_pct}%` : 'Not covered'}
        </span>
      </div>
    </div>
  );
}

export default function ResultsCard({ state, totalCases, approvalState, threshold, onApprove, onClear }: Props) {
  const [denyStep, setDenyStep] = useState<'idle' | 'form' | 'submitted'>('idle');
  const [denyReason, setDenyReason] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setDenyStep('idle');
    setDenyReason('');
    setShowToast(false);
  }, [state]);

  const handleDenySubmit = () => {
    setDenyStep('submitted');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  if (state.status === 'idle') {
    return (
      <div className={`${styles.card} ${styles.idle}`}>
        <div className={styles.idleContent}>
          <div className={styles.idleIcon}>⚕</div>
          <p className={styles.idleText}>Enter procedure details and run an eligibility check.</p>
          <p className={styles.idleHint}>The system searches the verified case library first. Novel cases are synthesized by GPT-4o and routed for human review.</p>
        </div>
      </div>
    );
  }

  if (state.status === 'loading') {
    return (
      <div className={`${styles.card} ${styles.loading}`}>
        <PipelineSteps totalCases={totalCases} />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className={`${styles.card} ${styles.error}`}>
        <div className={styles.errorIcon}>⚠</div>
        <p className={styles.errorText}>{state.message}</p>
      </div>
    );
  }

  const { result } = state;
  const { determination, path, similar_cases, matched_case_id } = result;
  const isExactMatch = path === 'exact_match';

  const matchedCase = isExactMatch
    ? similar_cases.find((sc) => sc.id === matched_case_id) ?? similar_cases[0]
    : null;

  const patientAmt = patientDollar(
    determination.estimated_benefit,
    determination.coverage_pct,
    determination.patient_responsibility_pct,
  );

  const coverageDisplay = (
    <div className={styles.coverageBlock}>
      <div className={styles.coverageRow}>
        <DeterminationBadge covered={determination.covered} confidence={isExactMatch ? 1 : determination.confidence} />
        {determination.covered && determination.coverage_pct > 0 && (
          <span className={styles.pctLabel}>
            {determination.coverage_pct}% plan · {determination.patient_responsibility_pct}% patient
          </span>
        )}
      </div>

      {determination.covered && determination.coverage_pct === 100 && (
        <div className={styles.benefit}>
          <strong>100% covered</strong>, no patient cost
        </div>
      )}

      {determination.covered && determination.coverage_pct > 0 && determination.coverage_pct < 100 && (
        <div className={styles.benefitRow}>
          {determination.estimated_benefit !== null && (
            <span className={styles.benefit}>
              Plan pays: <strong>${determination.estimated_benefit.toLocaleString()}</strong>
            </span>
          )}
          {patientAmt !== null && (
            <span className={styles.patientAmt}>
              Patient owes: <strong>${patientAmt.toLocaleString()}</strong>
            </span>
          )}
        </div>
      )}

      {determination.flags.length > 0 && (
        <div className={styles.flagsList}>
          {determination.flags.map((flag) => (
            <span key={flag} className={styles.flag}>
              {flag.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  // Exact match - auto-approved
  if (isExactMatch) {
    return (
      <div className={styles.card}>
        <div className={styles.stack}>
          <div className={styles.statusBadge} data-status="approved">
            ✓ Auto-Approved
          </div>
          <p className={styles.statusNote}>
            This claim matches a previously verified determination. No review required.
          </p>

          {coverageDisplay}

          <ResolvedPipeline
            queryString={result.query_string}
            totalCases={totalCases}
            topSimilarity={result.top_similarity}
            topMatchLabel={matchedCase?.scenario_label ?? similar_cases[0]?.scenario_label ?? null}
            path={path}
            fieldComparison={result.field_comparison}
            threshold={threshold}
          />

          <LookupTrace
            queryString={result.query_string}
            topSimilarity={result.top_similarity}
            topMatchLabel={matchedCase?.scenario_label ?? similar_cases[0]?.scenario_label ?? null}
            path={path}
            fieldComparison={result.field_comparison}
            threshold={threshold}
          />

          <button className={styles.clearBtn} onClick={onClear}>
            Next Claim →
          </button>
        </div>
      </div>
    );
  }

  // Hybrid RAG - approved by user this session
  if (approvalState === 'approved') {
    return (
      <div className={styles.card}>
        <div className={styles.stack}>
          <div className={styles.statusBadge} data-status="approved">
            ✓ Approved: Added to Library
          </div>
          <p className={styles.statusNote}>
            This determination has been added to your session library. Future identical claims will auto-approve.
          </p>
          {coverageDisplay}
          <button className={styles.clearBtn} onClick={onClear}>
            Next Claim →
          </button>
        </div>
      </div>
    );
  }

  // Hybrid RAG - feedback submitted
  if (denyStep === 'submitted') {
    return (
      <div className={styles.card}>
        <div className={styles.stack}>
          <div className={styles.statusBadge} data-status="review">
            ✗ Feedback Submitted
          </div>
          <p className={styles.statusNote}>
            Thank you. Your correction has been noted. This determination will not be added to the library.
          </p>
          {coverageDisplay}
          <button className={styles.clearBtn} onClick={onClear}>
            Next Claim →
          </button>
        </div>
        {showToast && (
          <div className={styles.toast}>
            Feedback noted. Thank you for improving the system.
          </div>
        )}
      </div>
    );
  }

  // Hybrid RAG - deny form
  if (denyStep === 'form') {
    return (
      <div className={styles.card}>
        <div className={styles.stack}>
          <div className={styles.statusBadge} data-status="review">
            ✗ Determination Incorrect
          </div>
          {coverageDisplay}
          <div className={styles.denyForm}>
            <label className={styles.denyLabel}>Why is this determination incorrect?</label>
            <textarea
              className={styles.denyTextarea}
              placeholder="Describe what was wrong with the determination..."
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              rows={4}
            />
            <div className={styles.denyActions}>
              <button
                className={styles.submitFeedbackBtn}
                onClick={handleDenySubmit}
                disabled={!denyReason.trim()}
              >
                Submit Feedback
              </button>
              <button className={styles.cancelBtn} onClick={() => setDenyStep('idle')}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hybrid RAG - pending review
  return (
    <div className={styles.card}>
      <div className={styles.stack}>
        <div className={styles.statusBadge} data-status="review">
          ⚠ Review Required
        </div>
        <p className={styles.statusNote}>
          GPT-4o synthesized this determination using {similar_cases.length} similar verified {similar_cases.length === 1 ? 'case' : 'cases'} as context. Please review before approving.
        </p>

        {coverageDisplay}

        <ResolvedPipeline
          queryString={result.query_string}
          totalCases={totalCases}
          topSimilarity={result.top_similarity}
          topMatchLabel={similar_cases[0]?.scenario_label ?? null}
          path={path}
          fieldComparison={result.field_comparison}
          threshold={threshold}
        />

        {similar_cases.length > 0 && (
          <div className={styles.similarSection}>
            <span className={styles.reasoningLabel}>Retrieved Context</span>
            <div className={styles.similarList}>
              {similar_cases.map((sc, i) => (
                <SimilarCaseRow key={sc.id} sc={sc} index={i} />
              ))}
            </div>
          </div>
        )}

        <div className={styles.reasoningSection}>
          <span className={styles.reasoningLabel}>Determination Reasoning</span>
          <p className={styles.reasoningText}>{determination.reasoning}</p>
        </div>

        <LookupTrace
          queryString={result.query_string}
          topSimilarity={result.top_similarity}
          topMatchLabel={similar_cases[0]?.scenario_label ?? null}
          path={path}
          fieldComparison={result.field_comparison}
          threshold={threshold}
        />

        <div className={styles.reviewActions}>
          <p className={styles.reviewPrompt}>Is this determination correct?</p>
          <div className={styles.reviewButtons}>
            <button className={styles.approveBtn} onClick={onApprove}>
              ✓ Approve: Add to verified library
            </button>
            <button className={styles.denyBtn} onClick={() => setDenyStep('form')}>
              ✗ Deny
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
