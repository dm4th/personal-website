export type CaseInput = {
  procedure_code: string;
  procedure_description: string;
  payer: string;
  patient_age: number;
  coverage_text: string;
  plan_year_remaining: number;
  deductible_met: boolean;
};

export type AgeLimit =
  | { type: 'less_than'; age: number }
  | { type: 'greater_than'; age: number }
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

export type EligibilityResponse = {
  determination: CaseDetermination;
  path: 'exact_match' | 'hybrid_rag';
  query_embedding: number[];
  similar_cases: SimilarCase[];
  matched_case_id?: string;
};

export type DemoState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; result: EligibilityResponse }
  | { status: 'error'; message: string };
