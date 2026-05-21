'use client';
import { useState } from 'react';
import type { AnalysisProfile } from '@/lib/projects/docwow/types';
import { getTemplateDefaults } from '@/lib/projects/docwow/skillFile';
import styles from './ProfileSetup.module.css';

const TEMPLATES: Array<{ key: AnalysisProfile['template']; label: string; desc: string }> = [
  { key: 'patient', label: 'Patient', desc: 'Plain language, focus on diagnoses, medications, and next steps' },
  { key: 'provider', label: 'Healthcare Provider', desc: 'Clinical detail, ICD codes, procedures, relevant history' },
  { key: 'reviewer', label: 'Insurance Reviewer', desc: 'Coverage determinations, denial reasons, appeal grounds' },
  { key: 'custom', label: 'Custom', desc: 'Define your own role and goal' },
];

interface Props {
  onConfirm: (profile: AnalysisProfile) => void;
  onCancel: () => void;
}

export default function ProfileSetup({ onConfirm, onCancel }: Props) {
  const [template, setTemplate] = useState<AnalysisProfile['template']>('patient');
  const defaults = getTemplateDefaults(template);
  const [role, setRole] = useState(defaults.role);
  const [goal, setGoal] = useState(defaults.goal);

  const selectTemplate = (t: AnalysisProfile['template']) => {
    setTemplate(t);
    const d = getTemplateDefaults(t);
    setRole(d.role);
    setGoal(d.goal);
  };

  const confirm = () => {
    if (!role.trim() || !goal.trim()) return;
    onConfirm({ template, role: role.trim(), goal: goal.trim() });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Choose your analysis profile</h2>
        <p className={styles.subtitle}>This shapes how Claude interprets the document.</p>
        <div className={styles.templates}>
          {TEMPLATES.map((t) => (
            <button key={t.key} className={`${styles.templateCard} ${template === t.key ? styles.selected : ''}`} onClick={() => selectTemplate(t.key)}>
              <span className={styles.templateLabel}>{t.label}</span>
              <span className={styles.templateDesc}>{t.desc}</span>
            </button>
          ))}
        </div>
        <div className={styles.fields}>
          <label className={styles.label}>Your role</label>
          <input className={styles.input} value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. patient reviewing my own records" />
          <label className={styles.label}>Your goal</label>
          <textarea className={styles.textarea} value={goal} onChange={(e) => setGoal(e.target.value)} rows={3} placeholder="e.g. Understand my diagnosis and next steps" />
        </div>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.confirmBtn} onClick={confirm} disabled={!role.trim() || !goal.trim()}>Start analysis</button>
        </div>
      </div>
    </div>
  );
}
