/**
 * JD fit analysis script. Update the JD constant below and run to score a job description.
 * Usage: node --env-file=.env.local ./node_modules/.bin/tsx scripts/analyze-jd.ts
 */
import Anthropic from '@anthropic-ai/sdk';
import { analyzeJdFit } from '../lib/agent/tools/analyzeJdFit';
import { searchContent } from '../lib/agent/tools/searchContent';
import fs from 'fs';
import path from 'path';

const _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const JD = `
Technical Project Manager
Company: 8090 Solutions
Location: California, United States (On-site, Redwood City CA or Toronto Canada)
Employment Type: Full-time
Compensation: $150,000 – $250,000 + stock and/or stock options + benefits

About 8090
At 8090, we identify inefficiencies in enterprise operations and deliver AI-powered solutions tailored to each problem. Co-founded and led by Chamath Palihapitiya, we're building a Software Factory that can generate complete software solutions from initial concepts, eliminating the bloated complexity and overhead of traditional software development.

The Opportunity
We are hiring an exceptional Technical Product Manager to join 8090 in a mission-critical, customer-centric role. Our TPMs operate as forward-deployed product leaders, owning the full lifecycle of AI-first enterprise solutions, from early discovery through live deployment and iteration in production environments.

Location
You will work in person from Redwood City, CA or Toronto, Canada, partnering closely with small, high-leverage engineering teams while leading complex customer engagements inside large enterprises.

This role is central to how 8090 delivers value. It requires strong product fundamentals and the ability to move into hands-on solution creation:

Discovery & Solution Definition: Partner with sales teams during pre-contract discovery to identify technical risks (APIs, integrations, data requirements) and create PRD Lights that accurately scope projects. Transform ambiguous business needs into actionable requirements that guide both sales commitments and engineering delivery.
Execution Excellence: Own end-to-end execution under real-world constraints, establishing governance, coordinating cross-functional teams, and driving on-time, high-quality delivery. Act as the primary customer interface, managing expectations and escalations when needed from pre-contract discovery through production deployment.
Technical and Analytical Judgement: Bring lived experience building enterprise software, ideally including non-deterministic, data-driven systems, to make sound architectural and product decisions. Apply analytical rigor to evaluate trade-offs, measure outcomes, and guide teams through complexity and uncertainty.

Key Responsibilities
- Lead discovery with prospective and committed customers to identify technical risks (APIs, integrations, data availability, security constraints) and create accurate, execution-ready PRDs.
- Translate ambiguous business problems into concrete solution designs, including building or contributing to live POCs when needed.
- Partner closely with engineering to validate feasibility, reduce ambiguity, and accelerate delivery.
- Drive execution under real-world constraints: resources, timelines, and enterprise governance.
- Own project governance, success metrics, and delivery milestones from pre-sales through production.
- Serve as the primary interface with customers, facilitating discovery workshops, steering committees, and executive reviews.
- Create and deliver tailored communications ranging from executive-level project updates to detailed iteration plans.
- Anticipate and surface "unforced errors" early (missing data, undocumented APIs, unrealistic assumptions) to prevent downstream delivery risk.
- Balance speed and rigor in discovery, moving fast without compromising solution integrity.

What Sets You Apart
- Demonstrated success delivering enterprise software solutions end-to-end, ideally involving AI/ML systems.
- Ability to build and deploy solutions inside complex enterprise environments, not just design them.
- Strong technical intuition and credibility with senior engineers.
- Experience operating effectively with small internal teams and large, demanding customer organizations.
- Clear, confident communicator at both executive and technical levels.
- Domain expertise in Health and Life Sciences industries.

Qualifications
- 5+ years of experience in Product Management with emphasis on enterprise software creation.
- Proven ownership of the full product lifecycle, from discovery through production and iteration.
- Strong technical background with hands-on exposure to software systems.
- Exceptional written and verbal communication, with a history of impactful stakeholder management.
- Familiarity with data science, ML concepts, and non-deterministic systems in real deployments.
`;

// ─── Historical JDs to seed into the glossary ────────────────────────────────
// Past JDs whose terms should be extracted and merged into the running glossary.
// Add entries here whenever a previously-analyzed JD isn't yet represented.

const HISTORICAL_JDS: Array<{ role: string; company: string; jd: string }> = [
  {
    role: 'AI Strategist, Healthcare Solutions',
    company: 'Distyl AI',
    jd: `
AI Strategist, Healthcare Solutions — Distyl AI
Location: San Francisco; New York. Hybrid. $150K-$250K base + equity.
Key requirements: 8-12 years SE/solutions/PM at intersection of business and technology, deep direct healthcare experience (payer ops, provider workflows, health tech). Technical undergrad (CS/engineering/math). Hands-on GenAI (LLM pipelines, prompt engineering, RAG). Python/SQL/pandas. Healthcare-specific data formats (EDI, FHIR). Prior auth, claims adjudication, UM workflows. GTM engine building, demo and POC construction on Distillery platform. 0-to-1 mode. C-suite communication. 50% travel.
    `,
  },
  {
    role: 'Solutions Engineer, Healthcare & Life Sciences',
    company: 'OpenAI',
    jd: `
Solutions Engineer, Healthcare & Life Sciences
Location: San Francisco, CA
Employment Type: Full time
Location Type: Hybrid
Department: Go To Market
Compensation: Zone A $221K – $278K + Equity

About the Team
The Technical Success team is responsible for the customer experience on the OpenAI suite of products, ensuring developers and enterprises maximize benefit, value, and adoption from our highly-capable models.

About the Role
We are seeking a solutions engineer to partner with our largest Healthcare & Life Sciences customers and ensure they achieve tangible business value from our models through the OpenAI suite of products. You will partner with senior business stakeholders to understand their pre-sales needs, guide their AI strategy, and identify the highest value use cases and applications. You will work with business and technical teams to demonstrate the value of our solutions and recommend architectural patterns to kickstart their implementation and development. You will work closely with Healthcare & Life Sciences and Large Enterprise Sales, Security, and Product teams.

In this role, you will:
- Deliver an exceptional pre-sales customer experience for large Healthcare & Life Sciences prospects and customers by providing technical expertise, outlining the value proposition, and answering product, API, and LLM-related questions.
- Demonstrate how leveraging OpenAI's suite of products can meet customers' business needs and deliver substantial business value. This includes building and presenting demos, scoping use cases, recommending architecture patterns, and providing in-depth technical advisory.
- Create and maintain documentation, guides, and FAQs related to common questions and requirements discovered during the pre-sales process.
- Develop and nurture strong customer relationships during the evaluation, validation, and purchasing process.
- Foster customer advocacy and represent the voice of the customer with internal teams by gathering and relaying customer feedback, identifying themes across customers, and incorporating them into product planning.
- Serve as the first line of defense for security and compliance questions, explaining standardized collateral, guiding customers toward relevant resources (e.g., trust portal), and escalating complex requirements to the appropriate teams.

You'll thrive in this role if you:
- Have 10+ years of experience in a technical pre-sales or similar role, including 3+ years selling to Healthcare & Life Sciences customers, managing C-level technical and business relationships with complex global organizations.
- Demonstrate a thorough understanding of IT security principles and customer requirements for technical B2B SaaS products, with experience providing higher-level security and compliance support.
- Have foundational training in programming languages like Python or Javascript.
- Have delivered prototypes of Generative AI/traditional ML solutions and have knowledge of network/cloud architecture.
- Are an effective presenter and communicator who can translate business and technical topics to all audiences, including senior leaders.
- Own problems end-to-end and are willing to pick up whatever knowledge you're missing to get the job done.
- Have a humble attitude, an eagerness to help your colleagues, and a desire to do whatever it takes to make the team succeed.
    `,
  },
  {
    role: 'GTM AI + Innovation Manager',
    company: 'Notion',
    jd: `
GTM AI + Innovation Manager
Location: San Francisco, California; New York, New York
Employment Type: Full time
Department: Revenue Operations & Strategy

About the Role:
As GTM AI & Innovation Manager, you will support revenue growth by architecting and implementing AI-powered solutions that enhance our GTM team's effectiveness and accelerate customer acquisition. Working closely with GTM teams, Business Technology, Data Science and Automations Engineering, you'll help develop innovative approaches to leverage AI for improving sales processes and optimizing customer outcomes.

You'll partner with sales leadership to identify opportunities where AI and automation can transform how we generate revenue and acquire customers. Your role will focus on designing, testing, and scaling AI-driven solutions that help our sales team work more efficiently. You'll execute builds or collaborate with engineers to launch and iterate on solutions, while helping shape our thinking on AI workflows, agents, and modern tools that make our GTM motion more effective.

What You'll Achieve:
- Systems Thinking: Understand how to design systems that meet field sellers, marketers and post-sales resources where they do their daily work, maximizing our existing tool stack and balancing with internal builds
- Hands-On Building: Work alongside engineering to build out prototype and production-grade systems, leverage industry-leading tools and technical skills to ship continuously
- Cross-Functional Collaboration: Bridge technical and commercial teams, gathering technical requirements while ensuring solutions deliver real business value
- Ongoing Enablement: Communicate enhancements to revenue teams and encourage adoption through continuous learning, act as an internal advocate for AI adoption
- ROI Measurement: Track and optimize the pipeline and revenue impact of AI and automation implementations across GTM

Skills You'll Need to Bring:
- 3-5 years of work experience in a technical commercial role (sales engineer, technical account manager or similar) and/or a growth engineer or product manager role with exposure to GTM systems
- Demonstrated experience building AI workflows, automation, or product solutions — you can show examples of what you've shipped and the impact it created
- Strong product management instincts and systems thinking: you naturally see how pieces fit together and can design elegant solutions
- Genuine passion for GTM engineering and the future of AI-driven selling
- High bias to action and ownership mentality: you ship quickly, iterate based on feedback, and take projects from 0 to 1
- Excellent communication skills: you can explain technical concepts to non-technical stakeholders and gather requirements from diverse teams
- Technical skills (familiarity with coding concepts, familiarity with SQL and scripting languages, familiarity with low-code tools)
- Understanding of B2B sales processes and metrics

Nice to Haves:
- Familiarity with CRM platforms (Salesforce, HubSpot) and sales engagement tools
- Experience with modern sales automation tools and AI agents
- Power user experience with Notion
- Background in sales operations, revenue operations, or sales enablement
- Experience launching new teams or new initiatives

Compensation: $150,000 - $175,000 base (SF or NYC)
    `,
  },
];

// ─── Cross-JD Glossary ───────────────────────────────────────────────────────
// Accumulated JD→practitioner vocabulary mappings from all prior runs.
// Haiku ingests this on each run and uses it to generate richer synonymTerms,
// so the vocabulary bridge improves with every new job description processed.

type GlossaryEntry = {
  jdTerm: string;
  synonyms: string[];
};

type GlossaryFile = {
  termMappings: GlossaryEntry[];
  runs: Array<{
    date: string;
    role: string;
    company: string;
    searchTerms: string[];
    synonymTerms: string[];
  }>;
};

const GLOSSARY_PATH = path.join(process.cwd(), 'scripts', 'jd-terms-glossary.json');

function loadGlossary(): GlossaryFile {
  if (!fs.existsSync(GLOSSARY_PATH)) {
    return { termMappings: [], runs: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(GLOSSARY_PATH, 'utf8')) as GlossaryFile;
  } catch {
    return { termMappings: [], runs: [] };
  }
}

function glossaryToPromptString(glossary: GlossaryFile): string {
  if (!glossary.termMappings.length) return '';
  return glossary.termMappings
    .map((m) => `  - "${m.jdTerm}" → ${m.synonyms.map((s) => `"${s}"`).join(', ')}`)
    .join('\n');
}

function saveGlossary(
  glossary: GlossaryFile,
  role: string,
  company: string,
  searchTerms: string[],
  synonymTerms: string[],
): void {
  // Merge new synonym terms into the term mapping by pairing each searchTerm with synonyms
  // that are new to the glossary (simple accumulation — no deduplication across synonym sets).
  const existingJdTerms = new Set(glossary.termMappings.map((m) => m.jdTerm.toLowerCase()));
  for (const term of searchTerms) {
    if (!existingJdTerms.has(term.toLowerCase())) {
      // Find synonyms from this run that aren't already captured for this term.
      // (We just store all synonymTerms from the run against any new JD terms —
      // the goal is to grow the vocabulary pool, not maintain a strict mapping.)
      if (synonymTerms.length > 0) {
        glossary.termMappings.push({ jdTerm: term, synonyms: synonymTerms });
        existingJdTerms.add(term.toLowerCase());
      }
    } else {
      // Merge any new synonyms into the existing entry.
      const entry = glossary.termMappings.find((m) => m.jdTerm.toLowerCase() === term.toLowerCase());
      if (entry) {
        const newSynonyms = synonymTerms.filter(
          (s) => !entry.synonyms.map((e) => e.toLowerCase()).includes(s.toLowerCase()),
        );
        entry.synonyms.push(...newSynonyms);
      }
    }
  }

  glossary.runs.push({
    date: new Date().toISOString().split('T')[0],
    role,
    company,
    searchTerms,
    synonymTerms,
  });

  fs.writeFileSync(GLOSSARY_PATH, JSON.stringify(glossary, null, 2));
  console.log(`[glossary] Saved ${glossary.termMappings.length} term mappings across ${glossary.runs.length} runs → ${GLOSSARY_PATH}\n`);
}

// ─── Extraction-only seeder ────────────────────────────────────────────────────
// Runs Haiku extraction on historical JDs and merges their terms into the glossary
// without running the full Sonnet synthesis. Safe to call every run — already-seen
// companies are skipped so costs are negligible after the first pass.

async function seedHistoricalJds(glossary: GlossaryFile): Promise<void> {
  const seenCompanyRoles = new Set(
    glossary.runs.map((r) => `${r.company}::${r.role}`),
  );

  for (const { role, company, jd } of HISTORICAL_JDS) {
    const key = `${company}::${role}`;
    if (seenCompanyRoles.has(key)) {
      console.log(`[glossary] Skipping "${role} @ ${company}" — already seeded\n`);
      continue;
    }

    console.log(`[glossary] Seeding terms for "${role} @ ${company}"...\n`);
    const resp = await _client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Extract search terms from this job description as JSON. Return ONLY valid JSON, no markdown fences.

Generate TWO sets of grep search terms — both will be run against a candidate's career files:
1. "searchTerms": 6-8 terms taken DIRECTLY from the JD's own vocabulary.
2. "synonymTerms": 8-12 practitioner/domain synonym alternatives — how an experienced candidate would describe the same concepts.

{
  "searchTerms": ["6-8 direct JD terms"],
  "synonymTerms": ["8-12 practitioner synonyms"]
}

Job Description:
${jd.slice(0, 6000)}`,
        },
      ],
    });

    const text = resp.content[0]?.type === 'text' ? resp.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn(`[glossary] Could not parse extraction for ${company} — skipping\n`);
      continue;
    }

    const { searchTerms = [], synonymTerms = [] } = JSON.parse(jsonMatch[0]) as {
      searchTerms: string[];
      synonymTerms: string[];
    };

    saveGlossary(glossary, role, company, searchTerms, synonymTerms);
    seenCompanyRoles.add(key);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Quick sanity check — confirm grep can actually find files
  const testGrep = await searchContent({ action: 'grep', pattern: 'SQL' });
  if (testGrep.ok && !Array.isArray(testGrep.data) && 'matches' in testGrep.data) {
    console.log(`[debug] grep("SQL") found ${testGrep.data.matches.length} hits in INFO_ROOT\n`);
  } else {
    console.log('[debug] grep("SQL") returned no data — INFO_ROOT may be wrong\n');
  }

  // Load cross-JD term glossary (grows with each run)
  const glossary = loadGlossary();

  // Seed any historical JDs not yet in the glossary (extraction-only, no synthesis)
  await seedHistoricalJds(glossary);
  const termGlossary = glossaryToPromptString(glossary);
  if (termGlossary) {
    console.log(`[glossary] Loaded ${glossary.termMappings.length} term mappings from ${glossary.runs.length} prior runs\n`);
  } else {
    console.log('[glossary] No prior runs — starting fresh glossary\n');
  }

  // Load key career files as background context so synthesis isn't grep-dependent
  const infoRoot = path.join(process.cwd(), 'info');
  const keyFiles = [
    // Core recent career — highest signal for most roles
    'career/smarter-technologies/index.md',
    'career/smarter-technologies/pipeline-management.md',
    'career/smarter-technologies/ai-se-platform.md',
    'career/thoughtful/solutions-architect.md',
    'career/thoughtful/customer-engineer.md',
    'career/thoughtful/lead-tpm.md',
    // Education + technical credentials — address degree/Python/ML gaps early
    'about-me/education/bucknell-overview.md',
    'ai-ml/cal-tech/bootcamp.md',
    // Prior career — data analytics depth, Python/pandas/SQL evidence
    'career/action-network/year-two-and-departure.md',
    // Remaining context
    'career/fanduel/revenue-team.md',
    'career/google/my-year-at-google.md',
    'about-me/strengths-and-weaknesses/self-assessment.md',
  ];
  const backgroundContext = keyFiles
    .map((f) => {
      const fullPath = path.join(infoRoot, f);
      if (!fs.existsSync(fullPath)) return '';
      return `=== ${f} ===\n${fs.readFileSync(fullPath, 'utf8')}`;
    })
    .filter(Boolean)
    .join('\n\n');

  console.log(`[debug] Loaded ${backgroundContext.length} chars of background context from ${keyFiles.length} files\n`);
  console.log('Running JD fit analysis...\n');
  const result = await analyzeJdFit({
    jobDescription: JD,
    focus: 'all',
    outputPerspective: 'applicant',
    backgroundContext,
    termGlossary: termGlossary || undefined,
  });
  if (!result.ok) {
    console.error('Error:', result.error);
    process.exit(1);
  }

  console.log(JSON.stringify(result.data, null, 2));

  // Persist this run's terms back to the glossary for future runs
  if (result.extractedTerms) {
    saveGlossary(
      glossary,
      result.data.roleTitle,
      result.data.company ?? '',
      result.extractedTerms.searchTerms,
      result.extractedTerms.synonymTerms,
    );
  }
}

main().catch(console.error);
