import styles from './AgentCard.module.css';
import RiskBadge from './RiskBadge';
import AgentAnalysisDropdown from './AgentAnalysisDropdown';
import type { PipelineStep } from './AgentAnalysisDropdown';
import type { SalesAnalysis } from '@/lib/projects/notion-meeting-intelligence/types';

type Props = { analysis: SalesAnalysis; noHeader?: boolean };

export function salesScoreColor(score: number): string {
  if (score <= 2) return '#ef4444';
  if (score <= 4) return '#f97316';
  if (score <= 6) return '#f59e0b';
  if (score <= 8) return '#3b82f6';
  return '#22c55e';
}

export default function SalesAgentCard({ analysis, noHeader }: Props) {
  const color = salesScoreColor(analysis.overall_score);

  const scoreLabel =
    analysis.overall_score >= 9 ? 'Exceptional call'
    : analysis.overall_score >= 7 ? 'Solid performance'
    : analysis.overall_score >= 5 ? 'Average execution'
    : analysis.overall_score >= 3 ? 'Below average'
    : 'Poor execution';

  /** Single merged "Additional Detail" dropdown — findings first, methodology at the end */
  const detailSteps: PipelineStep[] = [
    {
      icon: '💪',
      label: `${analysis.strengths.length} coaching strength${analysis.strengths.length !== 1 ? 's' : ''} identified`,
      items: analysis.strengths,
      variant: 'green',
    },
    {
      icon: '△',
      label: `${analysis.improvement_areas.length} improvement area${analysis.improvement_areas.length !== 1 ? 's' : ''} flagged`,
      items: analysis.improvement_areas,
      variant: 'amber',
    },
    { icon: '✓', label: 'Applied BANT sales evaluation framework to transcript', variant: 'green', divider: true },
    { icon: '✓', label: 'Measured rep talk-time ratio (target: 80/20 prospect dominance)', variant: 'green' },
    { icon: '✓', label: 'Scored objection handling using Acknowledge-Validate-Reframe method', variant: 'green' },
    { icon: '✓', label: 'Applied 10-point performance rubric across 6 coaching dimensions', variant: 'green' },
    { icon: '✓', label: 'Extracted best moment and primary coaching opportunity', variant: 'green' },
  ];

  return (
    <div className={styles.card}>
      {!noHeader && (
        <div className={styles.header}>
          <span className={styles.emoji}>⚡</span>
          <div>
            <p className={styles.title}>Sales Coaching</p>
            <p className={styles.subtitle}>Rep performance feedback</p>
          </div>
        </div>
      )}

      {/* Primary metric: performance score bar */}
      <div className={styles.metricBar}>
        <div className={styles.metricBarHeader}>
          <span className={styles.metricBarLabel}>Rep Performance Score</span>
          <span className={styles.metricBarValue}>
            {analysis.overall_score}
            <span className={styles.metricBarDenom}>/10</span>
          </span>
        </div>
        <div className={styles.metricBarTrack}>
          <div
            className={styles.metricBarFill}
            style={{ width: `${analysis.overall_score * 10}%`, background: color }}
          />
        </div>
        <p className={styles.metricBarCaption}>{scoreLabel}</p>
      </div>

      {/* Secondary metrics */}
      <div className={styles.section}>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Talk time balance</span>
          <RiskBadge value={analysis.talk_time_balance} />
        </div>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Objection handling</span>
          <RiskBadge value={analysis.objection_handling} />
        </div>
      </div>

      {/* Best moment + coaching tip as inline icon steps */}
      <div className={styles.iconSteps}>
        <div className={styles.iconStep}>
          <span className={`${styles.iconStepIcon} ${styles.iconStepIcon_green}`}>🏆</span>
          <div className={styles.iconStepContent}>
            <span className={styles.iconStepLabel}>Best Moment</span>
            <p className={styles.iconStepDetail}>{analysis.best_moment}</p>
          </div>
        </div>
        <div className={styles.iconStep}>
          <span className={`${styles.iconStepIcon} ${styles.iconStepIcon_blue}`}>💡</span>
          <div className={styles.iconStepContent}>
            <span className={styles.iconStepLabel}>Coaching Tip</span>
            <p className={`${styles.iconStepDetail} ${styles.iconStepDetail_blue}`}>{analysis.coaching_tip}</p>
          </div>
        </div>
      </div>

      {/* Single merged dropdown: strengths/improvement areas + methodology */}
      <AgentAnalysisDropdown steps={detailSteps} label="Additional Detail" icon="🔍" />
    </div>
  );
}
