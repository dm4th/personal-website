/**
 * Generates page-config.json for 5 Perplexity roles by running the full
 * analyzeJdFit pipeline and synthesizing the output into the JobApplicationConfig schema.
 *
 * Usage: node --env-file=.env.local ./node_modules/.bin/tsx scripts/generate-perplexity-configs.ts
 */
import Anthropic from '@anthropic-ai/sdk';
import { analyzeJdFit } from '../lib/agent/tools/analyzeJdFit';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function shortId(): string {
  return crypto.randomBytes(6).toString('hex');
}

// ─── Role Definitions ─────────────────────────────────────────────────────────

const ROLES = [
  {
    slug: 'perplexity-pm-builder',
    jobDescriptionUrl: 'https://jobs.ashbyhq.com/perplexity/f25e190e-0508-4707-b575-fcaed358dc13',
    jd: `Product Manager (Builder)
Company: Perplexity
Location: San Francisco / Palo Alto
Department: Product Management

PERPLEXITY IS LOOKING FOR PRODUCT MANAGERS TO JOIN A HIGHLY LEVERAGED, SMALL TEAM FOR BUILDING NEW PRODUCTS THAT INNOVATE TO ACCELERATE HUMAN PRODUCTIVITY.

In 2026, we launched Computer, the defining product for the new era of agentic AI. We've scaled beyond the millions of people using Perplexity every day for research, shopping, investing and curiosity into a new paradigm of using AI to transform knowledge into action.

Product managers at Perplexity work closely with design and engineering, focusing on the core Computer and search experience. The ideal candidate should have strong communication and writing skills, the ability to envision innovative technology, and willingness to reimagine work to be more efficient and creative. Ideal candidates have a passion in a particular industry that they are domain experts in: in the application please highlight which industry you are most interested in innovating.

WHAT YOU'LL DO
- Anticipate opportunities for innovation and value in enterprise industries.
- Envision new experiences and deliver a long-term vision.
- Understanding of levers for product-led growth and retention.
- Work closely with engineering and design to align product expectations and capabilities.
- Work with research to evaluate and steer nondeterministic models into the high value outcomes for users.
- Work with data and user research to understand quantitative and qualitative data.
- Have conviction to make difficult product decisions in the face of uncertainty.

QUALIFICATIONS
- Strong experience with product management and leadership.
- Strong experience working with data and metrics.
- Experience with productivity and knowledge work products.
- Experience with prototyping and data visualization.
- Experience with building data driven flywheels for iterative improvement.
- Thrives in a small, agile team: has initiative and desire for ownership.
- 4+ years of product management experience.`,
  },
  {
    slug: 'perplexity-forward-deployed-engineer',
    jobDescriptionUrl: 'https://jobs.ashbyhq.com/perplexity/aa511ea8-96e3-42ba-b28f-5e222170bcee',
    jd: `Member of Technical Staff (Forward Deployed Engineer, Applied AI)
Company: Perplexity
Location: New York City / San Francisco
Department: Engineering

INTRODUCTION
Perplexity is building AI systems that integrate directly into how enterprises operate. Our API Platform powers search, retrieval, and automation across structured and unstructured data, while Perplexity Computer extends this into the execution of an AI system that navigates tools, interacts with applications, and completes multi-step workflows. Together, these platforms form a new integration layer, connecting models, data, and enterprise systems into end-to-end workflows.

ABOUT THE ROLE
We're looking for Forward Deployed Engineers to work directly with customers to design and deploy these integrations in production. You'll embed with teams, connect Perplexity into their existing stack, and build systems that automate real work.

This role spans two closely connected areas:
- API Platform: integrating search, retrieval, and AI capabilities into enterprise systems
- Perplexity Computer: deploying agentic workflows that operate across tools, applications, and data

RESPONSIBILITIES
- Design, build, and deploy end-to-end integrations between Perplexity and enterprise systems (data platforms, internal tools, SaaS applications), translating business workflows into production-grade AI systems
- Work directly with customer teams to embed AI into existing processes, owning deployments from initial architecture through production rollout and ongoing optimization
- Develop and operationalize integrations using APIs, event-driven architectures, and workflow orchestration, including deploying Perplexity Computer for multi-step, agent-driven workflows across tools and environments
- Design and build production systems that combine retrieval, reasoning, and execution across enterprise environments, applying deep expertise in LLM capabilities, implementation patterns, and the AI stack to drive performance, security, and customer impact
- Debug and resolve issues across APIs, infrastructure, and external dependencies, ensuring reliability, performance, and scalability in production
- Prototype new integration patterns and build reusable architectures that accelerate adoption across customers
- Partner with Sales and Product to unlock new use cases, drive expansion, and translate deployment learnings into product and platform improvements

WHAT WE'RE LOOKING FOR
- 5+ years of experience in software engineering, forward deployed engineering, solutions engineering, or similar roles, with a track record of building and shipping production systems in customer-facing environments
- Strong programming ability in Python (plus one of JavaScript/TypeScript, Java, etc.) with experience developing integrations, prototypes, and scalable applications
- Deep experience with APIs and distributed systems, including authentication, latency optimization, and debugging across complex, multi-system environments
- Production experience building LLM-powered systems, including prompt engineering, agent workflows, evaluation, and deploying AI systems at scale
- Proven ability to design and implement automated, end-to-end workflows that integrate across enterprise systems and replace manual processes
- High ownership and ability to operate in ambiguous environments, with strong system design, rapid prototyping skills, and end-to-end execution
- Excellent communication and collaboration skills, with experience working cross-functionally and engaging both technical teams and executive stakeholders

NICE-TO-HAVES
- Experience with search systems, retrieval-augmented generation (RAG), or AI/ML APIs
- Background in developer tools, platform engineering, or high-scale/low-latency system design
- History of working at startups or small teams, owning customer projects end-to-end
- Experience with enterprise IT systems or AI deployment patterns in regulated industries (finance, healthcare, life sciences)`,
  },
  {
    slug: 'perplexity-developer-relations-manager',
    jobDescriptionUrl: 'https://jobs.ashbyhq.com/perplexity/bf58f336-d644-4679-a771-69db80c7694f',
    jd: `Developer Relations Manager - Perplexity API Platform
Company: Perplexity
Location: San Francisco
Department: Go-to-Market / Developer Relations

Perplexity's APIs power the AI behind every Samsung on-device experience — across one billion devices — and are trusted by a growing roster of Fortune 500s. We went from a single Sonar API to a full platform: Search API, Agent API, Embeddings, and more. That growth didn't happen by accident, and it isn't slowing down.

We're looking for the person who will own the next chapter: making Perplexity's API platform the default choice for developers building the next generation of AI-native products.

WHAT YOU'LL OWN

BE THE FACE OF PERPLEXITY'S API PLATFORM
- Represent our APIs at conferences, hackathons, and developer meetups — not as a booth rep, but as a credible builder who has shipped with our stack.
- Run workshops, AMAs, and webinars that go deep on the Search API, Agent API, Embeddings, and MCP server.
- Amplify developer projects publicly — on X, Discord, Reddit, and wherever the best builders congregate.

BUILD AND OPERATE THE COMMUNITY
- Own our developer forum, Discord, and Reddit presence — triage, moderate, and make sure no high-signal question goes unanswered.
- Organize hackathons and build nights. Handle everything from prize scoping and API credit grants to live event support and post-event ROI writeups.
- Convert repeated questions and friction points into docs updates, Cookbook examples, and better onboarding — close the loop between community and product.

SHIP DEVELOPER EDUCATION THAT ACTUALLY WORKS
- Write tutorials, changelogs, and technical blog posts that developers forward to each other — not marketing copy dressed up as docs.
- Build and maintain Cookbook examples: RAG pipelines, agent workflows, multi-provider SDK demos, n8n integrations, MCP starters — things developers can run on day one.
- Coordinate launch content across docs, social, Discord, and forum so every API release lands consistently and builds momentum.

TRANSLATE DEVELOPER SIGNAL INTO PRODUCT REALITY
- Sit with developers to troubleshoot integrations — and synthesize those conversations into structured feedback for product and engineering.
- Monitor the competitive landscape and surface differentiation opportunities for GTM and product teams.
- Maintain the partner integration pipeline and help scale the Startups credits program beyond its current manual state.

ABOUT YOU
- 4+ years in DevRel or Developer Advocacy with measurable results — you can name the campaigns and quote the outcomes.
- You've shipped code. Comfortable with API integrations, SDKs, and modern web tooling. You can read a diff, write a working example, and spot when docs are wrong.
- Exceptional communicator across formats — conference talk, changelog entry, Reddit reply — all in the same day.
- Operationally sharp. You've managed community platforms, run event logistics, and kept multiple workstreams moving without things falling through the cracks.
- Growth-minded. You connect every initiative to business impact and you've built or meaningfully improved a developer activation funnel.
- Collaborative by default. You thrive at the intersection of product, engineering, and marketing — and you're comfortable pushing back when developer needs aren't being met.`,
  },
  {
    slug: 'perplexity-solutions-pmm',
    jobDescriptionUrl: 'https://jobs.ashbyhq.com/perplexity/9e3a4516-b893-4579-9a6a-3720658e4b6d',
    jd: `Solutions Product Marketing Manager
Company: Perplexity
Location: San Francisco / New York City
Department: Marketing

Perplexity is changing how enterprises adopt AI. We're seeking a Solutions Product Marketer to own GTM strategy for our highest-priority verticals, Finance, Healthcare, Legal, and Consulting. You'll go deep on buying motions, use cases, and competitive dynamics, translating insight into campaigns, content, and sales enablement that systematically win each industry. This role sits at the intersection of marketing, sales strategy, and product.

You will:
- Own vertical GTM as a system, not one-off campaigns
- Map how enterprise buyers in each vertical evaluate, purchase, and deploy AI, personas, decision processes, and competitive alternatives
- Build and run vertical awareness campaigns across paid, organic, and owned channels, including webinars, landing pages, and industry-specific creative
- Arm enterprise sales with battle cards, objection handling, persona-specific talk tracks, and deal-stage content that moves revenue
- Develop opinionated thought leadership positioning Perplexity as the authority on AI adoption in each vertical
- Instrument and measure vertical performance: pipeline sourced, conversion rates, engagement iterating weekly based on data

Qualifications:
- 5+ years of product marketing experience, B2B preferred
- Proven track record building and executing vertical or industry-specific GTM strategies that drove measurable pipeline
- Deep understanding of enterprise buying motions, comfortable with long sales cycles, multi-stakeholder deals, and C-suite messaging
- Exceptional storytelling and writing skills, able to distill complex capabilities into simple, compelling narratives across decks, one-pagers, videos, and ROI models
- Advanced proficiency using AI tools to drive marketing outcomes
- Collaborative, low-ego operator who thrives in fast-paced, small-team environments and owns the full stack of work`,
  },
  {
    slug: 'perplexity-enterprise-csm',
    jobDescriptionUrl: 'https://jobs.ashbyhq.com/perplexity/9a570310-305d-4f4e-9807-b8862b31194b',
    jd: `Enterprise Customer Success Manager
Company: Perplexity
Location: San Francisco
Department: Enterprise

We are looking for an experienced Enterprise Customer Success Manager to join our Enterprise team. In this crucial role, you'll be responsible for executing onboarding and adoption strategies through key client ownership across our Enterprise clientele. The ideal candidate will have a proven track record in tech of driving enterprise-level engagement, retention, and growth.

You will work closely with other members of the Enterprise team, making strong communication and collaboration skills vital. A core sense of conviction and a "can-do" attitude are prerequisites. Your success will play a crucial part in expanding Perplexity's market presence and contributing to the company's overall success.

RESPONSIBILITIES
- Execute the Enterprise customer success strategy developed by leadership
- Serve as a primary point of contact for key enterprise clients
- Drive initial enablement through high quality onboarding and training
- Identify and support opportunities for growth and client expansion
- Manage retention, working with clients to quantify value delivered
- Advocate for client needs, and collaborate with cross-functional teams to drive product development
- Monitor and report on established key performance indicators, analyze data to identify trends

REQUIREMENTS
- 5+ years experience in Customer Success or Account Management roles at scaling tech companies, specifically working with enterprise clients
- Proven track record of driving enterprise-level satisfaction, growth, and retention
- Excellent communication and presentation skills, with the ability to engage C-level executives
- A self-starter by nature, comfortable dealing with ambiguity and juggling multiple initiatives.
- Ability to work under pressure, thriving in demanding environments
- Ability to work independently and as part of a collaborative team
- Proficiency in CRM systems and customer success tools`,
  },
];

// ─── Background context (same files as analyze-jd.ts) ─────────────────────────

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

// ─── Available projects for reference ─────────────────────────────────────────

const AVAILABLE_PROJECTS = [
  {
    name: 'Healthcare Agent Data Layer',
    path: '/projects/healthcare-agent-data-layer',
    description: 'MCP-native healthcare agent data layer research project, 2 years of independent work designing the enterprise AI infrastructure layer for healthcare payer/provider workflows.',
  },
  {
    name: 'Personal Website Agent',
    path: '/',
    description: 'Full-stack AI agent built on the Anthropic SDK with tool use, streaming, RAG pipeline, and multiple LLM backends. The agent represents Dan in conversations about his career.',
  },
  {
    name: 'Dental Eligibility Intelligence',
    path: '/projects/dental-eligibility',
    description: 'Production hybrid-RAG system achieving 95% accuracy on a live healthcare billing workflow within 2 days. Designed for convergent determinism as human-verified outputs accumulated.',
  },
  {
    name: 'AI Meeting Intelligence',
    path: '/projects/notion-meeting-intelligence',
    description: 'Claude Code-based multi-agent pipeline that turns meeting recordings into structured deal intelligence in Notion, with automated field-to-engineering feedback.',
  },
  {
    name: 'DocWow',
    path: '/projects/docwow',
    description: 'AI document processing application.',
  },
];

// ─── Page-config synthesis ─────────────────────────────────────────────────────

interface PageConfigContent {
  fitScoreNote: string;
  summary: string[];
  strengths: Array<{ title: string; description: string; citations: Array<{ label: string; path: string }> }>;
  weaknesses: Array<{ title: string; description: string; mitigation: string }>;
  referralBlurb: string;
  projects: Array<{ name: string; path: string; relevance: string }>;
}

async function synthesizePageConfig(
  role: { slug: string; jd: string; jobDescriptionUrl: string },
  fitScore: number,
  dimensions: Record<string, { score: number; rationale: string; citations: string[] }>,
  rawStrengths: Array<{ point: string; evidence: Array<{ file: string; excerpt: string }> }>,
  rawGaps: Array<{ point: string; mitigation?: string }>,
  suggestedTalkingPoints: string[],
  recommendedRoleFraming: string,
  backgroundContext: string,
): Promise<PageConfigContent> {
  const dimensionSummary = Object.entries(dimensions)
    .map(([k, v]) => `${k}: ${v.score}/10 — ${v.rationale}`)
    .join('\n');

  const strengthsText = rawStrengths.map((s) => `- ${s.point}`).join('\n');
  const gapsText = rawGaps.map((g) => `- ${g.point}${g.mitigation ? ` (mitigation: ${g.mitigation})` : ''}`).join('\n');

  const availableProjects = AVAILABLE_PROJECTS.map((p) => `- ${p.name}: ${p.description}`).join('\n');

  const resp = await client.messages.create({
    model: process.env.AGENT_MODEL ?? 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are generating structured content for a professional job application referral page for Dan Mathieson applying to "${role.slug.replace(/-/g, ' ')}" at Perplexity.

WRITING VOICE: Write in FIRST PERSON as Dan. No em-dashes. Use hyphens or colons instead.

Dimension Scores (already computed, fitScore=${fitScore}/100):
${dimensionSummary}

Key Strengths identified:
${strengthsText}

Gaps identified:
${gapsText}

Suggested talking points: ${suggestedTalkingPoints.join('; ')}
Recommended framing: ${recommendedRoleFraming}

Available projects to reference:
${availableProjects}

JD context (first 3000 chars):
${role.jd.slice(0, 3000)}

Generate a JSON object with NO markdown fences:
{
  "fitScoreNote": "2-3 sentence thesis of fit, first-person, referencing specific evidence",
  "summary": ["5 crisp achievement bullets, first-person, with metrics where possible"],
  "strengths": [
    {
      "title": "Short strength title (5-10 words)",
      "description": "2-3 sentences first-person, specific evidence with metrics and context",
      "citations": [{ "label": "Short label for the source", "path": "/info/career/..." }]
    }
  ],
  "weaknesses": [
    {
      "title": "Gap title",
      "description": "1-2 sentences acknowledging gap honestly",
      "mitigation": "How I would address this directly and specifically"
    }
  ],
  "referralBlurb": "250-350 word third-person referral recommendation for a Perplexity hiring manager. Lead with the most compelling differentiator. End with a clear recommendation.",
  "projects": [
    {
      "name": "Project name from the available list",
      "path": "/projects/...",
      "relevance": "1 sentence connecting this project to THIS specific role"
    }
  ]
}

Rules:
- strengths: 4-5 items, grounded in the dimension rationale and background context
- weaknesses: 2-3 items, each with concrete mitigation
- projects: pick the 2-3 most relevant from the available list
- citations in strengths should use real /info paths from the dimension citations
- No em-dashes anywhere`,
      },
    ],
  });

  const text = resp.content[0]?.type === 'text' ? resp.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Synthesis returned no JSON');
  return JSON.parse(jsonMatch[0]) as PageConfigContent;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function processRole(
  role: (typeof ROLES)[number],
  backgroundContext: string,
  index: number,
  total: number,
): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[${index + 1}/${total}] Analyzing: ${role.slug}`);
  console.log('='.repeat(60));

  const result = await analyzeJdFit({
    jobDescription: role.jd,
    focus: 'all',
    outputPerspective: 'applicant',
    backgroundContext,
  });

  if (!result.ok) {
    console.error(`ERROR analyzing ${role.slug}: ${result.error}`);
    return;
  }

  const { fitScore, dimensions, strengths, gaps, suggestedTalkingPoints, recommendedRoleFraming } = result.data;
  console.log(`\nFit score: ${fitScore}/100`);
  console.log('Dimension scores:');
  Object.entries(dimensions).forEach(([k, v]) => console.log(`  ${k}: ${v.score}/10`));

  console.log('\nSynthesizing page-config content...');
  const content = await synthesizePageConfig(
    role,
    fitScore,
    dimensions as Record<string, { score: number; rationale: string; citations: string[] }>,
    strengths,
    gaps,
    suggestedTalkingPoints,
    recommendedRoleFraming,
    backgroundContext,
  );

  const pageConfig = {
    id: shortId(),
    company: 'Perplexity',
    companyLogoUrl: 'https://www.google.com/s2/favicons?domain=perplexity.ai&sz=128',
    role: result.data.roleTitle,
    appliedDate: '2026-05',
    fitScore,
    fitScoreNote: content.fitScoreNote,
    dimensions: dimensions as Record<string, { score: number; rationale: string; citations: string[] }>,
    summary: content.summary,
    jobDescriptionUrl: role.jobDescriptionUrl,
    jobDescriptionText: role.jd,
    strengths: content.strengths,
    weaknesses: content.weaknesses,
    referralBlurb: content.referralBlurb,
    projects: content.projects,
    applicationQuestions: [],
    resumeFile: 'Dan Mathieson Resume.pdf',
    coverLetterFile: 'Dan Mathieson Cover Letter.pdf',
  };

  const dir = path.join(process.cwd(), 'job-applications', role.slug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const configPath = path.join(dir, 'page-config.json');
  fs.writeFileSync(configPath, JSON.stringify(pageConfig, null, 2));
  console.log(`Saved: ${configPath}`);
}

async function main() {
  console.log('Loading background context...');
  const backgroundContext = loadBackgroundContext();
  console.log(`Loaded ${backgroundContext.length} chars of background context\n`);

  for (let i = 0; i < ROLES.length; i++) {
    await processRole(ROLES[i], backgroundContext, i, ROLES.length);
  }

  console.log('\n\nAll roles processed.');
}

main().catch(console.error);
