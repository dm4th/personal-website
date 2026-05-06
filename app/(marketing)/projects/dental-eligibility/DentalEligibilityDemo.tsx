'use client';

import { useState } from 'react';
import styles from './DentalEligibilityDemo.module.css';
import TldrBanner from '@/components/projects/DentalEligibility/TldrBanner';
import CaseLibrary from '@/components/projects/DentalEligibility/CaseLibrary';
import InputForm from '@/components/projects/DentalEligibility/InputForm';
import ResultsCard from '@/components/projects/DentalEligibility/ResultsCard';
import type {
  CaseInput,
  DemoState,
  EligibilityCase,
  EligibilityResponse,
  SessionCase,
} from '@/lib/projects/dental-eligibility/types';

type DisplayCase = Omit<EligibilityCase, 'embedding'> | Omit<SessionCase, 'embedding'>;

const DEFAULT_FORM: CaseInput = {
  procedure_code: '',
  procedure_description: '',
  payer: '',
  patient_age: 0,
  coverage_text: '',
  plan_year_remaining: 1500,
  deductible_met: false,
  last_appointment_date: null,
};

type Props = {
  baseCases: Omit<EligibilityCase, 'embedding'>[];
};

export default function DentalEligibilityDemo({ baseCases }: Props) {
  const [formValues, setFormValues] = useState<CaseInput>(DEFAULT_FORM);
  const [demoState, setDemoState] = useState<DemoState>({ status: 'idle' });
  const [sessionCases, setSessionCases] = useState<SessionCase[]>([]);
  const [approvalState, setApprovalState] = useState<'pending' | 'approved'>('pending');
  const [lastResult, setLastResult] = useState<EligibilityResponse | null>(null);
  const [lastInput, setLastInput] = useState<CaseInput | null>(null);

  const sessionCasesDisplay = sessionCases.map(({ embedding: _e, ...rest }) => rest);

  const handleUseAsInput = (c: DisplayCase) => {
    setFormValues({ ...c.input });
    setDemoState({ status: 'idle' });
    setApprovalState('pending');
  };

  const handleSubmit = async () => {
    if (!formValues.procedure_code || !formValues.coverage_text || !formValues.payer) return;

    setDemoState({ status: 'loading' });
    setApprovalState('pending');
    setLastInput(formValues);

    try {
      const res = await fetch('/api/projects/dental-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formValues,
          session_cases: sessionCases,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDemoState({ status: 'error', message: data.error ?? 'Something went wrong. Please try again.' });
        return;
      }

      setLastResult(data as EligibilityResponse);
      setDemoState({ status: 'success', result: data as EligibilityResponse });
    } catch {
      setDemoState({ status: 'error', message: 'Network error. Please check your connection and try again.' });
    }
  };

  const handleApprove = () => {
    if (!lastResult || !lastInput) return;

    const newId = `session-${Date.now()}`;
    const procedureCode = lastInput.procedure_code;
    const payer = lastInput.payer;
    const newCase: SessionCase = {
      id: newId,
      scenario_label: `${procedureCode} — ${payer} (session)`,
      input: lastInput,
      determination: lastResult.determination,
      embedding: lastResult.query_embedding,
      source: 'session',
    };

    setSessionCases((prev) => [newCase, ...prev]);
    setApprovalState('approved');
  };

  const handleClear = () => {
    setFormValues(DEFAULT_FORM);
    setDemoState({ status: 'idle' });
    setApprovalState('pending');
    setLastResult(null);
    setLastInput(null);
  };

  const totalCases = baseCases.length + sessionCases.length;

  return (
    <div className={styles.demo}>
      <TldrBanner baseCaseCount={baseCases.length} sessionCaseCount={sessionCases.length} />

      <div className={styles.body}>
        <div className={styles.leftColumn}>
          <CaseLibrary
            baseCases={baseCases}
            sessionCases={sessionCasesDisplay}
            onUseAsInput={handleUseAsInput}
          />
          <div className={styles.formWrapper}>
            <div className={styles.formHeader}>
              <span className={styles.formTitle}>Eligibility Request</span>
              <span className={styles.formHint}>Edit fields or select a case above</span>
            </div>
            <InputForm
              values={formValues}
              onChange={setFormValues}
              onSubmit={handleSubmit}
              loading={demoState.status === 'loading'}
            />
          </div>
        </div>

        <div className={styles.rightColumn}>
          <span className={styles.resultsLabel}>Determination</span>
          <ResultsCard
            state={demoState}
            totalCases={totalCases}
            approvalState={approvalState}
            onApprove={handleApprove}
            onClear={handleClear}
          />
        </div>
      </div>
    </div>
  );
}
