import styles from './SummaryAgentCard.module.css';
import AgentAnalysisDropdown from './AgentAnalysisDropdown';
import type { PipelineStep } from './AgentAnalysisDropdown';
import type { SummaryAnalysis } from '@/lib/projects/notion-meeting-intelligence/types';

const VERDICT_COLORS: Record<SummaryAnalysis['deal_verdict'], string> = {
  'Strong Opportunity': '#22c55e',
  'Qualified Pipeline': '#3b82f6',
  'Needs Qualification': '#f59e0b',
  'Pass': '#ef4444',
};

type Props = {
  analysis: SummaryAnalysis;
  noHeader?: boolean;
};

export default function SummaryAgentCard({ analysis, noHeader }: Props) {
  const verdictColor = VERDICT_COLORS[analysis.deal_verdict];

  const verdictVariant: 'green' | 'amber' | 'red' =
    analysis.deal_verdict === 'Strong Opportunity' ? 'green'
    : analysis.deal_verdict === 'Qualified Pipeline' ? 'amber'
    : 'red';

  const pipelineSteps: PipelineStep[] = [
    { icon: '✓', label: '5 specialist agent analyses synthesized', variant: 'green' },
    { icon: '✓', label: `Deal verdict issued: ${analysis.deal_verdict}`, variant: verdictVariant },
    { icon: '📋', label: `${analysis.top_signals.length} top signals extracted`, items: analysis.top_signals },
    ...(analysis.buyer_roles_present.length > 0 ? [{
      icon: '👥',
      label: `${analysis.buyer_roles_present.length} buyer role${analysis.buyer_roles_present.length !== 1 ? 's' : ''} identified`,
      items: analysis.buyer_roles_present,
    }] : []),
    { icon: '💡', label: 'Recommended next action', detail: analysis.recommended_next_action, variant: 'blue' as const },
  ];

  return (
    <div className={styles.card}>
      {!noHeader && (
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.icon}>📋</span>
            <div>
              <p className={styles.label}>Executive Summary</p>
              <p className={styles.summary}>{analysis.executive_summary}</p>
            </div>
          </div>
          <div className={styles.verdict} style={{ color: verdictColor, borderColor: `color-mix(in srgb, ${verdictColor} 30%, transparent)`, background: `color-mix(in srgb, ${verdictColor} 10%, transparent)` }}>
            {analysis.deal_verdict}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Top Signals</p>
        <ul className={styles.signalList}>
          {analysis.top_signals.map((signal, i) => (
            <li key={i} className={styles.signalItem}>
              <span className={styles.signalDot} />
              {signal}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.nextAction}>
        <p className={styles.nextActionLabel}>Recommended Next Action</p>
        <p className={styles.nextActionText}>{analysis.recommended_next_action}</p>
      </div>

      <AgentAnalysisDropdown steps={pipelineSteps} label="Analysis Pipeline" icon="📊" />
    </div>
  );
}
