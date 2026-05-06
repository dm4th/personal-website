export type CaseInput = {
  procedure_code: string;
  procedure_description: string;
  payer: string;
  patient_age: number;
  coverage_text: string;
  plan_year_remaining: number;
  deductible_met: boolean;
  last_appointment_date: string | null;
};

export type AgeLimit =
  | { type: 'less_than'; age: number }
  | { type: 'greater_than'; age: number }
  | { type: 'none' };

export type FrequencyLimit =
  | { type: 'months'; months: number }
  | { type: 'none' };

export type CaseDetermination = {
  covered: boolean;
  coverage_pct: number;
  patient_responsibility_pct: number;
  estimated_benefit: number | null;
  flags: string[];
  confidence: number;
  reasoning: string;
  compliance_note: string;
  age_limit: AgeLimit;
  frequency_limit: FrequencyLimit;
};

export type EligibilityCase = {
  id: string;
  scenario_label: string;
  input: CaseInput;
  determination: CaseDetermination;
  verified: true;
  embedding: number[];
  source: 'base' | 'session';
};

export type SessionCase = {
  id: string;
  scenario_label: string;
  input: CaseInput;
  determination: CaseDetermination;
  embedding: number[];
  source: 'session';
};

export type EligibilityRequest = CaseInput & {
  session_cases?: SessionCase[];
};

export type SimilarCase = {
  id: string;
  scenario_label: string;
  similarity: number;
  determination: CaseDetermination;
  source: 'base' | 'session';
};

export type FieldComparison = {
  field: 'patient_age' | 'plan_year_remaining' | 'deductible_met';
  label: string;
  query_val: number | boolean;
  stored_val: number | boolean;
  matched: boolean;
};

export type EligibilityResponse = {
  determination: CaseDetermination;
  path: 'exact_match' | 'hybrid_rag';
  query_embedding: number[];
  query_string: string;
  top_similarity: number;
  field_comparison: FieldComparison[];
  similar_cases: SimilarCase[];
  matched_case_id?: string;
};

export type DemoState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; result: EligibilityResponse }
  | { status: 'error'; message: string };
