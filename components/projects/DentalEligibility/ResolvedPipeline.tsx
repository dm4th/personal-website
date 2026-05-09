import styles from './ResolvedPipeline.module.css';
import type { FieldComparison } from '@/lib/projects/dental-eligibility/types';

type Props = {
  queryString: string;
  totalCases: number;
  topSimilarity: number;
  topMatchLabel: string | null;
  path: 'exact_match' | 'hybrid_rag';
  fieldComparison: FieldComparison[];
  threshold: number;
};

function formatVal(field: FieldComparison['field'], val: number | boolean): string {
  if (field === 'plan_year_remaining') return `$${(val as number).toLocaleString()}`;
  if (field === 'deductible_met') return val ? 'Yes' : 'No';
  return String(val);
}

export default function ResolvedPipeline({ queryString, totalCases, topSimilarity, topMatchLabel, path, fieldComparison, threshold }: Props) {
  const simPct = (topSimilarity * 100).toFixed(1);
  const thresholdPct = (threshold * 100).toFixed(0);
  const isStringMatch = topSimilarity === 1.0;
  const aboveThreshold = topSimilarity >= threshold;
  const mismatchedFields = fieldComparison.filter((f) => !f.matched);

  const routingReason: 'exact' | 'field_mismatch' | 'low_similarity' =
    path === 'exact_match'
      ? 'exact'
      : aboveThreshold && mismatchedFields.length > 0
        ? 'field_mismatch'
        : 'low_similarity';

  const truncatedQuery = queryString.length > 72 ? queryString.slice(0, 72) + '…' : queryString;

  return (
    <div className={styles.pipeline}>

      {/* Step 1: String match check - always first */}
      <div className={styles.step}>
        <span className={`${styles.check} ${isStringMatch ? styles.checkGreen : ''}`}>✓</span>
        <div className={styles.stepContent}>
          {isStringMatch ? (
            <>
              <span className={`${styles.stepLabel} ${styles.labelGreen}`}>
                String match found in {totalCases} case{totalCases !== 1 ? 's' : ''}
              </span>
              <span className={styles.stepDetail}>
                <em>{topMatchLabel}</em>: identical query text, skipping vector search
              </span>
            </>
          ) : (
            <>
              <span className={styles.stepLabel}>
                No string match in {totalCases} case{totalCases !== 1 ? 's' : ''}
              </span>
              <span className={styles.stepDetail}>Falling through to vector similarity search</span>
            </>
          )}
        </div>
      </div>

      {/* Steps 2–3: Embedding + search (only for non-string-match path) */}
      {!isStringMatch && (
        <>
          <div className={styles.step}>
            <span className={styles.check}>✓</span>
            <div className={styles.stepContent}>
              <span className={styles.stepLabel}>Embedded with text-embedding-3-small</span>
              <span className={styles.stepDetail}>{truncatedQuery}</span>
            </div>
          </div>

          <div className={styles.step}>
            <span className={styles.check}>✓</span>
            <div className={styles.stepContent}>
              <span className={styles.stepLabel}>Searched {totalCases} case{totalCases !== 1 ? 's' : ''} by vector similarity</span>
              {topMatchLabel && (
                <span className={styles.stepDetail}>
                  Top: <em>{topMatchLabel}</em> · {simPct}% similarity
                </span>
              )}
            </div>
          </div>
        </>
      )}

      {/* Final routing step */}
      {routingReason === 'exact' && (
        <div className={styles.step}>
          <span className={`${styles.check} ${styles.checkGreen}`}>🎯</span>
          <div className={styles.stepContent}>
            <span className={`${styles.stepLabel} ${styles.labelGreen}`}>
              {isStringMatch
                ? `100.0% ≥ ${thresholdPct}% threshold · All field checks passed`
                : `${simPct}% ≥ ${thresholdPct}% threshold · All field checks passed`}
            </span>
            <span className={styles.stepDetail}>LLM bypassed, returning stored verified determination</span>
          </div>
        </div>
      )}

      {routingReason === 'field_mismatch' && (
        <div className={styles.step}>
          <span className={`${styles.check} ${styles.checkBlue}`}>🧠</span>
          <div className={styles.stepContent}>
            <span className={`${styles.stepLabel} ${styles.labelBlue}`}>
              Field mismatch detected · Routing to GPT-4o
            </span>
            <span className={styles.stepDetail}>
              {mismatchedFields.map((f) =>
                `${f.label}: ${formatVal(f.field, f.query_val)} ≠ stored ${formatVal(f.field, f.stored_val)}`
              ).join(' · ')}
            </span>
          </div>
        </div>
      )}

      {routingReason === 'low_similarity' && (
        <div className={styles.step}>
          <span className={`${styles.check} ${styles.checkBlue}`}>🧠</span>
          <div className={styles.stepContent}>
            <span className={`${styles.stepLabel} ${styles.labelBlue}`}>
              {simPct}% &lt; {thresholdPct}% threshold · Routing to GPT-4o
            </span>
            <span className={styles.stepDetail}>Novel case, synthesizing with 3 retrieved examples as context</span>
          </div>
        </div>
      )}
    </div>
  );
}
