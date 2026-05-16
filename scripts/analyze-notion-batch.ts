/**
 * Batch JD analysis for 4 Notion roles.
 * Run from the worktree root using the main project's node_modules + .env:
 *
 *   cd /Users/dannymathieson/Develop/personal-website/.claude/worktrees/fervent-kare-91af7d
 *   node --env-file=/Users/dannymathieson/Develop/personal-website/.env.local \
 *     /Users/dannymathieson/Develop/personal-website/node_modules/.bin/tsx \
 *     scripts/analyze-notion-batch.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { analyzeJdFit } from '../lib/agent/tools/analyzeJdFit';
import { searchContent } from '../lib/agent/tools/searchContent';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Roles to analyze ────────────────────────────────────────────────────────

const ROLES = [
  {
    title: 'Forward Deployed Engineer, GTM',
    company: 'Notion',
    slug: 'notion-forward-deployed-engineer-gtm',
    url: 'https://jobs.ashbyhq.com/notion/10437426-14c8-4c45-8075-67959ce80393',
  },
  {
    title: 'Manager, Solutions Engineering, Mid-Market',
    company: 'Notion',
    slug: 'notion-manager-solutions-engineering-mid-market',
    url: 'https://jobs.ashbyhq.com/notion/3c0141de-06fb-4186-9cd4-75395f0b5488',
  },
  {
    title: 'Solutions Engineer - Enterprise - AMER',
    company: 'Notion',
    slug: 'notion-solutions-engineer-enterprise-amer',
    url: 'https://jobs.ashbyhq.com/notion/b0c0afb3-f075-47c7-9a8e-428032b3bb20',
  },
  {
    title: 'Partner Solutions Engineer',
    company: 'Notion',
    slug: 'notion-partner-solutions-engineer',
    url: 'https://jobs.ashbyhq.com/notion/a6a91521-87cd-41aa-b800-24dc8808d375',
  },
];

// ─── Glossary ─────────────────────────────────────────────────────────────────

type GlossaryEntry = { jdTerm: string; synonyms: string[] };
type GlossaryFile = {
  termMappings: GlossaryEntry[];
  runs: Array<{ date: string; role: string; company: string; searchTerms: string[]; synonymTerms: string[] }>;
};

const GLOSSARY_PATH = path.join(process.cwd(), 'scripts', 'jd-terms-glossary.json');

function loadGlossary(): GlossaryFile {
  if (!fs.existsSync(GLOSSARY_PATH)) return { termMappings: [], runs: [] };
  try { return JSON.parse(fs.readFileSync(GLOSSARY_PATH, 'utf8')) as GlossaryFile; }
  catch { return { termMappings: [], runs: [] }; }
}

function glossaryToPromptString(glossary: GlossaryFile): string {
  if (!glossary.termMappings.length) return '';
  return glossary.termMappings
    .map((m) => `  - "${m.jdTerm}" → ${m.synonyms.map((s) => `"${s}"`).join(', ')}`)
    .join('\n');
}

function saveGlossary(glossary: GlossaryFile, role: string, company: string, searchTerms: string[], synonymTerms: string[]): void {
  const existingJdTerms = new Set(glossary.termMappings.map((m) => m.jdTerm.toLowerCase()));
  for (const term of searchTerms) {
    if (!existingJdTerms.has(term.toLowerCase())) {
      if (synonymTerms.length > 0) {
        glossary.termMappings.push({ jdTerm: term, synonyms: synonymTerms });
        existingJdTerms.add(term.toLowerCase());
      }
    } else {
      const entry = glossary.termMappings.find((m) => m.jdTerm.toLowerCase() === term.toLowerCase());
      if (entry) {
        const newSynonyms = synonymTerms.filter((s) => !entry.synonyms.map((e) => e.toLowerCase()).includes(s.toLowerCase()));
        entry.synonyms.push(...newSynonyms);
      }
    }
  }
  glossary.runs.push({ date: new Date().toISOString().split('T')[0], role, company, searchTerms, synonymTerms });
  fs.writeFileSync(GLOSSARY_PATH, JSON.stringify(glossary, null, 2));
  console.log(`[glossary] Saved ${glossary.termMappings.length} mappings across ${glossary.runs.length} runs\n`);
}

// ─── Background context ───────────────────────────────────────────────────────

function loadBackgroundContext(): string {
  const infoRoot = path.join(process.cwd(), 'info');
  const keyFiles = [
    'career/smarter-technologies/index.md',
    'career/smarter-technologies/pipeline-management.md',
    'career/smarter-technologies/ai-se-platform.md',
    'career/thoughtful/solutions-architect.md',
    'career/thoughtful/customer-engineer.md',
    'career/thoughtful/lead-tpm.md',
    'about-me/education/bucknell-overview.md',
    'ai-ml/cal-tech/bootcamp.md',
    'career/action-network/first-year-post-ari.md',
    'career/action-network/year-two-and-departure.md',
    'career/fanduel/revenue-team.md',
    'career/google/my-year-at-google.md',
    'about-me/strengths-and-weaknesses/self-assessment.md',
    'projects/healthcare-agent-data-layer/index.md',
    'career/smarter-technologies/shutdown-and-retention.md',
  ];
  return keyFiles
    .map((f) => {
      const fullPath = path.join(infoRoot, f);
      if (!fs.existsSync(fullPath)) return '';
      return `=== ${f} ===\n${fs.readFileSync(fullPath, 'utf8')}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

// ─── Generate rich fields (referralBlurb, fitScoreNote, summary, projects) ───

type RichFields = {
  referralBlurb: string;
  fitScoreNote: string;
  summary: string[];
  projects: Array<{ name: string; path: string; relevance: string }>;
};

async function generateRichFields(
  roleTitle: string,
  company: string,
  fitScore: number,
  strengths: Array<{ point: string; evidence: Array<{ file: string; excerpt: string }> }>,
  gaps: Array<{ point: string; mitigation?: string }>,
  recommendedRoleFraming: string,
  backgroundContext: string,
): Promise<RichFields> {
  const AVAILABLE_PROJECTS = [
    { name: 'Notion Meeting Intelligence', path: '/projects/notion-meeting-intelligence', description: 'Multi-agent pipeline that turns sales meeting recordings into structured deal intelligence written directly into Notion. Demonstrates GTM AI building, agent orchestration, and Notion-native development.' },
    { name: 'Dental Eligibility Intelligence', path: '/projects/dental-eligibility', description: 'Production AI system for healthcare automation - real-time insurance eligibility verification. Demonstrates enterprise AI deployment, production stability, and customer-facing technical delivery.' },
    { name: 'Healthcare Agent Data Layer', path: '/projects/healthcare-agent-data-layer', description: 'Research thesis on a shared agent memory/context layer for healthcare. Demonstrates AI architecture thinking, cross-system integration, and independent technical research.' },
    { name: 'Personal AI Website', path: '/', description: 'RAG-powered chatbot on Dan\'s personal site with multi-LLM support, embeddings, and a "guess the model" game. Demonstrates full-stack AI development and technical communication.' },
  ];

  const prompt = `You are writing application materials for Dan Mathieson (Director of Solutions Engineering, AI builder) applying to ${roleTitle} at ${company}. Fit score: ${fitScore}/100.

Key strengths identified:
${strengths.slice(0, 4).map((s) => `- ${s.point}`).join('\n')}

Gaps:
${gaps.slice(0, 3).map((g) => `- ${g.point}${g.mitigation ? ` (mitigation: ${g.mitigation})` : ''}`).join('\n')}

Role framing: ${recommendedRoleFraming}

Available portfolio projects (choose 2-3 most relevant):
${AVAILABLE_PROJECTS.map((p) => `- ${p.name} (path: ${p.path}): ${p.description}`).join('\n')}

Generate JSON with these exact fields:
{
  "referralBlurb": "2-3 sentence referral note written as if a colleague is referring Dan. Specific and concrete - mention what he built and why it maps to this role. First-person from the referrer's perspective.",
  "fitScoreNote": "1-2 sentence note from Dan's perspective explaining his fit. Warm, specific, grounded in what he's actually built or done. No em-dashes.",
  "summary": ["4-5 bullet points (strings) each 10-20 words summarizing top qualifications for this specific role"],
  "projects": [{"name": "project name", "path": "/projects/path", "relevance": "1-2 sentences why this project is relevant to this role"}]
}

Return ONLY valid JSON. No markdown fences.`;

  const resp = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = resp.content[0]?.type === 'text' ? resp.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Could not parse rich fields JSON for ${roleTitle}`);
  return JSON.parse(jsonMatch[0]) as RichFields;
}

// ─── Map analyzeJdFit output → page-config.json format ───────────────────────

function mapStrengths(strengths: Array<{ point: string; evidence: Array<{ file: string; excerpt: string }> }>) {
  return strengths.map((s) => ({
    title: s.point.split('.')[0].slice(0, 80),
    description: s.point,
    citations: s.evidence.map((e) => {
      const cleanPath = '/info/' + e.file.replace(/\.md$/, '');
      const label = path.basename(path.dirname(e.file)) + '/' + path.basename(e.file, '.md');
      return { label, path: cleanPath };
    }),
  }));
}

function mapWeaknesses(gaps: Array<{ point: string; mitigation?: string }>) {
  return gaps.map((g) => ({
    title: g.point.split('.')[0].slice(0, 80),
    description: g.point,
    mitigation: g.mitigation ?? '',
  }));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Sanity check
  const testGrep = await searchContent({ action: 'grep', pattern: 'solutions engineer' });
  if (testGrep.ok && !Array.isArray(testGrep.data) && 'matches' in testGrep.data) {
    console.log(`[debug] grep found ${testGrep.data.matches.length} hits - info root is correct\n`);
  }

  const glossary = loadGlossary();
  const termGlossary = glossaryToPromptString(glossary);
  console.log(`[glossary] ${glossary.termMappings.length} existing term mappings\n`);

  const backgroundContext = loadBackgroundContext();
  console.log(`[debug] ${backgroundContext.length} chars of background context loaded\n`);

  for (const role of ROLES) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Analyzing: ${role.title} @ ${role.company}`);
    console.log(`URL: ${role.url}`);
    console.log('='.repeat(60) + '\n');

    const outDir = path.join(process.cwd(), 'job-applications', role.slug);
    fs.mkdirSync(outDir, { recursive: true });

    const result = await analyzeJdFit({
      jobUrl: role.url,
      focus: 'all',
      outputPerspective: 'applicant',
      backgroundContext,
      termGlossary: termGlossary || undefined,
    });

    if (!result.ok) {
      console.error(`[ERROR] analyzeJdFit failed for ${role.title}: ${result.error}`);
      continue;
    }

    const fit = result.data;
    console.log(`[score] ${fit.fitScore}/100 for ${fit.roleTitle}`);

    // Generate rich fields (referralBlurb, fitScoreNote, summary, projects)
    console.log('[rich] Generating referral blurb, fit note, summary, projects...\n');
    const rich = await generateRichFields(
      fit.roleTitle,
      role.company,
      fit.fitScore,
      fit.strengths,
      fit.gaps,
      fit.recommendedRoleFraming,
      backgroundContext,
    );

    // Build page-config.json
    const id = crypto.randomBytes(6).toString('hex');
    const config = {
      id,
      company: role.company,
      companyLogoUrl: 'https://www.google.com/s2/favicons?domain=notion.com&sz=128',
      role: fit.roleTitle || role.title,
      appliedDate: '',
      fitScore: fit.fitScore,
      fitScoreNote: rich.fitScoreNote,
      dimensions: fit.dimensions,
      summary: rich.summary,
      jobDescriptionUrl: role.url,
      jobDescriptionText: '',
      strengths: mapStrengths(fit.strengths),
      weaknesses: mapWeaknesses(fit.gaps),
      referralBlurb: rich.referralBlurb,
      projects: rich.projects,
      applicationQuestions: [],
      resumeFile: 'Dan Mathieson Resume.pdf',
      coverLetterFile: 'cover-letter.pdf',
    };

    const outPath = path.join(outDir, 'page-config.json');
    fs.writeFileSync(outPath, JSON.stringify(config, null, 2));
    console.log(`[saved] ${outPath}\n`);

    // Persist glossary terms
    if (result.extractedTerms) {
      saveGlossary(glossary, fit.roleTitle, role.company, result.extractedTerms.searchTerms, result.extractedTerms.synonymTerms);
    }

    // Brief pause between API-heavy calls
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log('\n✓ All roles analyzed. Review job-applications/ for page-config.json files.\n');
}

main().catch(console.error);
