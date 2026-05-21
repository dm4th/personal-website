import type { AnalysisProfile } from './types';

const TEMPLATE_DEFAULTS: Record<string, { role: string; goal: string }> = {
  patient: {
    role: 'patient reviewing my own medical records',
    goal: 'Understand my diagnosis, medications, treatment plan, and any follow-up actions I need to take',
  },
  provider: {
    role: 'healthcare provider reviewing a patient record',
    goal: 'Identify key clinical findings, diagnoses, medications, and relevant history',
  },
  reviewer: {
    role: 'insurance reviewer evaluating a claim',
    goal: 'Assess coverage determination, identify denial reasons, and evaluate appeal grounds',
  },
  custom: {
    role: '',
    goal: '',
  },
};

export function getTemplateDefaults(template: AnalysisProfile['template']) {
  return TEMPLATE_DEFAULTS[template] ?? TEMPLATE_DEFAULTS.custom;
}
