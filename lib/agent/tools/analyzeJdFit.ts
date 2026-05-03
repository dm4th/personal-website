import Anthropic from '@anthropic-ai/sdk';
import { searchContent, type SearchContentInput } from './searchContent';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type JdFitInput = {
  jobDescription: string;
  focus?: 'technical' | 'leadership' | 'cultural' | 'all';
  backgroundContext?: string; // Dan's career files, passed in by callers that have already read them
  outputPerspective?: 'observer' | 'applicant'; // 'observer' = third-person for visitors; 'applicant' = first-person as Dan
  termGlossary?: string; // accumulated JD→practitioner vocabulary mappings from prior runs
};

export type JdFitEvidence = {
  file: string;
  excerpt: string;
};

export type JdFitStrength = {
  point: string;
  evidence: JdFitEvidence[];
};

export type JdFitGap = {
  point: string;
  mitigation?: string;
};

export type JdFitOutput = {
  fitScore: number;
  roleTitle: string;
  company?: string;
  strengths: JdFitStrength[];
  gaps: JdFitGap[];
  suggestedTalkingPoints: string[];
  recommendedRoleFraming: string;
};

type ExtractedRequirements = {
  roleTitle: string;
  company?: string;
  searchTerms: string[];
  synonymTerms: string[]; // practitioner vocab / domain equivalents for the same concepts
  requirements: {
    technical: string[];
    leadership: string[];
    cultural: string[];
  };
};

export const analyzeJdFitTool = {
  name: 'analyze_jd_fit',
  description:
    "Analyze a job description against Dan's experience and produce a structured fit assessment. Returns a fit score (0-100), strengths with evidence from Dan's actual files, gaps with mitigations, suggested talking points, and recommended role framing. Use this when a visitor pastes or describes a job they want to evaluate Dan for.",
  input_schema: {
    type: 'object' as const,
    properties: {
      jobDescription: {
        type: 'string',
        description: 'The full job description text',
      },
      focus: {
        type: 'string',
        enum: ['technical', 'leadership', 'cultural', 'all'],
        description: 'Which aspects to emphasize. Defaults to "all".',
      },
    },
    required: ['jobDescription'],
  },
};

export async function analyzeJdFit(
  input: JdFitInput,
): Promise<{ ok: true; data: JdFitOutput; summary: string; extractedTerms: { searchTerms: string[]; synonymTerms: string[] } } | { ok: false; error: string }> {
  try {
    // Step 1: Extract structured requirements from JD (Haiku — cheap pass)
    const extractResp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Extract key requirements from this job description as JSON. Return ONLY valid JSON, no markdown fences.

IMPORTANT: Job postings often begin with a generic "About Us" section. IGNORE that section entirely. Focus exclusively on what THIS SPECIFIC ROLE requires from the candidate.

Generate TWO sets of grep search terms — both will be run against a candidate's career files:

1. "searchTerms": 6-8 terms taken DIRECTLY from the JD's own vocabulary (exact skills/keywords as written).
2. "synonymTerms": 8-12 ALTERNATIVE terms that an experienced practitioner would use to describe the same concepts. These bridge the gap between how the JD is written and how a candidate's career files are written. Built-in examples:
   - JD says "RAG architectures" → synonymTerms includes "hybrid-RAG", "retrieval-augmented", "embedding model", "pgvector"
   - JD says "Python/SQL" → synonymTerms includes "pandas", "jupyter", "Jupyter Notebook", "data analysis"
   - JD says "prior authorization" → synonymTerms includes "SmarterAuthorizations", "utilization management", "PA workflow"
   - JD says "GenAI solutions" → synonymTerms includes "GPT", "LLM pipeline", "prompt engineering", "OpenAI"
   - JD says "pre-sales" → synonymTerms includes "solutions architect", "customer engineer", "SE"
   - JD says "proof of concept" → synonymTerms includes "POC", "prototype", "demo"${input.termGlossary ? `

Additionally, use these accumulated vocabulary mappings from previous JD analyses to expand your synonymTerms further:
${input.termGlossary}` : ''}

{
  "roleTitle": "string",
  "company": "string or null",
  "searchTerms": ["6-8 direct JD vocabulary terms"],
  "synonymTerms": ["8-12 practitioner/domain synonym alternatives"],
  "requirements": {
    "technical": ["specific technical skills, tools, or domain knowledge required for this role"],
    "leadership": ["specific leadership and management expectations for this role"],
    "cultural": ["specific soft skills or ways of working called out for this role"]
  }
}

Job Description:
${input.jobDescription.slice(0, 8000)}`,
        },
      ],
    });

    const extractText = extractResp.content[0]?.type === 'text' ? extractResp.content[0].text : '';
    let extracted: ExtractedRequirements;
    try {
      const jsonMatch = extractText.match(/\{[\s\S]*\}/);
      extracted = JSON.parse(jsonMatch?.[0] ?? '{}');
    } catch {
      return { ok: false, error: 'Failed to parse JD requirements' };
    }

    // Step 2: Search Dan's /info files for evidence.
    // Run grep on both JD-vocabulary terms and practitioner-synonym terms so that
    // vocabulary mismatches between the JD and Dan's career files don't create false gaps.
    const allSearchTerms = [
      ...(extracted.searchTerms ?? []).slice(0, 7),
      ...(extracted.synonymTerms ?? []).slice(0, 7),
    ].filter((t, i, arr) => t && arr.indexOf(t) === i); // deduplicate, drop empty

    const evidenceMap: Record<string, Array<{ file: string; line: number; text: string }>> = {};
    for (const term of allSearchTerms.slice(0, 14)) {
      const result = await searchContent({ action: 'grep', pattern: term } as SearchContentInput);
      if (result.ok && !Array.isArray(result.data) && 'matches' in result.data) {
        evidenceMap[term] = result.data.matches.slice(0, 3);
      }
    }

    // Step 3: Synthesize assessment (Sonnet)
    const focus = input.focus ?? 'all';
    const backgroundSection = input.backgroundContext
      ? `\nDan's background (primary source of truth — use this to reason about fit):\n${input.backgroundContext}\n`
      : '';
    const evidenceSection = Object.keys(evidenceMap).length > 0
      ? `\nSupporting evidence (grep hits from Dan's files):\n${JSON.stringify(evidenceMap, null, 2)}`
      : '';

    const isApplicant = (input.outputPerspective ?? 'observer') === 'applicant';

    const synthesisResp = await client.messages.create({
      model: process.env.AGENT_MODEL ?? 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are assessing how well Dan Mathieson fits a job description.

Scoring guidance:
- 80-100: Strong match — most requirements met, minor gaps only
- 60-79: Good match — core requirements met, some genuine gaps
- 40-59: Partial match — relevant background but meaningful gaps
- 20-39: Weak match — some transferable skills but significant gaps
- 0-19: Poor match — most requirements unmet

Be calibrated, not pessimistic. If Dan has done this type of work (SE leadership, GTM, enterprise AI), score accordingly. Only score below 40 if there are fundamental missing requirements.

Role: ${extracted.roleTitle}${extracted.company ? ` at ${extracted.company}` : ''}
Analysis focus: ${focus}

JD Requirements:
${JSON.stringify(extracted.requirements, null, 2)}
${backgroundSection}${evidenceSection}

${isApplicant ? `Output perspective: APPLICANT (first-person as Dan). Write as if Dan is speaking:
- strengths: things Dan would say to a hiring manager ("I've led...", "In my time at...", "I built...")
- gaps: honest acknowledgments Dan would make ("I haven't directly managed X, though I've...")
- suggestedTalkingPoints: the actual words/phrases Dan would use in an interview, not advice about what to discuss
- recommendedRoleFraming: the 1-2 sentence pitch Dan would open with` :
`Output perspective: OBSERVER (third-person). Write as an outside assessor describing Dan's fit.`}

Return ONLY valid JSON (no markdown fences):
{
  "fitScore": <integer 0-100>,
  "roleTitle": "${extracted.roleTitle}",
  "company": ${extracted.company ? `"${extracted.company}"` : 'null'},
  "strengths": [
    { "point": "concise strength (1 sentence)", "evidence": [{ "file": "path/file.md", "excerpt": "relevant excerpt under 100 chars" }] }
  ],
  "gaps": [
    { "point": "concise gap (1 sentence)", "mitigation": "${isApplicant ? 'how Dan would address this in conversation' : 'how Dan could address this'}" }
  ],
  "suggestedTalkingPoints": ["3-5 ${isApplicant ? 'things Dan would actually say' : 'talking points for Dan'} in interviews"],
  "recommendedRoleFraming": "1-2 sentence ${isApplicant ? 'pitch Dan would open with' : 'recommended positioning for Dan when applying'}"
}`,
        },
      ],
    });

    const synthesisText = synthesisResp.content[0]?.type === 'text' ? synthesisResp.content[0].text : '';
    const jsonMatch = synthesisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { ok: false, error: 'Synthesis produced no JSON output' };

    const output: JdFitOutput = JSON.parse(jsonMatch[0]);
    return {
      ok: true,
      data: output,
      summary: `Fit score: ${output.fitScore}/100 — ${output.roleTitle}${output.company ? ` at ${output.company}` : ''}`,
      // Expose extracted terms so callers can persist them to the cross-JD glossary
      extractedTerms: {
        searchTerms: extracted.searchTerms ?? [],
        synonymTerms: extracted.synonymTerms ?? [],
      },
    };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
