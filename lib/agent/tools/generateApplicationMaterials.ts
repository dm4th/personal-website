import Anthropic from '@anthropic-ai/sdk';
import { analyzeJdFit, type JdFitOutput } from './analyzeJdFit';
import { searchContent } from './searchContent';
import { appendOpportunityMaterials, type ApplicationMaterials } from '@/lib/notion/client';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type GenerateMaterialsInput = {
  jobDescription?: string;
  jobUrl?: string;
  opportunityTitle?: string;
  company?: string;
  notionPageId?: string;
};

export type GenerateMaterialsOutput = {
  fitScore: number;
  roleTitle: string;
  company?: string;
  coverLetter: string;
  strengths: JdFitOutput['strengths'];
  gaps: JdFitOutput['gaps'];
  suggestedTalkingPoints: string[];
  recommendedRoleFraming: string;
  notionUpdated: boolean;
};

export const generateApplicationMaterialsTool = {
  name: 'generate_application_materials',
  description:
    "Generate a tailored cover letter and fit assessment for a specific job opportunity. Accepts a job URL (fetches the posting) or raw job description text. Writes the output to the linked Notion opportunity page if one exists. Use this when Dan wants to prepare application materials for a role he's targeting.",
  input_schema: {
    type: 'object' as const,
    properties: {
      jobUrl: {
        type: 'string',
        description: 'URL of the job posting to fetch and analyze',
      },
      jobDescription: {
        type: 'string',
        description: 'Raw job description text (use when URL is unavailable or fails to load)',
      },
      opportunityTitle: {
        type: 'string',
        description: 'The role title (used if the JD does not make it obvious)',
      },
      company: {
        type: 'string',
        description: 'Company name (used if the JD does not make it obvious)',
      },
      notionPageId: {
        type: 'string',
        description: 'Notion page ID of the Job Opportunity record to update with the generated materials',
      },
    },
  },
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Ashby: https://jobs.ashbyhq.com/{company}/{jobId}
async function fetchAshby(company: string, jobId: string): Promise<string | null> {
  try {
    const res = await fetch('https://jobs.ashbyhq.com/api/non-user-graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operationName: 'ApiJobPosting',
        variables: { organizationHostedJobsPageName: company, jobPostingId: jobId },
        query: `query ApiJobPosting($organizationHostedJobsPageName: String!, $jobPostingId: String!) {
          jobPosting(organizationHostedJobsPageName: $organizationHostedJobsPageName, jobPostingId: $jobPostingId) {
            title departmentName descriptionHtml
          }
        }`,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { data?: { jobPosting?: Record<string, string> } };
    const jp = data.data?.jobPosting;
    if (!jp) return null;
    const parts: string[] = [];
    if (jp.title) parts.push(`Role: ${jp.title}`);
    if (jp.departmentName) parts.push(`Department: ${jp.departmentName}`);
    if (jp.descriptionHtml) parts.push(stripHtml(jp.descriptionHtml));
    return parts.join('\n\n').slice(0, 12000) || null;
  } catch {
    return null;
  }
}

// Greenhouse: https://job-boards.greenhouse.io/{company}/jobs/{jobId}
async function fetchGreenhouse(company: string, jobId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${company}/jobs/${jobId}`);
    if (!res.ok) return null;
    const data = await res.json() as Record<string, string>;
    const parts: string[] = [];
    if (data.title) parts.push(`Role: ${data.title}`);
    if (data.content) parts.push(stripHtml(data.content));
    return parts.join('\n\n').slice(0, 12000) || null;
  } catch {
    return null;
  }
}

// Lever: https://jobs.lever.co/{company}/{jobId}
async function fetchLever(company: string, jobId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.lever.co/v0/postings/${company}/${jobId}`);
    if (!res.ok) return null;
    const data = await res.json() as Record<string, unknown>;
    const parts: string[] = [];
    if (data.text) parts.push(`Role: ${data.text}`);
    const lists = data.lists as Array<{ text: string; content: string }> | undefined;
    if (lists) {
      for (const l of lists) {
        parts.push(`${l.text}:\n${l.content.replace(/<[^>]+>/g, ' ').trim()}`);
      }
    }
    const descContent = (data.descriptionPlain ?? data.description) as string | undefined;
    if (descContent) parts.push(descContent.replace(/<[^>]+>/g, ' ').trim());
    return parts.join('\n\n').slice(0, 12000) || null;
  } catch {
    return null;
  }
}

async function fetchJobPostingText(url: string): Promise<string | null> {
  // Ashby
  const ashbyMatch = url.match(/jobs\.ashbyhq\.com\/([^/]+)\/([a-f0-9-]+)/i);
  if (ashbyMatch) return fetchAshby(ashbyMatch[1], ashbyMatch[2]);

  // Greenhouse (job-boards or boards subdomain)
  const ghMatch = url.match(/(?:job-boards|boards)\.greenhouse\.io\/([^/]+)\/jobs\/(\d+)/i);
  if (ghMatch) return fetchGreenhouse(ghMatch[1], ghMatch[2]);

  // Lever
  const leverMatch = url.match(/jobs\.lever\.co\/([^/]+)\/([a-f0-9-]+)/i);
  if (leverMatch) return fetchLever(leverMatch[1], leverMatch[2]);

  // Generic HTML scrape (best-effort for other sites)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobHuntBot/1.0)' },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return text.slice(0, 12000) || null;
  } catch {
    return null;
  }
}

// Common markers that signal where role-specific content begins (after company boilerplate)
const ROLE_START_MARKERS = [
  /\bthe role\b/i,
  /\babout the role\b/i,
  /\babout this role\b/i,
  /\babout this position\b/i,
  /\bposition overview\b/i,
  /\brole overview\b/i,
  /\bwhat you(?:'ll|'ll| will) do\b/i,
  /\byour responsibilities\b/i,
  /\bkey responsibilities\b/i,
  /\bresponsibilities\b/i,
  /\bwhat we(?:'re| are) looking for\b/i,
  /\bqualifications\b/i,
  /\brequirements\b/i,
  /\bwho you are\b/i,
  /\bwho we(?:'re| are) looking for\b/i,
];

function extractRoleContent(text: string): string {
  // Find the earliest marker that appears after at least 200 chars (skip if it's in the very first line)
  let earliestIndex = -1;
  for (const marker of ROLE_START_MARKERS) {
    const match = marker.exec(text.slice(200));
    if (match) {
      const idx = match.index + 200;
      if (earliestIndex === -1 || idx < earliestIndex) earliestIndex = idx;
    }
  }

  if (earliestIndex === -1 || earliestIndex > 5000) {
    // No clear split found or split is very late — keep full text
    return text;
  }

  // Keep a brief company intro (first 300 chars) + the role-specific section
  const companyIntro = text.slice(0, 300).split('\n')[0];
  const roleContent = text.slice(earliestIndex);
  return `[Company: ${companyIntro}]\n\n${roleContent}`;
}

// Key career files to read for background context — ordered by relevance to most roles
const BACKGROUND_FILES = [
  'career/smarter-technologies.md',
  'career/thoughtful.md',
  'career/action-network.md',
  'career/google.md',
  'about-me/strengths-and-weaknesses.md',
];

async function readDanBackground(): Promise<string> {
  const chunks: string[] = [];
  let totalChars = 0;
  const limit = 9000;

  for (const filePath of BACKGROUND_FILES) {
    if (totalChars >= limit) break;
    const result = await searchContent({ action: 'read', path: filePath });
    if (result.ok && !Array.isArray(result.data) && 'content' in result.data) {
      const content = String((result.data as { content: string }).content);
      const remaining = limit - totalChars;
      chunks.push(content.slice(0, remaining));
      totalChars += content.length;
    }
  }

  return chunks.join('\n\n---\n\n');
}

async function generateCoverLetter(fit: JdFitOutput, danBackground: string): Promise<string> {
  const resp = await client.messages.create({
    model: process.env.AGENT_MODEL ?? 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `Write a tailored cover letter for Dan Mathieson applying to the role of ${fit.roleTitle}${fit.company ? ` at ${fit.company}` : ''}.

Fit score: ${fit.fitScore}/100
Recommended framing: ${fit.recommendedRoleFraming}

Key strengths to highlight:
${fit.strengths.map((s) => `- ${s.point}`).join('\n')}

Gaps to address carefully (don't ignore them):
${fit.gaps.map((g) => `- ${g.point}${g.mitigation ? ` (mitigation: ${g.mitigation})` : ''}`).join('\n')}

Suggested talking points:
${fit.suggestedTalkingPoints.map((t) => `- ${t}`).join('\n')}

Dan's background summary (from his own files):
${danBackground.slice(0, 3000)}

Instructions:
- Write in first person as Dan
- 3–4 paragraphs, under 350 words total
- Opening: why this role/company specifically
- Middle: 2–3 concrete examples from his background that map to the role's needs
- Closing: clear ask for a conversation, forward-looking
- Tone: confident, specific, not generic — Dan doesn't do boilerplate
- Do NOT use phrases like "I am writing to express my interest" or "I am excited to apply"
- Return the cover letter text only, no subject line or "Dear Hiring Manager" header`,
      },
    ],
  });

  return resp.content[0]?.type === 'text' ? resp.content[0].text : '';
}

export async function generateApplicationMaterials(
  input: GenerateMaterialsInput,
): Promise<{ ok: true; data: GenerateMaterialsOutput; summary: string } | { ok: false; error: string }> {
  try {
    // Resolve job description text
    let jobDescriptionText = input.jobDescription ?? '';

    if (!jobDescriptionText && input.jobUrl) {
      const fetched = await fetchJobPostingText(input.jobUrl);
      if (fetched) {
        jobDescriptionText = fetched;
      } else {
        return {
          ok: false,
          error:
            'Could not fetch the job posting (it may be dynamically rendered). Please paste the job description text directly.',
        };
      }
    }

    if (!jobDescriptionText) {
      return { ok: false, error: 'Provide either a jobUrl or jobDescription.' };
    }

    // Strip company boilerplate so analysis focuses on role-specific requirements
    const roleText = extractRoleContent(jobDescriptionText);

    // Read Dan's career files to ground both fit analysis and cover letter
    const danBackground = await readDanBackground();

    // Run fit analysis with background context so scoring is calibrated against real experience
    const fitResult = await analyzeJdFit({
      jobDescription: roleText,
      focus: 'all',
      backgroundContext: danBackground,
    });
    if (!fitResult.ok) return { ok: false, error: fitResult.error };
    const fit = fitResult.data;

    const coverLetter = await generateCoverLetter(fit, danBackground);

    const materials: ApplicationMaterials = {
      fitScore: fit.fitScore,
      roleTitle: fit.roleTitle,
      company: fit.company,
      strengths: fit.strengths,
      gaps: fit.gaps,
      suggestedTalkingPoints: fit.suggestedTalkingPoints,
      recommendedRoleFraming: fit.recommendedRoleFraming,
      coverLetter,
    };

    let notionUpdated = false;
    if (input.notionPageId) {
      await appendOpportunityMaterials(input.notionPageId, materials, jobDescriptionText);
      notionUpdated = true;
    }

    return {
      ok: true,
      data: { ...materials, notionUpdated },
      summary: `Materials generated — fit score ${fit.fitScore}/100 for ${fit.roleTitle}${fit.company ? ` at ${fit.company}` : ''}${notionUpdated ? ' · Notion updated' : ''}`,
    };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
