/**
 * One-off script: creates the "How Job Scoring Works" explanation page
 * in Notion under the Job Hunt 2026 parent page.
 *
 * Usage: node --env-file=.env.local ./node_modules/.bin/tsx scripts/create_scoring_doc.ts
 */

import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const PARENT_PAGE_ID = '34bfc8f4-554c-805b-8a5b-cf894a9c3230';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type B = any;

const h1 = (text: string): B => ({ object: 'block', type: 'heading_1', heading_1: { rich_text: [{ type: 'text', text: { content: text } }] } });
const h2 = (text: string): B => ({ object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: text } }] } });
const h3 = (text: string): B => ({ object: 'block', type: 'heading_3', heading_3: { rich_text: [{ type: 'text', text: { content: text } }] } });
const p = (text: string): B => ({ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: text } }] } });
const bullet = (text: string): B => ({ object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: text } }] } });
const divider = (): B => ({ object: 'block', type: 'divider', divider: {} });
const callout = (text: string, emoji: string): B => ({
  object: 'block', type: 'callout',
  callout: { icon: { type: 'emoji', emoji }, rich_text: [{ type: 'text', text: { content: text } }] },
});

const blocks: B[] = [
  callout(
    'This page explains how the automated job fit scoring pipeline works, what the scores mean, and known limitations to keep in mind when interpreting results.',
    'ℹ️',
  ),
  divider(),

  h1('How the Pipeline Works'),
  p('Each job opportunity is processed through a 5-step pipeline that runs automatically via npm run jobs:process, or when a visitor submits a lead via the website agent.'),

  h3('Step 1 — Fetch the Job Posting'),
  p('The script fetches the job description using ATS-specific APIs where possible to get clean text rather than scraping JavaScript-rendered HTML:'),
  bullet('Ashby: Public GraphQL API (jobs.ashbyhq.com/api/non-user-graphql)'),
  bullet('Greenhouse: REST API (boards-api.greenhouse.io/v1/boards/{company}/jobs/{id})'),
  bullet('Lever: REST API (api.lever.co/v0/postings/{company}/{id})'),
  bullet('Other: HTML scrape with tag stripping — JS-rendered pages may return empty content'),

  h3('Step 2 — Strip Company Boilerplate'),
  p('Most postings open with a generic "About Us" section identical across roles at the same company. This is the primary cause of same-company scores clustering. The pipeline detects common section headers ("The Role", "Responsibilities", "What You\'ll Do", etc.) and trims everything before them, preserving only a brief company identifier. Check the 📄 Job Description toggle on each page to see exactly what text was analyzed.'),

  h3('Step 3 — Extract Role Requirements (Haiku)'),
  p('Claude Haiku reads the cleaned JD and extracts: role title, company, 4–8 role-specific search terms, and structured requirements across technical, leadership, and cultural dimensions. The extraction prompt explicitly instructs the model to ignore company boilerplate and focus on what this specific role requires from a candidate.'),

  h3('Step 4 — Search Dan\'s Background'),
  p('Two evidence sources run in parallel:'),
  bullet('Keyword grep: each extracted search term is matched against Dan\'s /info markdown files for specific mentions with file + line context'),
  bullet('Background context: the full text of Dan\'s key career files (Smarter Technologies, Thoughtful AI, Action Network, Google, Strengths & Weaknesses) is passed directly into the synthesis prompt as primary grounding'),

  h3('Step 5 — Synthesize Assessment (Sonnet)'),
  p('Claude Sonnet synthesizes the fit score and structured output using both sources. An explicit calibration rubric is passed to avoid conservative under-scoring.'),
  divider(),

  h1('Scoring Rubric'),
  p('Scores are calibrated to be realistic, not pessimistic. A 70 means Dan is a strong candidate worth applying for. A 40 means genuine gaps exist but transferable skills are present.'),
  bullet('80–100: Strong match — most requirements met, minor gaps only. Apply confidently.'),
  bullet('60–79: Good match — core requirements met, some genuine gaps. Apply with targeted framing.'),
  bullet('40–59: Partial match — relevant background but meaningful gaps. Worth applying if the role is compelling; address gaps directly.'),
  bullet('20–39: Weak match — some transferable skills but significant gaps. Only pursue with a strong internal champion.'),
  bullet('0–19: Poor match — most requirements unmet.'),
  callout(
    'Read the Strengths and Gaps sections — they contain more signal than the number itself. A 65 with strong SE strengths is more actionable than a 70 with thin evidence.',
    '⚠️',
  ),
  divider(),

  h1('Known Limitations'),

  h3('Same-company scores clustering'),
  p('If two roles at the same company score identically, company boilerplate likely survived the stripping step. The heuristic depends on standard section headers — postings that use non-standard structure will pass the full text through. Check the 📄 Job Description toggle to verify.'),

  h3('JS-rendered pages fail silently'),
  p('Workday, iCIMS, and custom career pages render content client-side. The scraper returns empty text and scores will be meaninglessly low. For these: paste the JD text directly using the generate_application_materials agent tool on the website (requires sign-in), or paste the text into the Notion page and run reprocess.'),

  h3('Grep evidence can be sparse'),
  p('Grep does exact string matching. If the JD says "GTM" but Dan\'s files say "go-to-market," those terms will not hit. This is why Dan\'s career files are also passed as direct background context — but the specific file-level evidence cited in Strengths may sometimes be thin even when the overall score is high.'),

  h3('Scores shift with /info content updates'),
  p('As Dan updates his /info markdown files, re-running jobs:reprocess will produce different scores. Scores are point-in-time assessments tied to the current content.'),
  divider(),

  h1('Page Structure'),
  p('Each analyzed opportunity page follows this layout:'),
  bullet('📄 Job Description (raw) — collapsed toggle with the exact JD text that was analyzed'),
  bullet('─── divider ───'),
  bullet('Application Materials — Fit Score: X/100 — main heading'),
  bullet('Cover Letter — tailored draft in first person as Dan'),
  bullet('Strengths — specific strengths with file-level evidence from /info'),
  bullet('Gaps & Mitigations — honest gaps with suggested mitigation framing'),
  bullet('Interview Talking Points — 3–5 specific talking points'),
  bullet('Recommended Role Framing — 1–2 sentence positioning recommendation'),
  divider(),

  h1('CLI Commands'),
  bullet('npm run jobs:dry-run — preview what would be processed without writing to Notion'),
  bullet('npm run jobs:process — generate materials for all Not Started opps without existing analysis'),
  bullet('npm run jobs:reprocess — force-regenerate all Not Started opps (appends a new section; delete old blocks first for a clean slate)'),
];

async function main() {
  const page = await notion.pages.create({
    parent: { page_id: PARENT_PAGE_ID, type: 'page_id' },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties: { title: { title: [{ text: { content: '📊 How Job Scoring Works' } }] } } as any,
    children: blocks.slice(0, 100),
  });
  console.log('Created page:', page.id);

  if (blocks.length > 100) {
    await notion.blocks.children.append({ block_id: page.id, children: blocks.slice(100) });
    console.log('Appended remaining blocks');
  }

  console.log(`Done: https://notion.so/${page.id.replace(/-/g, '')}`);
}

main().catch((e) => {
  console.error('Error:', e.message ?? e);
  process.exit(1);
});
