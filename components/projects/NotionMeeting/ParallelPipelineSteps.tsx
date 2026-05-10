import styles from './ParallelPipelineSteps.module.css';

const PARALLEL_AGENTS = [
  { emoji: '⚡', label: 'Sales Training', desc: 'Analyzing pitch quality and coaching signals...' },
  { emoji: '💰', label: 'Commercial Pricing', desc: 'Extracting deal tier and budget signals...' },
  { emoji: '🔧', label: 'Delivery', desc: 'Identifying technical requirements and risks...' },
  { emoji: '🧪', label: 'Product Feedback', desc: 'Capturing feature resonance and gaps...' },
  { emoji: '🎯', label: 'ICP Fit', desc: 'Scoring against Notion ICP dimensions...' },
];

export default function ParallelPipelineSteps() {
  return (
    <div className={styles.container}>
      <p className={styles.heading}>Running 5 agents in parallel...</p>
      <div className={styles.steps}>
        {PARALLEL_AGENTS.map((agent, i) => (
          <div
            key={agent.label}
            className={styles.step}
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <div className={styles.spinner} />
            <div className={styles.stepText}>
              <span className={styles.emoji}>{agent.emoji}</span>
              <span className={styles.label}>{agent.label}</span>
              <span className={styles.desc}>{agent.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerLabel}>then sequentially</span>
        <span className={styles.dividerLine} />
      </div>

      <div className={styles.step} style={{ animationDelay: '700ms' }}>
        <div className={styles.spinnerSummary} />
        <div className={styles.stepText}>
          <span className={styles.emoji}>📋</span>
          <span className={styles.labelSummary}>Meeting Summary</span>
          <span className={styles.desc}>Synthesizing executive summary and agent relevance scores...</span>
        </div>
      </div>
    </div>
  );
}
