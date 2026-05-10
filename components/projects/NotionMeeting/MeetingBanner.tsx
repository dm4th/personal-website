import styles from './MeetingBanner.module.css';

export default function MeetingBanner() {
  return (
    <div className={styles.banner}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <p className={styles.title}>AI-Native GTM Engine</p>
          <p className={styles.desc}>
            Paste a sales call transcript and watch six specialized Claude agents analyze it in
            parallel - each from a different stakeholder perspective. Results write directly to your
            Notion GTM Hub: one Meeting Note and six Agent Analysis rows, all linked.
          </p>
        </div>
        <div className={styles.agents}>
          {[
            { emoji: '📋', label: 'Summary' },
            { emoji: '⚡', label: 'Sales Coach' },
            { emoji: '💰', label: 'Pricing' },
            { emoji: '🔧', label: 'Delivery' },
            { emoji: '🧪', label: 'Product' },
            { emoji: '🎯', label: 'ICP Fit' },
          ].map((a) => (
            <div key={a.label} className={styles.agentChip}>
              <span>{a.emoji}</span>
              <span>{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
