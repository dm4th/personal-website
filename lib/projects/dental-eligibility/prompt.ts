import type { CaseInput, SimilarCase } from './types';

const SYSTEM_PROMPT = `You are a dental insurance eligibility verification expert with deep knowledge of CDT procedure codes, payer plan structures, and healthcare billing compliance.

Your task is to analyze a dental procedure eligibility request and return a structured JSON determination.

Rules:
1. Base your determination ONLY on the coverage text provided — do not invent or assume coverage not stated
2. When coverage text is ambiguous, lower the confidence score and flag for human review
3. Always cite specific language from the coverage text in your reasoning
4. If coverage text is insufficient, set confidence below 0.5 and flag "insufficient_coverage_information"
5. Identify any age restriction in the coverage text and encode it in age_limit. Use "less_than" when coverage requires the patient to be younger than a threshold, "greater_than" when coverage requires the patient to be older, and "none" when age is not a factor. If an age restriction applies and the patient's age falls outside the covered range, set covered=false and add "age_restriction_exceeded" to flags
6. Temperature is set low (0.1) — be precise and consistent

Return ONLY valid JSON matching this exact schema:
{
  "covered": boolean,
  "coverage_pct": number (0-100),
  "patient_responsibility_pct": number (0-100),
  "estimated_benefit": number or null,
  "flags": string[],
  "confidence": number (0.0-1.0),
  "reasoning": string,
  "compliance_note": string,
  "age_limit": { "type": "less_than" | "greater_than" | "none", "age": number (omit when type is "none") }
}

Valid flag values: "deductible_not_met", "approaching_annual_maximum", "annual_maximum_exhausted", "frequency_limit_triggered", "age_restriction_exceeded", "waiting_period_active", "prior_authorization_required", "alternative_benefit_provision_may_apply", "clinical_documentation_required", "clinical_necessity_required", "insufficient_coverage_information", "verify_before_treatment", "must_be_billed_with_crown", "cannot_bill_with_definitive_treatment_same_visit", "implant_not_covered", "alternative_covered_at_50pct", "adult_orthodontics_excluded"`;

function formatSimilarCase(sc: SimilarCase, index: number): string {
  return `EXAMPLE ${index + 1} (similarity: ${(sc.similarity * 100).toFixed(1)}%):
Procedure: ${sc.determination.covered ? 'COVERED' : 'NOT COVERED'} at ${sc.determination.coverage_pct}%
Confidence: ${sc.determination.confidence}
Flags: ${sc.determination.flags.length > 0 ? sc.determination.flags.join(', ') : 'none'}
Reasoning: ${sc.determination.reasoning}`;
}

export function buildKShotMessages(
  input: CaseInput,
  similarCases: SimilarCase[],
): { role: 'user'; content: string }[] {
  const examples = similarCases.map(formatSimilarCase).join('\n\n');

  const userContent = `SIMILAR VERIFIED CASES FOR CONTEXT:
${examples}

---

NEW ELIGIBILITY REQUEST:
Procedure Code: ${input.procedure_code}
Procedure Description: ${input.procedure_description}
Payer: ${input.payer}
Patient Age: ${input.patient_age}
Coverage Text: "${input.coverage_text}"
Plan Year Remaining: $${input.plan_year_remaining}
Deductible Met: ${input.deductible_met ? 'Yes' : 'No'}

Analyze this request and return the JSON determination. Be precise. Cite specific coverage text in your reasoning. End your compliance_note with "Synthetic demo data only."`;

  return [{ role: 'user', content: userContent }];
}

export { SYSTEM_PROMPT };
