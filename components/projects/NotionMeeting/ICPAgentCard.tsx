import styles from './AgentCard.module.css';
import TierBadge from './TierBadge';
import AgentAnalysisDropdown from './AgentAnalysisDropdown';
import type { PipelineStep } from './AgentAnalysisDropdown';
import type { ICPAnalysis } from '@/lib/projects/notion-meeting-intelligence/types';

type Props = { analysis: ICPAnalysis; noHeader?: boolean };

/** ICP score coloring out of 5, stepping every 1 point. */
export function icpScoreColor(score: number): string {
  if (score < 1.5) return '#ef4444';
  if (score < 2.5) return '#f97316';
  if (score < 3.5) return '#f59e0b';
  if (score < 4.5) return '#3b82f6';
  return '#22c55e';
}

export default function ICPAgentCard({ analysis, noHeader }: Props) {
  const color = icpScoreColor(analysis.overall_icp_score);
  const tierVariant = analysis.icp_tier.includes('🟢') ? 'green' : analysis.icp_tier.includes('🟡') ? 'amber' : 'red';

  const detailSteps: PipelineStep[] = [
    {
      icon: '💡',
      label: 'Fit summary',
      detail: analysis.fit_summary,
      variant: 'blue',
    },
    {
      icon: '✓',
      label: `Scored ${analysis.dimension_scores.length} ICP dimensions against weighted rubric`,
      variant: 'green',
      divider: true,
    },
    { icon: '✓', label: 'Applied disqualifying flag check across risk criteria', variant: 'green' },
    {
      icon: '✓',
      label: `Computed weighted average ICP score: ${analysis.overall_icp_score.toFixed(1)}/5.0`,
      variant: 'green',
    },
    { icon: '✓', label: 'Assigned ICP tier (Tier 1 ≥4.0 / Tier 2 ≥2.5 / Tier 3 <2.5)', variant: 'green' },
    {
      icon: '✓',
      label: `Issued engagement recommendation: ${analysis.recommendation}`,
      variant: tierVariant,
    },
  ];

  return (
    <div className={styles.card}>
      {!noHeader && (
        <div className={styles.header}>
          <span className={styles.emoji}>🎯</span>
          <div>
            <p className={styles.title}>ICP Fit Analyzer</p>
            <p className={styles.subtitle}>Scored against {analysis.dimension_scores.length} ICP dimensions</p>
          </div>
        </div>
      )}

      {/* Primary metric: ICP score bar out of 5 */}
      <div className={styles.metricBar}>
        <div className={styles.metricBarHeader}>
          <span className={styles.metricBarLabel}>ICP Fit Score</span>
          <span className={styles.metricBarValue}>
            {analysis.overall_icp_score.toFixed(1)}
            <span className={styles.metricBarDenom}>/5.0</span>
          </span>
        </div>
        <div className={styles.metricBarTrack}>
          <div
            className={styles.metricBarFill}
            style={{ width: `${(analysis.overall_icp_score / 5) * 100}%`, background: color }}
          />
        </div>
        <p className={styles.metricBarCaption} style={{ color }}>{analysis.icp_tier}</p>
      </div>

      {/* Tier + recommendation */}
      <div className={styles.section}>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>ICP tier</span>
          <TierBadge value={analysis.icp_tier} />
        </div>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Recommendation</span>
          <TierBadge value={analysis.recommendation} />
        </div>
      </div>

      {/* Disqualifying flags */}
      {analysis.disqualifying_flags.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Disqualifying Flags</p>
          <div className={styles.list}>
            {analysis.disqualifying_flags.map((f, i) => (
              <p key={i} className={styles.flagItem}>{f}</p>
            ))}
          </div>
        </div>
      )}

      {/* Dimension scores table — directly in card body */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Dimension Scores</p>
        <table className={styles.detailTable}>
          <thead>
            <tr>
              <th>Dimension</th>
              <th>Score</th>
              <th>Wt.</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            {analysis.dimension_scores.map((d, i) => (
              <tr key={i}>
                <td>{d.dimension}</td>
                <td className={styles.detailTableScore} style={{ color: icpScoreColor(d.score) }}>
                  {d.score}/5
                </td>
                <td className={styles.detailTableWeight}>{Math.round(d.weight * 100)}%</td>
                <td className={styles.detailTableEvidence}>{d.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dropdown: fit summary + methodology */}
      <AgentAnalysisDropdown steps={detailSteps} label="Additional Detail" icon="🔍" />
    </div>
  );
}
