import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import type { EligibilityCase, SessionCase, CaseDetermination } from '@/lib/projects/dental-eligibility/types';
import { findTopK, buildQueryString } from '@/lib/projects/dental-eligibility/similarity';
import { buildKShotMessages, SYSTEM_PROMPT } from '@/lib/projects/dental-eligibility/prompt';
import casesData from '@/data/dental-eligibility-cases.json';

const baseCases = casesData as EligibilityCase[];

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SessionCaseSchema = z.object({
  id: z.string(),
  scenario_label: z.string(),
  input: z.object({
    procedure_code: z.string(),
    procedure_description: z.string(),
    payer: z.string(),
    patient_age: z.number(),
    coverage_text: z.string(),
    plan_year_remaining: z.number(),
    deductible_met: z.boolean(),
  }),
  determination: z.object({
    covered: z.boolean(),
    coverage_pct: z.number(),
    patient_responsibility_pct: z.number(),
    estimated_benefit: z.number().nullable(),
    flags: z.array(z.string()),
    confidence: z.number(),
    reasoning: z.string(),
    compliance_note: z.string(),
    age_limit: z.union([
      z.object({ type: z.literal('less_than'), age: z.number() }),
      z.object({ type: z.literal('greater_than'), age: z.number() }),
      z.object({ type: z.literal('none') }),
    ]),
  }),
  embedding: z.array(z.number()),
  source: z.literal('session'),
});

const RequestSchema = z.object({
  procedure_code: z.string().min(1),
  procedure_description: z.string().min(1),
  payer: z.string().min(1),
  patient_age: z.number().int().min(0).max(120),
  coverage_text: z.string().min(1),
  plan_year_remaining: z.number().min(0),
  deductible_met: z.boolean(),
  session_cases: z.array(SessionCaseSchema).optional().default([]),
});

const EXACT_MATCH_THRESHOLD = 0.97;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation error', detail: parsed.error.message }, { status: 400 });
  }

  const { session_cases, ...input } = parsed.data;
  const sessionCases = session_cases as SessionCase[];

  let queryEmbedding: number[];
  try {
    const embeddingResponse = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: buildQueryString(input),
    });
    queryEmbedding = embeddingResponse.data[0].embedding;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Embedding generation failed', detail: message }, { status: 500 });
  }

  const { topResults, topSimilarity, topCase } = findTopK(queryEmbedding, baseCases, sessionCases, 3);

  if (topSimilarity >= EXACT_MATCH_THRESHOLD && topCase) {
    const determination = { ...topCase.determination, flags: [...topCase.determination.flags] };
    const { age_limit } = determination;

    if (age_limit.type === 'less_than' && input.patient_age >= age_limit.age) {
      determination.covered = false;
      if (!determination.flags.includes('age_restriction_exceeded')) {
        determination.flags.push('age_restriction_exceeded');
      }
    } else if (age_limit.type === 'greater_than' && input.patient_age <= age_limit.age) {
      determination.covered = false;
      if (!determination.flags.includes('age_restriction_exceeded')) {
        determination.flags.push('age_restriction_exceeded');
      }
    } else if (age_limit.type !== 'none') {
      // age restriction exists but patient qualifies — remove stale flag if present
      determination.flags = determination.flags.filter((f) => f !== 'age_restriction_exceeded');
      determination.covered = topCase.determination.covered;
    }

    return NextResponse.json({
      determination,
      path: 'exact_match',
      query_embedding: queryEmbedding,
      similar_cases: topResults,
      matched_case_id: topCase.id,
    });
  }

  let determination: CaseDetermination;
  try {
    const messages = buildKShotMessages(input, topResults);
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    determination = JSON.parse(raw) as CaseDetermination;

    if (typeof determination.covered !== 'boolean') {
      throw new Error('Invalid determination structure from LLM');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Determination generation failed', detail: message }, { status: 500 });
  }

  return NextResponse.json({
    determination,
    path: 'hybrid_rag',
    query_embedding: queryEmbedding,
    similar_cases: topResults,
  });
}
