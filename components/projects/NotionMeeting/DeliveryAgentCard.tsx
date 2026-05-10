import styles from './AgentCard.module.css';
import RiskBadge from './RiskBadge';
import AgentAnalysisDropdown from './AgentAnalysisDropdown';
import type { PipelineStep } from './AgentAnalysisDropdown';
import type { DeliveryAnalysis } from '@/lib/projects/notion-meeting-intelligence/types';

type Props = { analysis: DeliveryAnalysis; noHeader?: boolean };

/** Reverse coloring: lower complexity = greener */
export function complexityColor(score: number): string {
  if (score <= 2) return '#22c55e';
  if (score <= 4) return '#3b82f6';
  if (score <= 6) return '#f59e0b';
  if (score <= 8) return '#f97316';
  return '#ef4444';
}

export default function DeliveryAgentCard({ analysis, noHeader }: Props) {
  const color = complexityColor(analysis.complexity_score);

  const complexityLabel =
    analysis.complexity_score <= 2 ? 'Standard deployment'
    : analysis.complexity_score <= 4 ? 'Low-moderate complexity'
    : analysis.complexity_score <= 6 ? 'Moderate complexity'
    : analysis.complexity_score <= 8 ? 'High complexity'
    : 'Very complex — SE escalation likely';

  /** Single merged "Additional Detail" dropdown */
  const detailSteps: PipelineStep[] = [
    {
      icon: '📋',
      label: `${analysis.technical_requirements.length} technical requirement${analysis.technical_requirements.length !== 1 ? 's' : ''} documented`,
      items: analysis.technical_requirements,
    },
    ...(analysis.integration_needs.length > 0 ? [{
      icon: '🔌',
      label: `${analysis.integration_needs.length} integration need${analysis.integration_needs.length !== 1 ? 's' : ''} identified`,
      items: analysis.integration_needs,
      variant: 'amber' as const,
    }] : []),
    ...(analysis.custom_requirements.length > 0 ? [{
      icon: '🔧',
      label: `${analysis.custom_requirements.length} custom requirement${analysis.custom_requirements.length !== 1 ? 's' : ''} flagged`,
      items: analysis.custom_requirements,
      variant: 'amber' as const,
    }] : []),
    { icon: '✓', label: 'Catalogued in-scope, out-of-scope, and unclear technical requirements', variant: 'green' as const, divider: true },
    { icon: '✓', label: 'Identified deployment model preference and infrastructure constraints', variant: 'green' as const },
    { icon: '✓', label: 'Mapped integration and custom development needs from conversation', variant: 'green' as const },
    { icon: '✓', label: 'Scored delivery complexity on 10-point scale using scope and risk factors', variant: 'green' as const },
    { icon: '✓', label: 'Issued SE engagement and solutioning recommendation', variant: 'green' as const },
  ];

  return (
    <div className={styles.card}>
      {!noHeader && (
        <div className={styles.header}>
          <span className={styles.emoji}>🔧</span>
          <div>
            <p className={styles.title}>Delivery &amp; Solutioning</p>
            <p className={styles.subtitle}>Technical requirements and delivery risk</p>
          </div>
        </div>
      )}

      {/* Primary metric: complexity bar (reverse colored — lower is better) */}
      <div className={styles.metricBar}>
        <div className={styles.metricBarHeader}>
          <span className={styles.metricBarLabel}>Delivery Complexity Score</span>
          <span className={styles.metricBarValue}>
            {analysis.complexity_score}
            <span className={styles.metricBarDenom}>/10</span>
          </span>
        </div>
        <div className={styles.metricBarTrack}>
          <div
            className={styles.metricBarFill}
            style={{ width: `${analysis.complexity_score * 10}%`, background: color }}
          />
        </div>
        <p className={styles.metricBarCaption}>{complexityLabel} · lower is simpler</p>
      </div>

      {/* Secondary metrics: delivery risk + deployment model */}
      <div className={styles.section}>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Delivery risk</span>
          <RiskBadge value={analysis.delivery_risk} />
        </div>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Deployment model</span>
          <span className={styles.propValue}>{analysis.deployment_model}</span>
        </div>
      </div>

      {/* SE recommendation as inline icon step */}
      <div className={styles.iconSteps}>
        <div className={styles.iconStep}>
          <span className={`${styles.iconStepIcon} ${styles.iconStepIcon_blue}`}>💡</span>
          <div className={styles.iconStepContent}>
            <span className={styles.iconStepLabel}>SE Recommendation</span>
            <p className={`${styles.iconStepDetail} ${styles.iconStepDetail_blue}`}>{analysis.se_recommendation}</p>
          </div>
        </div>
      </div>

      {/* Single merged dropdown: requirements lists + methodology */}
      <AgentAnalysisDropdown steps={detailSteps} label="Additional Detail" icon="🔍" />
    </div>
  );
}
