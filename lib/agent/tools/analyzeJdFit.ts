import Anthropic from '@anthropic-ai/sdk';
import { searchContent, type SearchContentInput } from './searchContent';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type JdFitInput = {
  jobDescription: string;
  focus?: 'technical' | 'leadership' | 'cultural' | 'all';
  backgroundContext?: string;
  outputPerspective?: 'observer' | 'applicant';
  termGlossary?: string;
  // Called as each dimension sub-agent completes (before all 5 are done).
  // Used by the agent pipeline to stream partial scores to the UI.
  onProgress?: (key: keyof JdFitDimensions, score: DimensionScore) => void;
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

export type DimensionScore = {
  score: number;      // 1-10
  rationale: string;  // 2-3 sentences with specific evidence
  citations: string[]; // /info file paths cited
};

export type JdFitDimensions = {
  coreJobFunction: DimensionScore;  // × 3 = up to 30 pts
  seniority: DimensionScore;        // × 2 = up to 20 pts
  technicalSkills: DimensionScore;  // × 2.5 = up to 25 pts
  industryVertical: DimensionScore; // × 1.5 = up to 15 pts
  logistics: DimensionScore;        // × 1 = up to 10 pts
};

export type JdFitOutput = {
  fitScore: number;
  roleTitle: string;
  company?: string;
  dimensions: JdFitDimensions;
  strengths: JdFitStrength[];
  gaps: JdFitGap[];
  suggestedTalkingPoints: string[];
  recommendedRoleFraming: string;
};

type ExtractedRequirements = {
  roleTitle: string;
  company?: string;
  searchTerms: string[];
  synonymTerms: string[];
  requirements: {
    technical: string[];
    leadership: string[];
    cultural: string[];
  };
};

const SEARCH_TOOL_DEFINITION: Anthropic.Tool = {
  name: 'search_content',
  description: "Search Dan Mathieson's career, project, and background files. Use grep to find relevant content by keyword, list to browse available files, or read to examine a specific file.",
  input_schema: {
    type: 'object' as const,
    properties: {
      action: {
        type: 'string',
        enum: ['list', 'read', 'grep'],
        description: 'list: show available files; read: read a specific file; grep: search for a pattern across all files',
      },
      pattern: {
        type: 'string',
        description: 'Search pattern (required for grep action)',
      },
      path: {
        type: 'string',
        description: 'File path relative to /info (required for read action)',
      },
      category: {
        type: 'string',
        description: 'Optional category filter: about-me, career, ai-ml, projects',
      },
    },
    required: ['action'],
  },
};

const DIMENSION_PROMPTS: Record<keyof JdFitDimensions, string> = {
  coreJobFunction: `You are scoring how well Dan Mathieson's core job function history matches this role.

WHAT TO EVALUATE: Does Dan's day-to-day career work match what this role actually does?
- Pre-sales / solutions engineering / technical sales
- Customer delivery, enablement, and adoption
- GTM motions, enterprise deal management
- Product management, technical program management
- Analytics and data science (core to earlier career at FanDuel and Action Network)
- Direct building: prototyping, shipping tools, automation
- MOST IMPORTANTLY: Dan's superpower is bridging extremely technical concepts with non-technical stakeholders. Look for evidence of this across his career.

Search the career files thoroughly. Look at what he actually did day-to-day, not just titles.

Score 10 = near-identical role type and motion to what the JD asks for.
Score 7-9 = strong overlap with minor gaps in one area.
Score 4-6 = meaningful overlap but some function types are genuinely missing.
Score 1-3 = significant mismatch between Dan's work history and what this role requires.`,

  seniority: `You are scoring whether Dan Mathieson meets the seniority and experience level this role requires.

WHAT TO EVALUATE:
- Years of relevant experience (Dan has ~8 years total post-college)
- Scope of ownership: did he own things end-to-end or was he a contributor?
- Team/budget responsibilities
- Title progression and advancement speed
- Span of influence: how large were the organizations and deals he affected?
- Whether he has led other people or primarily individual-contributed

Search for specific evidence of scope, ownership, and experience depth across his career files.

Score 10 = exact seniority match (years, scope, level all align).
Score 7-9 = slightly under or over on one axis but broadly right level.
Score 4-6 = meaningful seniority gap (e.g., role wants VP-level, Dan is director-level).
Score 1-3 = significant mismatch (e.g., requires 15+ years in a domain Dan has 2 in).`,

  technicalSkills: `You are scoring whether Dan Mathieson has the specific technical skills, tools, and domain knowledge this role requires.

WHAT TO EVALUATE:
- Programming languages (Python, JavaScript, SQL, etc.) — depth matters, not just mention
- Specific platforms, APIs, and infrastructure (cloud, databases, ML frameworks)
- AI/ML tooling: LLMs, RAG systems, embedding models, agent frameworks
- Domain-specific technical knowledge required by this role
- Any required certifications or formal technical credentials

IMPORTANT: Hard gaps (a required skill with zero evidence) reduce this score materially. "Familiar with" is not the same as "built production systems in." Be calibrated about depth.

Search thoroughly for technical evidence across career and project files. Grep for specific tool names mentioned in the JD.

Score 10 = all required tech present with evidence of production-level use.
Score 7-9 = most required tech present; minor gaps in specific tools.
Score 4-6 = core technical profile matches but meaningful skill gaps exist.
Score 1-3 = significant required technical skills are absent.`,

  industryVertical: `You are scoring whether Dan Mathieson's industry vertical experience matches what this role targets.

STEP 1 — IDENTIFY THE VERTICAL MODE:
First, determine whether this role has a clear, specific industry vertical.

CLEAR VERTICAL examples: healthcare / life sciences, fintech, gaming, political tech, defense, real estate, legal tech, edtech.

VAGUE / HORIZONTAL examples: "enterprise SaaS", "B2B software", "productivity tools", "GTM tooling", "revenue operations", "AI infrastructure" — roles that serve many industries without specializing in one.

STEP 2A — IF CLEAR VERTICAL: Score on Dan's direct experience in that vertical.
- Healthcare/life sciences: Dan has spent the past 2+ years in healthcare RCM automation (prior auth, claims, eligibility, FHIR, EDI). Score this highly.
- Fintech/consumer financial: FanDuel background (revenue analytics, consumer betting product).
- Political tech / civic: Action Network background (email/SMS organizing, political fundraising).
- Other verticals: search for evidence; score by depth of exposure.

Score 10 = direct, deep domain expertise in exactly the role's vertical.
Score 7-9 = meaningful experience in the vertical or a very close adjacent.
Score 4-6 = some exposure but not a primary career focus.
Score 1-3 = essentially no relevant vertical history found.

STEP 2B — IF VAGUE / HORIZONTAL: Pivot to ICP matching instead.
When the JD's vertical is generic, score based on whether Dan has sold to, built for, or been embedded within the types of organizations this company serves (their ICP).

Ask: Who does this company sell to? Then search for evidence Dan has directly engaged that buyer type.
- Sells to healthcare payers/providers → Dan's healthcare RCM background is highly relevant even for a "horizontal AI" company.
- Sells to enterprise revenue teams / GTM orgs → Dan has run enterprise deals, built GTM tooling, worked in B2B sales-motion companies.
- Sells to developer / engineering organizations → look for evidence of Dan engaging technical buyer personas.
- Sells to SMB / consumer → Dan's FanDuel consumer analytics and Action Network nonprofit work are relevant.

Score 10 = Dan has sold to or been embedded in exactly the ICP this company targets.
Score 7-9 = strong overlap with the ICP buyer type.
Score 5-6 = some ICP overlap but not a primary buyer segment of Dan's career.
Score 3-4 = minimal ICP match found.
Score 1-2 = Dan has not engaged this buyer type at all.

IMPORTANT: Do NOT default to 5 when a clear ICP can be identified. A score of 5 should only appear when both the vertical AND the ICP are genuinely unclear from the available information.

Search Dan's career files thoroughly. Look for industry-specific vocabulary, named customers, workflow types, and buyer personas across his career.`,

  logistics: `You are scoring whether Dan Mathieson fits the logistical requirements of this role.

BASELINE FACTS (do not search for these, use them as given):
- Location: San Francisco, CA (SF-based)
- Work arrangement: Open to hybrid with regular in-office days; prefers not fully remote for senior roles
- Travel: Travel-tolerant, has done regular enterprise travel
- Compensation: No stated floor; assume open to market rates for senior individual contributor or director-level roles

WHAT TO EVALUATE:
- Location match (SF, remote, NYC, other)
- Travel requirements stated in the JD
- Compensation band if stated: does it align with director/senior IC market rates (~$200K-$300K+ in SF)?
- Work arrangement (hybrid vs fully remote vs fully in-person)
- Any other logistical requirements (clearances, degrees, language requirements)

Score 10 = zero logistical friction.
Score 7-9 = minor friction (e.g., relocation possible but not preferred, comp band slightly low).
Score 4-6 = meaningful friction (e.g., role requires full relocation to another city, or compensation is significantly below market).
Score 1-3 = hard blocker (e.g., requires security clearance Dan doesn't have, or mandatory relocation to a non-negotiable city).`,
};

async function scoreDimension(
  jd: string,
  requirements: ExtractedRequirements,
  dimensionKey: keyof JdFitDimensions,
): Promise<DimensionScore> {
  const scoringPrompt = DIMENSION_PROMPTS[dimensionKey];

  const messages: Anthropic.Messages.MessageParam[] = [
    {
      role: 'user',
      content: `${scoringPrompt}

Use the search_content tool to find evidence from Dan's career files. Do 3-6 targeted searches, then return your final JSON assessment. Do not over-search — stop once you have enough evidence to score confidently.

Your final response MUST be ONLY valid JSON (no markdown fences, no surrounding text):
{
  "score": <integer 1-10>,
  "rationale": "<2-3 sentences with specific evidence from what you found>",
  "citations": ["<list of /info file paths where you found relevant evidence>"]
}

JD Requirements:
${JSON.stringify(requirements, null, 2)}

Full Job Description:
${jd.slice(0, 6000)}`,
    },
  ];

  // Tool-use loop: tracks tool calls separately so the model always gets a final completion turn.
  // After MAX_TOOL_CALLS searches, we inject a nudge so the model wraps up on the next turn.
  const MAX_TOOL_CALLS = 6;
  let toolCallCount = 0;
  let fallbackReason = 'unknown stop condition';

  while (true) {
    const resp = await client.messages.create({
      model: process.env.AGENT_MODEL ?? 'claude-sonnet-4-6',
      max_tokens: 2048,
      tools: toolCallCount < MAX_TOOL_CALLS ? [SEARCH_TOOL_DEFINITION] : [],
      messages,
    });

    if (resp.stop_reason === 'end_turn') {
      const text = resp.content.find((b) => b.type === 'text')?.text ?? '';
      // Match outermost JSON object, handling nested braces
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        fallbackReason = `end_turn with no JSON block in response (${toolCallCount} searches made)`;
        break;
      }
      try {
        const parsed = JSON.parse(jsonMatch[0]) as DimensionScore;
        if (typeof parsed.score === 'number' && parsed.rationale) {
          return parsed;
        }
        fallbackReason = `JSON parsed but missing required fields (score=${parsed.score}, hasRationale=${!!parsed.rationale})`;
      } catch (e) {
        fallbackReason = `JSON parse error after ${toolCallCount} searches: ${String(e).slice(0, 120)}`;
      }
      break;
    }

    if (resp.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: resp.content });
      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

      for (const block of resp.content) {
        if (block.type !== 'tool_use') continue;
        if (block.name === 'search_content') {
          const result = await searchContent(block.input as SearchContentInput);
          toolCallCount++;
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        }
      }

      messages.push({ role: 'user', content: toolResults });

      // After hitting the search cap, inject a stop nudge so the model wraps up next turn
      if (toolCallCount >= MAX_TOOL_CALLS) {
        fallbackReason = `hit search cap (${MAX_TOOL_CALLS} tool calls) without producing valid JSON`;
        messages.push({
          role: 'user',
          content: 'You have completed enough research. Return your final JSON assessment now — score, rationale, and citations. No more searches.',
        });
      }
    } else {
      // Unexpected stop reason (e.g. max_tokens hit)
      fallbackReason = `unexpected stop_reason="${resp.stop_reason}" after ${toolCallCount} searches`;
      break;
    }
  }

  return {
    score: 5,
    rationale: `[Scoring incomplete — ${fallbackReason}]`,
    citations: [],
  };
}

export const analyzeJdFitTool = {
  name: 'analyze_jd_fit',
  description:
    "Analyze a job description against Dan's experience and produce a structured fit assessment. Returns a fit score (0-100), per-dimension scores with rationale, strengths with evidence from Dan's actual files, gaps with mitigations, suggested talking points, and recommended role framing. Use this when a visitor pastes or describes a job they want to evaluate Dan for.",
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
    // Step 1: Extract structured requirements from JD (Haiku - cheap pass)
    const extractResp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Extract key requirements from this job description as JSON. Return ONLY valid JSON, no markdown fences.

IMPORTANT: Job postings often begin with a generic "About Us" section. IGNORE that section entirely. Focus exclusively on what THIS SPECIFIC ROLE requires from the candidate.

Generate TWO sets of grep search terms - both will be run against a candidate's career files:

1. "searchTerms": 6-8 terms taken DIRECTLY from the JD's own vocabulary (exact skills/keywords as written).
2. "synonymTerms": 8-12 ALTERNATIVE terms that an experienced practitioner would use to describe the same concepts. These bridge the gap between how the JD is written and how a candidate's career files are written.${input.termGlossary ? `

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

    // Step 2: Run 5 parallel sub-agent scoring loops — each independently searches all /info files.
    // onProgress fires for each dimension as soon as it completes, before all 5 are done,
    // so the chat UI can progressively render dimension cards while others are still running.
    const scoreWithProgress = async (key: keyof JdFitDimensions): Promise<[keyof JdFitDimensions, DimensionScore]> => {
      const score = await scoreDimension(input.jobDescription, extracted, key);
      input.onProgress?.(key, score);
      return [key, score];
    };

    const results = await Promise.all([
      scoreWithProgress('coreJobFunction'),
      scoreWithProgress('seniority'),
      scoreWithProgress('technicalSkills'),
      scoreWithProgress('industryVertical'),
      scoreWithProgress('logistics'),
    ]);

    const dimensions = Object.fromEntries(results) as JdFitDimensions;
    const { coreJobFunction, seniority, technicalSkills, industryVertical, logistics } = dimensions;

    // Step 3: Compute weighted score
    const fitScore = Math.round(
      coreJobFunction.score * 3 +
      seniority.score * 2 +
      technicalSkills.score * 2.5 +
      industryVertical.score * 1.5 +
      logistics.score * 1,
    );

    // Step 4: Synthesize strengths, gaps, talking points, framing (Sonnet)
    const focus = input.focus ?? 'all';
    const backgroundSection = input.backgroundContext
      ? `\nDan's background (supplemental context):\n${input.backgroundContext}\n`
      : '';

    const dimensionSummary = `
Dimension scores (already computed):
- Core job function: ${coreJobFunction.score}/10 — ${coreJobFunction.rationale}
- Seniority: ${seniority.score}/10 — ${seniority.rationale}
- Technical skills: ${technicalSkills.score}/10 — ${technicalSkills.rationale}
- Industry/vertical: ${industryVertical.score}/10 — ${industryVertical.rationale}
- Logistics: ${logistics.score}/10 — ${logistics.rationale}

Weighted total: ${fitScore}/100`;

    const isApplicant = (input.outputPerspective ?? 'observer') === 'applicant';

    const synthesisResp = await client.messages.create({
      model: process.env.AGENT_MODEL ?? 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are synthesizing a fit assessment for Dan Mathieson based on already-computed dimension scores.

Role: ${extracted.roleTitle}${extracted.company ? ` at ${extracted.company}` : ''}
Analysis focus: ${focus}

JD Requirements:
${JSON.stringify(extracted.requirements, null, 2)}
${dimensionSummary}
${backgroundSection}

${isApplicant ? `Output perspective: APPLICANT (first-person as Dan). Write as if Dan is speaking:
- strengths: things Dan would say to a hiring manager ("I've led...", "In my time at...", "I built...")
- gaps: honest acknowledgments Dan would make ("I haven't directly managed X, though I've...")
- suggestedTalkingPoints: the actual words/phrases Dan would use in an interview, not advice about what to discuss
- recommendedRoleFraming: the 1-2 sentence pitch Dan would open with` :
`Output perspective: OBSERVER (third-person). Write as an outside assessor describing Dan's fit.`}

Return ONLY valid JSON (no markdown fences):
{
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

    const synthesis = JSON.parse(jsonMatch[0]);

    const output: JdFitOutput = {
      fitScore,
      roleTitle: extracted.roleTitle,
      company: extracted.company,
      dimensions,
      strengths: synthesis.strengths ?? [],
      gaps: synthesis.gaps ?? [],
      suggestedTalkingPoints: synthesis.suggestedTalkingPoints ?? [],
      recommendedRoleFraming: synthesis.recommendedRoleFraming ?? '',
    };

    return {
      ok: true,
      data: output,
      summary: `Fit score: ${output.fitScore}/100 - ${output.roleTitle}${output.company ? ` at ${output.company}` : ''}`,
      extractedTerms: {
        searchTerms: extracted.searchTerms ?? [],
        synonymTerms: extracted.synonymTerms ?? [],
      },
    };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
