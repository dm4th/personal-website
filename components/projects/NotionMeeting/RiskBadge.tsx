import styles from './RiskBadge.module.css';

type Props = {
  value: 'Low' | 'Medium' | 'High' | 'Strong' | 'Adequate' | 'Missed opportunities' | string;
};

const COLORS: Record<string, string> = {
  Low: '#22c55e',
  Strong: '#22c55e',
  'Good balance': '#22c55e',
  Medium: '#f59e0b',
  Adequate: '#f59e0b',
  'Too little rep talk': '#f59e0b',
  High: '#ef4444',
  'Missed opportunities': '#ef4444',
  'Too much rep talk': '#ef4444',
  // Feedback priority: inverted scale — High feedback priority = valuable signal (green)
  'High priority': '#22c55e',
  'Medium priority': '#f59e0b',
  'Low priority': '#ef4444',
};

export default function RiskBadge({ value }: Props) {
  const color = COLORS[value] ?? '#6b7280';
  return (
    <span
      className={styles.badge}
      style={{ '--risk-color': color } as React.CSSProperties}
    >
      {value}
    </span>
  );
}
