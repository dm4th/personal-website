import styles from './TierBadge.module.css';

type Props = {
  value: string;
};

const TIER_COLORS: Record<string, string> = {
  'Tier 1 🟢': '#22c55e',
  'Strategic': '#22c55e',
  'Growth': '#3b82f6',
  'Tier 2 🟡': '#f59e0b',
  'SMB': '#f59e0b',
  'Standard coverage': '#f59e0b',
  'Tier 3 🔴': '#ef4444',
  'Unqualified': '#ef4444',
  'Light touch': '#ef4444',
  'Full engagement': '#22c55e',
  'Standard': '#6b7280',
  'Custom': '#f59e0b',
  'Enterprise MSA Required': '#ef4444',
};

export default function TierBadge({ value }: Props) {
  const color = TIER_COLORS[value] ?? '#6b7280';
  return (
    <span
      className={styles.badge}
      style={{ '--tier-color': color } as React.CSSProperties}
    >
      {value}
    </span>
  );
}
