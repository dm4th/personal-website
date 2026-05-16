/**
 * Re-score the GTM AI Innovation Manager role with the updated glossary.
 * Updates: fitScore, dimensions, summary
 * Preserves: fitScoreNote, strengths, weaknesses, referralBlurb, projects (manually written)
 *
 * Run from the worktree root:
 *   set -a && source /Users/dannymathieson/Develop/personal-website/.env.local && set +a
 *   /Users/dannymathieson/Develop/personal-website/node_modules/.bin/tsx scripts/rescore-gtm-ai-manager.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { analyzeJdFit } from '../lib/agent/tools/analyzeJdFit';
import { searchContent } from '../lib/agent/tools/searchContent';
import fs from 'fs';
import path from 'path';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CONFIG_PATH = path.join(process.cwd(), 'job-applications', 'notion-gtm-ai-innovation-manager', 'page-config.json');
const GLOSSARY_PATH = path.join(process.cwd(), 'scripts', 'jd-terms-glossary.json');

function loadGlossary() {
  if (!fs.existsSync(GLOSSARY_PATH)) return { termMappings: [], runs: [] };
  try { return JSON.parse(fs.readFileSync(GLOSSARY_PATH, 'utf8')); }
  catch { return { termMappings: [], runs: [] }; }
}

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

async function generateSummary(
  roleTitle: string,
  company: string,
  fitScore: number,
  strengths: Array<{ title: string; description: string }>,
  recommendedRoleFraming: string,
): Promise<string[]> {
  const prompt = `Generate 4-5 concise bullet points (10-20 words each) summarizing Dan Mathieson's top qualifications for the ${roleTitle} role at ${company} (fit score: ${fitScore}/100).

Role framing: ${recommendedRoleFraming}

Top strengths:
${strengths.slice(0, 4).map((s) => `- ${s.title}`).join('\n')}

Return ONLY a JSON array of strings. No markdown fences. Example: ["bullet 1", "bullet 2"]`;

  const resp = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = resp.content[0]?.type === 'text' ? resp.content[0].text : '';
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Could not parse summary JSON');
  return JSON.parse(match[0]) as string[];
}

async function main() {
  const testGrep = await searchContent({ action: 'grep', pattern: 'solutions engineer' });
  if (testGrep.ok && !Array.isArray(testGrep.data) && 'matches' in testGrep.data) {
    console.log(`[debug] info root confirmed - ${testGrep.data.matches.length} grep hits\n`);
  }

  const glossary = loadGlossary();
  const termGlossary = glossary.termMappings.length
    ? glossary.termMappings.map((m: { jdTerm: string; synonyms: string[] }) => `  - "${m.jdTerm}" → ${m.synonyms.map((s: string) => `"${s}"`).join(', ')}`).join('\n')
    : '';
  console.log(`[glossary] ${glossary.termMappings.length} term mappings loaded\n`);

  const backgroundContext = loadBackgroundContext();
  console.log(`[debug] ${backgroundContext.length} chars background context\n`);

  const existing = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  console.log(`[existing] fitScore: ${existing.fitScore}, url: ${existing.jobDescriptionUrl}\n`);

  console.log('Running analyzeJdFit...\n');
  const result = await analyzeJdFit({
    jobUrl: existing.jobDescriptionUrl,
    focus: 'all',
    outputPerspective: 'applicant',
    backgroundContext,
    termGlossary: termGlossary || undefined,
  });

  if (!result.ok) {
    console.error('analyzeJdFit failed:', result.error);
    process.exit(1);
  }

  const fit = result.data;
  console.log(`[score] ${fit.fitScore}/100 (was ${existing.fitScore}/100)\n`);

  console.log('Generating summary bullets...\n');
  const summary = await generateSummary(
    fit.roleTitle,
    'Notion',
    fit.fitScore,
    existing.strengths,
    fit.recommendedRoleFraming,
  );

  const updated = {
    ...existing,
    fitScore: fit.fitScore,
    dimensions: fit.dimensions,
    summary,
  };

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2));
  console.log(`[saved] ${CONFIG_PATH}`);
  console.log(`\nUpdated: fitScore ${existing.fitScore} → ${fit.fitScore}, added dimensions + summary\n`);
}

main().catch(console.error);
