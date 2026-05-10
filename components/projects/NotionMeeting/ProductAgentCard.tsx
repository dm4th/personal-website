import styles from './AgentCard.module.css';
import RiskBadge from './RiskBadge';
import AgentAnalysisDropdown from './AgentAnalysisDropdown';
import type { PipelineStep } from './AgentAnalysisDropdown';
import type { ProductAnalysis } from '@/lib/projects/notion-meeting-intelligence/types';

type Props = { analysis: ProductAnalysis; noHeader?: boolean };

export default function ProductAgentCard({ analysis, noHeader }: Props) {
  /** Single merged "Additional Detail" dropdown */
  const detailSteps: PipelineStep[] = [
    ...(analysis.resonated_features.length > 0 ? [{
      icon: '✨',
      label: `Resonating features (${analysis.resonated_features.length})`,
      items: analysis.resonated_features,
      variant: 'green' as const,
    }] : []),
    ...(analysis.weak_features.length > 0 ? [{
      icon: '△',
      label: `Weak or unclear features (${analysis.weak_features.length})`,
      items: analysis.weak_features,
      variant: 'amber' as const,
    }] : []),
    ...(analysis.competitive_gaps.length > 0 ? [{
      icon: '🏆',
      label: `Competitive gaps (${analysis.competitive_gaps.length})`,
      items: analysis.competitive_gaps,
      variant: 'red' as const,
    }] : []),
    {
      icon: '💡',
      label: 'Product team insight',
      detail: analysis.product_team_insight,
      variant: 'blue' as const,
    },
    { icon: '✓', label: 'Categorized features as resonating, weak, or unclear from transcript', variant: 'green' as const, divider: true },
    { icon: '✓', label: 'Mapped competitive gaps from prospect comparisons and objections', variant: 'green' as const },
    { icon: '✓', label: 'Extracted voice-of-customer quotes for product team', variant: 'green' as const },
    { icon: '✓', label: 'Assessed agentic AI opportunity signals from prospect language', variant: 'green' as const },
    { icon: '✓', label: 'Classified feedback priority for product team routing', variant: 'green' as const },
  ];

  return (
    <div className={styles.card}>
      {!noHeader && (
        <div className={styles.header}>
          <span className={styles.emoji}>🧪</span>
          <div>
            <p className={styles.title}>Product Feedback</p>
            <p className={styles.subtitle}>Voice of customer for the product team</p>
          </div>
        </div>
      )}

      {/* Count grid: aha moments, competitive gaps, weak features */}
      <div className={styles.countGrid}>
        <div className={styles.countItem}>
          <span className={styles.countIcon}>✨</span>
          <span className={styles.countNum}>{analysis.resonated_features.length}</span>
          <span className={styles.countLabel}>Aha Moments</span>
        </div>
        <div className={styles.countItem}>
          <span className={styles.countIcon} style={{ color: '#f59e0b' }}>⚠</span>
          <span className={styles.countNum}>{analysis.competitive_gaps.length}</span>
          <span className={styles.countLabel}>Competitive Gaps</span>
        </div>
        <div className={styles.countItem}>
          <span className={styles.countIcon} style={{ color: '#ef4444' }}>↓</span>
          <span className={styles.countNum}>{analysis.weak_features.length}</span>
          <span className={styles.countLabel}>Weak or Unclear</span>
        </div>
      </div>

      {/* Feedback priority */}
      <div className={styles.section}>
        <div className={styles.propRow}>
          <span className={styles.propLabel}>Feedback priority</span>
          <RiskBadge value={analysis.feedback_priority + ' priority'} />
        </div>
      </div>

      {/* Notable quotes — blockquote sidebar, kept in main body per user feedback */}
      {analysis.notable_quotes.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Notable Quotes</p>
          <div className={styles.list}>
            {analysis.notable_quotes.map((q, i) => (
              <blockquote key={i} className={styles.quote}>{q}</blockquote>
            ))}
          </div>
        </div>
      )}

      {/* Single merged dropdown: feature lists + insight + methodology */}
      <AgentAnalysisDropdown steps={detailSteps} label="Additional Detail" icon="🔍" />
    </div>
  );
}
