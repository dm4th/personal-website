'use client';

import { useState } from 'react';
import styles from './AgentResultsTabs.module.css';
import SalesAgentCard from './SalesAgentCard';
import CommercialAgentCard from './CommercialAgentCard';
import DeliveryAgentCard from './DeliveryAgentCard';
import ProductAgentCard from './ProductAgentCard';
import ICPAgentCard from './ICPAgentCard';
import SummaryAgentCard from './SummaryAgentCard';
import TierBadge from './TierBadge';
import RiskBadge from './RiskBadge';
import ParallelPipelineSteps from './ParallelPipelineSteps';
import { salesScoreColor } from './SalesAgentCard';
import { complexityColor } from './DeliveryAgentCard';
import type { AgentResults, MeetingDemoState } from '@/lib/projects/notion-meeting-intelligence/types';

type Props = {
  state: MeetingDemoState;
};

function IdleState() {
  return (
    <div className={styles.idle}>
      <span className={styles.idleIcon}>📋</span>
      <p className={styles.idleText}>
        Select a sample transcript or paste your own, then click{' '}
        <strong>Run 5 Agents</strong> to see the analysis.
      </p>
      <p className={styles.idleHint}>Each agent analyzes in parallel — results appear in seconds.</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className={styles.error}>
      <span className={styles.errorIcon}>⚠️</span>
      <p className={styles.errorText}>{message}</p>
    </div>
  );
}

type AgentRowConfig = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  badge: React.ReactNode;
  card: React.ReactNode;
};

function deliveryComplexityLabel(score: number): string {
  if (score <= 2) return 'Standard';
  if (score <= 4) return 'Low-moderate';
  if (score <= 6) return 'Moderate complexity';
  if (score <= 8) return 'High complexity';
  return 'Very complex';
}

function buildRows(results: AgentResults): AgentRowConfig[] {
  const { summary, sales, commercial, delivery, product, icp } = results;

  const verdictColor: Record<string, string> = {
    'Strong Opportunity': '#22c55e',
    'Qualified Pipeline': '#3b82f6',
    'Needs Qualification': '#f59e0b',
    'Pass': '#ef4444',
  };
  const vc = verdictColor[summary.deal_verdict] ?? '#6b7280';

  const deliveryColor = complexityColor(delivery.complexity_score);

  return [
    {
      id: 'summary',
      emoji: '📋',
      title: 'Executive Summary',
      subtitle: summary.deal_verdict,
      badge: (
        <span
          className={styles.verdictBadge}
          style={{
            color: vc,
            borderColor: `color-mix(in srgb, ${vc} 30%, transparent)`,
            background: `color-mix(in srgb, ${vc} 10%, transparent)`,
          }}
        >
          {summary.deal_verdict}
        </span>
      ),
      card: <SummaryAgentCard analysis={summary} noHeader />,
    },
    {
      id: 'sales',
      emoji: '⚡',
      title: 'Sales Coach',
      // Subtitle: secondary metrics (what kind of performance)
      subtitle: `${sales.talk_time_balance} · ${sales.objection_handling} objection handling`,
      // Badge: the primary score — labeled so "9/10" reads as "Rep score 9/10"
      badge: (
        <span style={{ fontSize: 11, fontWeight: 600, color: salesScoreColor(sales.overall_score) }}>
          Rep score {sales.overall_score}/10
        </span>
      ),
      card: <SalesAgentCard analysis={sales} noHeader />,
    },
    {
      id: 'commercial',
      emoji: '💰',
      title: 'Commercial Pricing',
      // Subtitle: just the ACV — tier is in the badge
      subtitle: `Est. ACV ${commercial.estimated_acv_range}`,
      badge: <TierBadge value={commercial.deal_tier} />,
      card: <CommercialAgentCard analysis={commercial} noHeader />,
    },
    {
      id: 'delivery',
      emoji: '🔧',
      title: 'Delivery & Solutioning',
      // Subtitle: risk + complexity label
      subtitle: `${delivery.delivery_risk} risk · ${deliveryComplexityLabel(delivery.complexity_score)}`,
      // Badge: complexity score colored (reverse — lower = greener)
      badge: (
        <span style={{ fontSize: 11, fontWeight: 600, color: deliveryColor }}>
          Complexity {delivery.complexity_score}/10
        </span>
      ),
      card: <DeliveryAgentCard analysis={delivery} noHeader />,
    },
    {
      id: 'product',
      emoji: '🧪',
      title: 'Product Feedback',
      // Subtitle: aha moment count
      subtitle: `${product.resonated_features.length} aha moment${product.resonated_features.length !== 1 ? 's' : ''}`,
      // Badge: priority colored green/amber/red (inverted — High = important = green)
      badge: <RiskBadge value={product.feedback_priority + ' priority'} />,
      card: <ProductAgentCard analysis={product} noHeader />,
    },
    {
      id: 'icp',
      emoji: '🎯',
      title: 'ICP Fit',
      // Subtitle: the score
      subtitle: `ICP score: ${icp.overall_icp_score.toFixed(1)}/5`,
      // Badge: tier only (Tier 1 🟢 etc.)
      badge: <TierBadge value={icp.icp_tier} />,
      card: <ICPAgentCard analysis={icp} noHeader />,
    },
  ];
}

function AgentAccordion({ rows }: { rows: AgentRowConfig[] }) {
  const [open, setOpen] = useState<Set<string>>(new Set(['summary']));

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className={styles.accordion}>
      {rows.map((row) => {
        const isOpen = open.has(row.id);
        return (
          <div key={row.id} className={`${styles.agentRow} ${isOpen ? styles.agentRowOpen : ''}`}>
            <button className={styles.agentHeader} onClick={() => toggle(row.id)}>
              <span className={styles.agentEmoji}>{row.emoji}</span>
              <div className={styles.agentMeta}>
                <span className={styles.agentTitle}>{row.title}</span>
                <span className={styles.agentSubtitle}>{row.subtitle}</span>
              </div>
              <div className={styles.agentBadge}>{row.badge}</div>
              <span className={styles.chevron}>{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div className={styles.agentBody}>
                {row.card}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AgentResultsTabs({ state }: Props) {
  return (
    <div className={styles.container}>
      {state.status === 'idle' && <IdleState />}
      {state.status === 'loading' && <ParallelPipelineSteps />}
      {state.status === 'error' && <ErrorState message={state.message} />}
      {state.status === 'success' && (
        <AgentAccordion rows={buildRows(state.results)} />
      )}
    </div>
  );
}
