import Anthropic from '@anthropic-ai/sdk';
import { searchContent, type SearchContentInput } from './searchContent';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type JdFitInput = {
  jobDescription: string;
  focus?: 'technical' | 'leadership' | 'cultural' | 'all';
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
): Promise<{ ok: true; data: JdFitOutput; summary: string } | { ok: false; error: string }> {
  try {
    // Step 1: Extract structured requirements from JD (Haiku — cheap pass)
    const extractResp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Extract the key requirements from this job description as JSON. Return ONLY valid JSON, no markdown fences:
{
  "roleTitle": "string",
  "company": "string or null",
  "searchTerms": ["4-6 specific skills/keywords to search for in a candidate's background"],
  "requirements": {
    "technical": ["technical skills and tools required"],
    "leadership": ["leadership and management expectations"],
    "cultural": ["cultural fit and soft skill expectations"]
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

    // Step 2: Search Dan's /info files for evidence on each search term
    const evidenceMap: Record<string, Array<{ file: string; line: number; text: string }>> = {};
    for (const term of (extracted.searchTerms ?? []).slice(0, 6)) {
      const result = await searchContent({ action: 'grep', pattern: term } as SearchContentInput);
      if (result.ok && !Array.isArray(result.data) && 'matches' in result.data) {
        evidenceMap[term] = result.data.matches.slice(0, 4);
      }
    }

    // Step 3: Synthesize assessment (Sonnet)
    const focus = input.focus ?? 'all';
    const synthesisResp = await client.messages.create({
      model: process.env.AGENT_MODEL ?? 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `You are assessing how well Dan Mathieson fits a job description. Be honest — acknowledge real gaps.

Role: ${extracted.roleTitle}${extracted.company ? ` at ${extracted.company}` : ''}
Analysis focus: ${focus}

JD Requirements:
${JSON.stringify(extracted.requirements, null, 2)}

Evidence from Dan's actual background files:
${JSON.stringify(evidenceMap, null, 2)}

Return ONLY valid JSON (no markdown fences) with this exact shape:
{
  "fitScore": <integer 0-100>,
  "roleTitle": "${extracted.roleTitle}",
  "company": ${extracted.company ? `"${extracted.company}"` : 'null'},
  "strengths": [
    { "point": "concise strength (1 sentence)", "evidence": [{ "file": "path/file.md", "excerpt": "relevant excerpt under 100 chars" }] }
  ],
  "gaps": [
    { "point": "concise gap (1 sentence)", "mitigation": "how Dan could address this" }
  ],
  "suggestedTalkingPoints": ["3-5 specific talking points for Dan in interviews"],
  "recommendedRoleFraming": "1-2 sentence recommended positioning for Dan when applying"
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
    };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
