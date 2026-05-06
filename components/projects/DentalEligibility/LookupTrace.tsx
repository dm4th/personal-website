import styles from './LookupTrace.module.css';
import type { FieldComparison } from '@/lib/projects/dental-eligibility/types';

type Props = {
  queryString: string;
  topSimilarity: number;
  topMatchLabel: string | null;
  path: 'exact_match' | 'hybrid_rag';
  fieldComparison: FieldComparison[];
};

const THRESHOLD = 0.97;

function formatVal(field: FieldComparison['field'], val: number | boolean): string {
  if (field === 'plan_year_remaining') return `$${(val as number).toLocaleString()}`;
  if (field === 'deductible_met') return val ? 'Yes' : 'No';
  return String(val);
}

function formatQueryString(qs: string): string {
  return qs
    .replace(' Patient age:', '\n\nPatient age:')
    .replace(' Plan year remaining:', '\nPlan year remaining:')
    .replace(' Deductible met:', '\nDeductible met:');
}

export default function LookupTrace({ queryString, topSimilarity, topMatchLabel, path, fieldComparison }: Props) {
  const simPct = topSimilarity * 100;
  const thresholdPct = THRESHOLD * 100;
  const aboveThreshold = topSimilarity >= THRESHOLD;
  const allFieldsMatch = fieldComparison.every((f) => f.matched);
  const isExact = path === 'exact_match';

  return (
    <details className={styles.details}>
      <summary className={styles.summary}>
        <span className={styles.summaryIcon}>🔬</span>
        <span className={styles.summaryLabel}>Lookup trace</span>
        <span className={styles.summaryHint}>embedding · similarity · field checks</span>
      </summary>

      <div className={styles.body}>

        {/* Section 1: Embedding input */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Embedding Input</span>
            <span className={styles.sectionNote}>text-embedding-3-small · 1536 dimensions</span>
          </div>
          <pre className={styles.queryPre}>{formatQueryString(queryString)}</pre>
        </div>

        <div className={styles.divider} />

        {/* Section 2: Similarity gate */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Similarity Gate</span>
            <span className={styles.sectionNote}>cosine similarity · threshold {(thresholdPct).toFixed(0)}%</span>
          </div>

          {topMatchLabel && (
            <div className={styles.matchMeta}>
              <span className={styles.matchLabel}>Best match:</span>
              <span className={styles.matchName}>{topMatchLabel}</span>
            </div>
          )}

          <div className={styles.gateBarWrapper}>
            <div className={styles.gateBar}>
              <div
                className={`${styles.gateBarFill} ${aboveThreshold ? styles.fillAbove : styles.fillBelow}`}
                style={{ width: `${Math.min(simPct, 100).toFixed(2)}%` }}
              />
              <div className={styles.gateBarThreshold} style={{ left: `${thresholdPct}%` }} />
            </div>
            <div className={styles.gateBarLabels}>
              <span className={styles.gateBarScore} style={{ left: `${Math.min(simPct, 98).toFixed(2)}%` }}>
                {simPct.toFixed(1)}%
              </span>
              <span className={styles.gateBarThresholdLabel} style={{ left: `${thresholdPct}%` }}>
                {thresholdPct.toFixed(0)}% threshold
              </span>
            </div>
          </div>

          <div className={styles.gateResult}>
            {aboveThreshold ? (
              <span className={styles.gatePass}>✓ {simPct.toFixed(1)}% ≥ {thresholdPct.toFixed(0)}% — threshold passed</span>
            ) : (
              <span className={styles.gateFail}>✗ {simPct.toFixed(1)}% &lt; {thresholdPct.toFixed(0)}% — below threshold → GPT-4o</span>
            )}
          </div>
        </div>

        {/* Section 3: Field comparison (only when threshold was met) */}
        {aboveThreshold && fieldComparison.length > 0 && (
          <>
            <div className={styles.divider} />
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Field Checks</span>
                <span className={styles.sectionNote}>compared against best-matching stored case</span>
              </div>

              <table className={styles.fieldTable}>
                <thead>
                  <tr>
                    <th className={styles.thField}>Field</th>
                    <th className={styles.thVal}>Query</th>
                    <th className={styles.thVal}>Stored</th>
                    <th className={styles.thResult}></th>
                  </tr>
                </thead>
                <tbody>
                  {fieldComparison.map((f) => (
                    <tr key={f.field} className={f.matched ? styles.rowMatch : styles.rowMismatch}>
                      <td className={styles.tdField}>{f.label}</td>
                      <td className={styles.tdVal}>{formatVal(f.field, f.query_val)}</td>
                      <td className={styles.tdVal}>{formatVal(f.field, f.stored_val)}</td>
                      <td className={styles.tdResult}>
                        {f.matched
                          ? <span className={styles.matchCheck}>✓</span>
                          : <span className={styles.mismatchX}>✗ → GPT-4o</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={styles.fieldResult}>
                {isExact
                  ? <span className={styles.gatePass}>✓ All fields matched — LLM bypassed</span>
                  : <span className={styles.gateFail}>✗ Field mismatch — routed to GPT-4o synthesis</span>
                }
              </div>
            </div>
          </>
        )}

      </div>
    </details>
  );
}
