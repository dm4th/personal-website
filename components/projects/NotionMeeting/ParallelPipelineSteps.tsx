import styles from './ParallelPipelineSteps.module.css';
import type { AgentName, AgentStatus } from '@/lib/projects/notion-meeting-intelligence/types';

const PARALLEL_AGENTS: { name: AgentName; emoji: string; label: string; desc: string }[] = [
  { name: 'sales',       emoji: '⚡', label: 'Sales Training',     desc: 'Analyzing pitch quality and coaching signals...' },
  { name: 'commercial',  emoji: '💰', label: 'Commercial Pricing', desc: 'Extracting deal tier and budget signals...' },
  { name: 'delivery',    emoji: '🔧', label: 'Delivery',           desc: 'Identifying technical requirements and risks...' },
  { name: 'product',     emoji: '🧪', label: 'Product Feedback',   desc: 'Capturing feature resonance and gaps...' },
  { name: 'icp',         emoji: '🎯', label: 'ICP Fit',            desc: 'Scoring against Notion ICP dimensions...' },
];

type Props = {
  agentStatuses?: Partial<Record<AgentName, AgentStatus>>;
};

function StepIndicator({ status, isSummary }: { status: AgentStatus; isSummary?: boolean }) {
  if (status === 'ready')   return <div className={styles.indicatorWrapper}><span className={styles.indicatorDone}>✓</span></div>;
  if (status === 'failed')  return <div className={styles.indicatorWrapper}><span className={styles.indicatorFailed}>✕</span></div>;
  if (status === 'pending') return <div className={styles.indicatorWrapper}><div className={styles.indicatorPending} /></div>;
  return <div className={isSummary ? styles.spinnerSummary : styles.spinner} />;
}

export default function ParallelPipelineSteps({ agentStatuses }: Props) {
  const summaryStatus = agentStatuses?.summary ?? 'pending';

  return (
    <div className={styles.container}>
      <p className={styles.heading}>Running 5 agents in parallel...</p>
      <div className={styles.steps}>
        {PARALLEL_AGENTS.map((agent, i) => {
          const status = agentStatuses?.[agent.name] ?? 'processing';
          return (
            <div key={agent.name} className={styles.step} style={{ animationDelay: `${i * 120}ms` }}>
              <StepIndicator status={status} />
              <div className={styles.stepText}>
                <span className={styles.emoji}>{agent.emoji}</span>
                <span className={styles.label}>{agent.label}</span>
                <span className={styles.desc}>{agent.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.divider} style={{ animationDelay: '650ms' }}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerLabel}>then sequentially</span>
        <span className={styles.dividerLine} />
      </div>

      <div className={styles.step} style={{ animationDelay: '700ms' }}>
        <StepIndicator status={summaryStatus} isSummary />
        <div className={styles.stepText}>
          <span className={styles.emoji}>📋</span>
          <span className={summaryStatus === 'processing' || summaryStatus === 'ready' ? styles.labelSummary : styles.label}>
            Meeting Summary
          </span>
          <span className={styles.desc}>Synthesizing executive summary and agent relevance scores...</span>
        </div>
      </div>
    </div>
  );
}
