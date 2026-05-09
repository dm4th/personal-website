'use client';

import { useState } from 'react';
import styles from './AgentAnalysisDropdown.module.css';

export type PipelineStep = {
  icon: string;
  label: string;
  detail?: string;
  items?: string[];
  variant?: 'default' | 'green' | 'amber' | 'red' | 'blue';
  /** Render a thin divider above this step to separate sections */
  divider?: boolean;
};

type Props = {
  steps?: PipelineStep[];
  children?: React.ReactNode;
  /** Button label. Default: "Additional Detail" */
  label?: string;
  /** Button icon emoji. Default: "🔍" */
  icon?: string;
  /** Start expanded. Default: false */
  defaultOpen?: boolean;
};

export default function AgentAnalysisDropdown({
  steps,
  children,
  label = 'Additional Detail',
  icon = '🔍',
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.wrapper}>
      <button className={styles.toggle} onClick={() => setOpen((v) => !v)}>
        <span className={styles.toggleIcon}>{icon}</span>
        <span className={styles.toggleLabel}>{label}</span>
        <span className={styles.chevron}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className={styles.body}>
          {steps && steps.map((step, i) => (
            <div key={i}>
              {step.divider && <hr className={styles.divider} />}
              <div className={styles.step}>
                <span className={`${styles.icon} ${step.variant ? styles[`icon_${step.variant}`] : ''}`}>
                  {step.icon}
                </span>
                <div className={styles.content}>
                  <p className={`${styles.label} ${step.variant ? styles[`label_${step.variant}`] : ''}`}>
                    {step.label}
                  </p>
                  {step.detail && (
                    <p className={styles.detail}>{step.detail}</p>
                  )}
                  {step.items && step.items.length > 0 && (
                    <ul className={styles.items}>
                      {step.items.map((item, j) => (
                        <li key={j} className={styles.item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
          {children}
        </div>
      )}
    </div>
  );
}
