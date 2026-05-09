import styles from './AgentCard.module.css';
import TierBadge from './TierBadge';
import RiskBadge from './RiskBadge';
import AgentAnalysisDropdown from './AgentAnalysisDropdown';
import type { PipelineStep } from './AgentAnalysisDropdown';
import type { CommercialAnalysis } from '@/lib/projects/notion-meeting-intelligence/types';

type Props = { analysis: CommercialAnalysis; noHeader?: boolean };

export default function CommercialAgentCard({ analysis, noHeader }: Props) {
  /** Single merged "Additional Detail" dropdown */
  const detailSteps: PipelineStep[] = [
    {
      icon: '💰',
      label: `${analysis.budget_signals.length} budget signal${analysis.budget_signals.length !== 1 ? 's' : ''} detected`,
      items: analysis.budget_signals,
    },
    {
      icon: analysis.price_sensitivity === 'Low' ? '✓' : analysis.price_sensitivity === 'Medium' ? '△' : '✗',
      label: `Price sensitivity: ${analysis.price_sensitivity}`,
      detail:
        analysis.price_sensitivity === 'Low'
          ? 'Prospect showed minimal resistance to pricing. Full-rate proposal appropriate.'
          : analysis.price_sensitivity === 'Medium'
          ? 'Some price anchoring or hesitation detected. Prepare a value-focused response.'
          : 'Strong price resistance. Lead with ROI framing before presenting numbers.',
      variant: analysis.price_sensitivity === 'Low' ? 'green' : analysis.price_sensitivity === 'Medium' ? 'amber' : 'red',
    },
    {
      icon: '📄',
      label: `Contract complexity: ${analysis.contract_complexity}`,
      detail:
        analysis.contract_complexity === 'Enterprise MSA Required'
          ? 'Legal, security, or procurement review likely required. Engage RevOps early and plan for a 45–90 day close.'
          : analysis.contract_complexity === 'Custom'
          ? 'Non-standard terms referenced. Loop in deal desk before quoting.'
          : 'Standard subscription agreement should apply. No unusual procurement barriers identified.',
      variant: analysis.contract_complexity === 'Standard' ? 'green' : 'amber',
    },
    { icon: '✓', label: 'Scanned for explicit, implicit, and absent budget signals', variant: 'green', divider: true },
    { icon: '✓', label: 'Applied deal tier matrix (Strategic / Growth / SMB / Unqualified)', variant: 'green' },
    { icon: '✓', label: 'Assessed price sensitivity from prospect tone and budget language', variant: 'green' },
    { icon: '✓', label: 'Evaluated contract complexity and procurement signals', variant: 'green' },
    { icon: '✓', label: 'Generated negotiation strategy and recommended pricing approach', variant: 'green' },
  ];

  return (
    <div className={styles.card}>
      {!noHeader && (
        <div className={styles.header}>
          <span className={styles.emoji}>💰</span>
          <div>
            <p className={styles.title}>Commercial Pricing</p>
            <p className={styles.subtitle}>Deal value and negotiation strategy</p>
          </div>
        </div>
      )}

      {/* Deal tier + ACV — both right-aligned in the same section */}
      <div className={styles.section}>
        <div className={styles.dealTierRow}>
          <span className={styles.dealTierLabel}>Deal Tier</span>
          <TierBadge value={analysis.deal_tier} />
        </div>
        <div className={styles.dealTierRow}>
          <span className={styles.dealTierLabel}>Estimated ACV</span>
          <span className={styles.acvValue}>{analysis.estimated_acv_range}</span>
        </div>
      </div>

      {/* Pricing risk + recommended approach as inline icon steps */}
      <div className={styles.iconSteps}>
        <div className={styles.iconStep}>
          <span className={`${styles.iconStepIcon} ${styles.iconStepIcon_amber}`}>⚠</span>
          <div className={styles.iconStepContent}>
            <span className={styles.iconStepLabel}>Pricing Risk</span>
            <p className={`${styles.iconStepDetail} ${styles.iconStepDetail_amber}`}>{analysis.pricing_risk}</p>
          </div>
        </div>
        <div className={styles.iconStep}>
          <span className={`${styles.iconStepIcon} ${styles.iconStepIcon_blue}`}>💡</span>
          <div className={styles.iconStepContent}>
            <span className={styles.iconStepLabel}>Recommended Approach</span>
            <p className={`${styles.iconStepDetail} ${styles.iconStepDetail_blue}`}>{analysis.recommended_approach}</p>
          </div>
        </div>
      </div>

      {/* Single merged dropdown: budget signals + sensitivity/contract context + methodology */}
      <AgentAnalysisDropdown steps={detailSteps} label="Additional Detail" icon="🔍" />
    </div>
  );
}
