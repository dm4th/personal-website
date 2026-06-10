import type { FredKpis } from '@/app/(marketing)/fintechco/demos/fred-dashboard/page';
import styles from './FredKpiCards.module.css';

type Props = { kpis: FredKpis };

export default function FredKpiCards({ kpis }: Props) {
  const cards = [
    {
      label: 'Current Delinquency Rate',
      value: `${kpis.current_delinquency_rate.toFixed(2)}%`,
      note: kpis.delinquency_trend === 'rising' ? 'Trending up as of Q4 2024' : 'Stable as of Q4 2024',
      highlight: kpis.delinquency_trend === 'rising',
    },
    {
      label: 'Rate Cycle Lead Time',
      value: `${kpis.fedfunds_peak_lead_quarters}Q`,
      note: `Fed Funds Rate leads delinquency by ${kpis.fedfunds_peak_lead_quarters} quarters`,
      highlight: false,
    },
    {
      label: 'Rate-Cycle Correlation',
      value: `r = ${kpis.fedfunds_peak_correlation.toFixed(2)}`,
      note: 'Peak correlation at 8-quarter lag',
      highlight: false,
    },
    {
      label: 'Model Fit (R²)',
      value: `${Math.round(kpis.model_r_squared * 100)}%`,
      note: 'OLS regression, 2000–2024',
      highlight: false,
    },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <div key={card.label} className={`${styles.card} ${card.highlight ? styles.cardAlert : ''}`}>
          <span className={styles.value}>{card.value}</span>
          <span className={styles.label}>{card.label}</span>
          <span className={styles.note}>{card.note}</span>
        </div>
      ))}
    </div>
  );
}
