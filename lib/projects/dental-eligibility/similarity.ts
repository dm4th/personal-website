import type { EligibilityCase, SessionCase, SimilarCase } from './types';

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function buildQueryString(input: {
  procedure_code: string;
  procedure_description: string;
  payer: string;
  coverage_text: string;
  patient_age: number;
  plan_year_remaining: number;
  deductible_met: boolean;
}): string {
  return [
    input.procedure_code,
    input.procedure_description,
    input.payer,
    input.coverage_text,
    `Patient age: ${input.patient_age}`,
    `Plan year remaining: $${input.plan_year_remaining}`,
    `Deductible met: ${input.deductible_met ? 'yes' : 'no'}`,
  ].join(' ');
}

export function findTopK(
  queryEmbedding: number[],
  queryString: string,
  baseCases: EligibilityCase[],
  sessionCases: SessionCase[],
  k: number,
): { topResults: SimilarCase[]; topSimilarity: number; topCase: EligibilityCase | SessionCase | null } {
  const allCases: Array<EligibilityCase | SessionCase> = [...baseCases, ...sessionCases];

  const scored = allCases
    .filter((c) => c.embedding.length > 0)
    .map((c) => ({
      id: c.id,
      scenario_label: c.scenario_label,
      // Exact string match short-circuits cosine computation - same input text always maps to
      // the same embedding, so string equality is both faster and more reliable than float comparison.
      similarity: c.query_string === queryString ? 1.0 : cosineSimilarity(queryEmbedding, c.embedding),
      determination: c.determination,
      source: c.source as 'base' | 'session',
      _case: c,
    }))
    .sort((a, b) => b.similarity - a.similarity);

  const topK = scored.slice(0, k);
  const topResults: SimilarCase[] = topK.map(({ id, scenario_label, similarity, determination, source }) => ({
    id,
    scenario_label,
    similarity,
    determination,
    source,
  }));

  return {
    topResults,
    topSimilarity: scored[0]?.similarity ?? 0,
    topCase: scored[0]?._case ?? null,
  };
}
