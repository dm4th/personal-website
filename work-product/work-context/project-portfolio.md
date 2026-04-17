# Project Portfolio: AI-Augmented Sales Engineering at Scale

**Danny Mathieson | Director, Sales Engineering**
*October 2025 -- March 2026 | Smarter Technologies*

---

I spent seven months building what I believe is one of the most sophisticated AI-augmented sales engineering systems in healthcare technology. What started as a Claude Code experiment became a full operating platform: 943 commits, 23 specialized AI skills, 57 Python integration scripts, and 500+ pull requests -- all while personally managing 61 deals worth $31.8M across a two-person SE team covering the entire company pipeline.

This portfolio documents the ten major projects that comprise that system. Every number is sourced from production data: Git history, Notion databases, Fireflies transcripts, and GitHub API queries.

---

## 1. The AI-Powered Sales Engineering Operating System

### Problem

I joined Smarter Technologies as the first Director of Sales Engineering. There was no SE infrastructure: no deal tracking, no meeting analysis pipeline, no prospect management system, no repeatable processes. The company was selling eight product lines across ten healthcare verticals with a team of two. We needed to operate at the scale of a team five times our size.

### What I Built

A complete AI-native operating system for sales engineering, designed around Claude Code as an agentic copilot embedded in every workflow. The system is not a chatbot bolted onto existing tools -- it is the primary interface through which all SE work is executed, tracked, and analyzed.

The platform comprises:

- **23 specialized AI skills**, each a self-contained module with its own SKILL.md specification, Python scripts, templates, and test files. Skills range from meeting analysis and Notion sync to security questionnaire answering and automation estimation.
- **57 Python integration scripts** handling API communication with Notion, Fireflies, Google Drive, Google Sheets, Slack, and GitHub.
- **3 GitHub Actions CI/CD workflows** for automated code review, Claude integration testing, and weekly demo review generation.
- **5 parallel AI agents** for meeting intelligence (detailed in Project 2).
- **A bidirectional data sync layer** keeping Git, Notion, and Fireflies in continuous alignment.

### Technical Architecture

The system uses Claude Code's skill/agent framework as its orchestration layer. Each skill is a markdown specification that defines triggers, workflows, data sources, and output formats. Claude interprets these at runtime -- there is no compiled application, no deployment pipeline, and no infrastructure cost. The "application" is the repository itself.

State management follows a deliberate split: Notion holds deal metadata for executive visibility (stage, health, sizing, capacity planning), while Git holds technical depth (meeting analyses, pricing models, action items, technical requirements). A bidirectional sync layer reconciles the two, with README.md serving as the bridge document that exists in both systems.

### Outcomes

- **943 commits** over 7 months (Oct 2025 -- Mar 2026)
- **500+ PRs** (451 authored by me, 459 merged)
- **$31.8M** pipeline under active management
- **$1.95M** closed-won revenue
- **76 prospect directories** maintained in Git with full deal histories
- **199 demo meetings** tracked in Notion with structured metadata

### Tech Stack

Claude Code, Python 3.11, Notion API, Fireflies GraphQL API, Google Drive/Sheets API (OAuth2), GitHub Actions, Git worktrees, Slack API, Markdown/YAML configuration

---

## 2. Multi-Agent Meeting Intelligence Pipeline

### Problem

Our sales cycle generates enormous meeting volume -- 483 meetings in my Fireflies account alone, totaling 271 hours of recorded conversation. Manually extracting action items, pricing signals, technical requirements, competitive intelligence, and deal health indicators from every call was impossible at our scale. And superficial AI summaries miss the domain-specific signals that matter in healthcare RCM sales.

### What I Built

A five-agent parallel analysis pipeline that processes every prospect meeting through specialized lenses. When I run `/analyze-meeting`, the system dispatches the transcript to five concurrent AI agents, each with a distinct analytical mandate:

1. **Sales Training Analyzer** -- Evaluates pitch quality, objection handling, discovery technique, and consultative selling patterns. Produces coaching-grade feedback with specific transcript references.
2. **Commercial Pricing Analyzer** -- Extracts every pricing signal: willingness-to-pay indicators, budget constraints, competitive price anchors, volume leverage points. Builds cumulative pricing histories across multi-meeting deal cycles.
3. **Product Feedback Analyzer** -- Identifies feature requests, capability gaps, competitive feature comparisons, and integration requirements. Routes findings to product management.
4. **Delivery Scoping Analyzer** -- Assesses implementation complexity: EMR integration depth, data migration scope, organizational readiness, staffing implications. Feeds directly into delivery pod estimation.
5. **Design Partnership Analyzer** -- Evaluates strategic partnership potential: innovation appetite, executive sponsorship, co-development willingness, reference-ability.

Each agent writes to a structured output format. The orchestrator merges results into a comprehensive meeting analysis document, updates the prospect's README and action items, creates a Notion Demo Meeting entry with scored metadata, and triggers a Deal Tracker update if stage-changing signals are detected.

### Technical Architecture

Agents are defined as markdown specifications in `.claude/agents/`, each 200-400 lines of domain-specific instruction. They run in parallel via Claude Code's agent dispatch, with no shared state during execution. Post-analysis, the orchestrator reconciles outputs, deduplicates findings, and applies them to the prospect's file tree and Notion records.

The pipeline integrates with Fireflies via GraphQL for transcript retrieval, Notion REST API for database writes, and Git for version-controlled persistence. Each meeting analysis generates 3-5 files: the core analysis, updated README, updated action items, and optionally updated pricing data and technical notes.

### Outcomes

- **199 meetings** analyzed with full multi-agent pipeline
- **138 external/prospect-facing meetings** across 48+ accounts classified and analyzed
- **81.1/100** average engagement score across scored meetings
- **77.9/100** average pitch quality score
- Analysis turnaround reduced from 30-45 minutes of manual work to under 5 minutes of automated processing
- Generated structured coaching data that did not exist before -- no SE team of two has time for call reviews

### Tech Stack

Claude Code agents (parallel dispatch), Fireflies GraphQL API, Notion REST API, Python (YAML extraction, meeting metadata parsing), Git

---

## 3. Healthcare Pipeline Management at Scale

### Problem

Two people covering the entire SE pipeline for a company selling eight product lines into healthcare. The deals ranged from $250K behavioral health POCs to $40M health system design partnerships. Each deal required deep domain knowledge -- different EMR integrations, different payer landscapes, different regulatory constraints, different clinical workflows. Without a system, deals would fall through cracks or get shallow technical coverage.

### What I Built

A structured deal management system spanning 76 prospect directories, each containing a full deal history: README (deal summary), meeting notes, action items, technical requirements, pricing data, and delivery scoping. Every prospect follows the same template structure, enabling both human and AI to navigate any deal's state in seconds.

The SE Deal Tracker in Notion provides the executive layer: 99 total deals with stage, health, priority, deal size, win probability, delivery pods, EMR, product lines, and SE owner. The schema is centralized in Python (`deal_tracker_schema.py`) to ensure consistency across all automated updates. Fields are categorized as Auto (synced from Git at session end), Derived (Claude suggests, human confirms), and Manual (only set on explicit request).

Deal stages follow a custom crosswalk mapping SE stages to the company's FY26 sales stages, enabling accurate forecasting without manual translation.

### Verticals and Products Covered

- **Healthcare verticals**: Hospital systems, behavioral health, physical therapy, vision/ophthalmology, dental, ABA therapy, home health, specialty medicine, oncology, primary care
- **Products**: SmarterEligibility, SmarterAuthorizations, SmarterReceivables, ConverseAI, SmarterAgents, SmarterPosting, SmarterDenials, SmarterPreBill
- **EMR integrations evaluated**: Epic, NextGen, Cerner, eClinicalWorks, Athena, Raintree, Meditech, ModMed, WellSky, Allscripts, and others (12+ platforms)

### Outcomes

- **99 deals** in pipeline, **61 managed personally** (62% of company pipeline)
- **$31.8M** pipeline value under my management
- **$1.95M** closed-won revenue
- **76 prospect directories** with complete deal documentation
- **8 product lines** across **10+ healthcare verticals**
- **54 high-priority deals** actively tracked with health indicators and next actions

### Tech Stack

Notion (databases, status fields, multi-select properties), Git (version-controlled deal state), Python (schema validation, deal tracker audit scripts), Claude Code (automated field updates)

---

## 4. Ephemeral Prospect Workspace Architecture

### Problem

Working on 61 deals simultaneously creates a file management nightmare. Traditional approaches -- a single branch with all prospects, or long-lived feature branches per prospect -- either create constant merge conflicts or accumulate stale branches. I needed isolated workspaces that could spin up instantly, capture all work, persist to remote, and disappear cleanly.

### What I Built

An ephemeral workspace system built on Git worktrees. When I run `/work-on-prospect <name>`, the system:

1. Creates a fresh worktree from `main` at a temporary path
2. Checks out or creates the `prospect/<name>` branch
3. Queries Notion for current deal state (stage, health, sizing, action items)
4. Compares Notion state with local README.md, resolving any drift
5. Presents a briefing: current deal stage, recent activity, open action items, last meeting date

When I finish work, the session-end hook:

1. Commits all changes with a structured commit message
2. Pushes to `prospect/<name>` remote branch
3. Creates or updates a PR for the prospect's changes
4. Syncs updated fields back to Notion (stage, health, last work completed)
5. Deletes the local worktree -- zero disk footprint

The worktree is ephemeral. All state persists to the remote branch and Notion. If my laptop catches fire, every deal's current state is recoverable from those two sources within minutes.

### Technical Architecture

The system uses Git's worktree feature to create isolated working directories that share the same `.git` object store but have independent working trees and indexes. This means creating a worktree for a 76-prospect repository is nearly instant -- no cloning, no copying.

Notion sync is bidirectional: the system reads from Notion at session start (to catch changes made by colleagues or via the Notion UI) and writes back at session end (to reflect work done in the session). Conflict resolution follows a simple rule: Notion wins for metadata fields (it is the shared executive interface), Git wins for content (it has full version history).

Orphan detection handles edge cases: if a worktree was not cleaned up properly (crash, network failure), the next session detects it and offers recovery or cleanup.

### Outcomes

- **Zero stale worktrees** -- ephemeral model eliminates accumulation
- **Sub-10-second workspace creation** for any of 76 prospects
- **Bidirectional Notion sync** ensures executive dashboard is always current
- **451 PRs** created through this workflow (one per work session per prospect)
- Team members can see real-time deal status in Notion without touching Git

### Tech Stack

Git worktrees, Notion REST API, Python (sync scripts, orphan detection), Bash (worktree lifecycle management), GitHub CLI (`gh pr create`)

---

## 5. ICP Calibration and Scoring Framework

### Problem

With 99 deals in the pipeline and limited SE capacity, we needed a rigorous framework for prioritizing which prospects deserved deep technical engagement. Gut feel does not scale when you are triaging 10+ new inbound prospects per week across different verticals, EMR platforms, and deal sizes.

### What I Built

A data-driven Ideal Customer Profile scoring system, developed in collaboration with the VP of Delivery, using his pipeline analysis as the baseline. The framework evolved through four versions (ICP V1 through V4) over three months, with each iteration calibrated against actual deal outcomes.

The V4 framework scores prospects across six weighted dimensions:

| Weight | Criterion |
|--------|-----------|
| 25% | Payer Layer Coverage and EDI Readiness |
| 20% | SOP Consistency and Process Quality |
| 20% | Staffing Model (Onshore / Dedicated) |
| 15% | Centralized Ops and IT Engagement |
| 10% | Receptiveness to Human + Tech Model |
| 10% | Specialty Focus and Practice Size |

Each criterion is scored 1-5. The composite weighted score determines tier placement: Tier 1 (score >= 4.0) gets full SE engagement, Tier 2 (3.0-3.99) gets standard coverage, Tier 3 (< 3.0) gets light-touch or cost-takeout pathway.

A critical calibration insight emerged in March 2026: the "Score the Scope" principle. We discovered that scoring criteria against the full organization (e.g., a 2,600-clinic health system) produced misleading results. The correct unit of analysis is the scoped deployment -- the specific EHR, geography, business unit, and use case being deployed. This resolved both over-scoring (large orgs with deployment complexity) and under-scoring (clean ambulatory fits with moderate org-level unknowns).

### Technical Architecture

The scoring framework is implemented as a Claude Code skill (`assessing-prospects`) backed by structured data files: `product-readiness.json` (14 products, 92 mapped pain points, 20 EHR platforms) and `icp-definitions.json` (V4 tier criteria with pipeline examples). A Python-based payer layer scorer integrates actual payer capability data from Stedi EDI coverage databases, the internal `t-payer-portal` RPA matrix, and Availity 278 API testing results.

Batch assessment scripts can score the entire pipeline in a single run, producing prioritized prospect lists for capacity planning discussions.

### Outcomes

- **99 deals** scored and tiered for SE capacity allocation
- **54 high-priority, 27 medium, 18 low** -- clear resource allocation guidance
- Calibrated with VP Delivery using actual delivery success/failure data
- Ecosystem tier model adopted for partner-channel deals (e.g., NextGen)
- Scoring integrated into every `/analyze-meeting` workflow -- prospects are automatically re-scored as new information emerges

### Tech Stack

Python (scoring engine, payer capability mapping, batch assessment), Notion (ICP scores stored on Deal Tracker), Claude Code (real-time scoring during meeting analysis), JSON (product readiness data, ICP definitions)

---

## 6. Demo Engineering Platform

### Problem

Each prospect meeting requires demo materials tailored to their specific specialty, EMR, payer mix, and pain points. A dental DSO with Dentrix and Delta Dental needs fundamentally different demonstration content than a hospital system running Epic with a Blue Cross-heavy payer mix. Building custom demos from scratch for every meeting does not scale.

### What I Built

A demo engineering platform with 20+ reusable demo workflows managed as a Git submodule (`workflow-demos/`). Each demo is defined by a YAML manifest specifying the workflow steps, required artifacts (CSV reports, audio files, screenshots), specialty-specific terminology, and integration points.

The `/create-demo` command guides an interactive workflow: it gathers prospect context from the deal's README and meeting notes, recommends a demo type (single product, full suite, or custom suite), generates the manifest, and structures the artifacts. Demos can be composed from existing components or built from scratch when a new specialty or workflow requires it.

The submodule architecture means demo content is versioned independently from prospect data, enabling reuse across deals without duplication. A demo built for one ophthalmology prospect's eligibility workflow can be adapted for the next in minutes.

### Outcomes

- **20+ demo workflows** covering all eight product lines
- Demo preparation time reduced from hours to minutes for repeat specialties
- Consistent demo quality across a two-person team -- both SEs pull from the same library
- Demo manifests serve double duty as training materials for new team members

### Tech Stack

YAML (demo manifests), Git submodules (versioned demo library), Claude Code (interactive demo creation), Markdown (demo documentation)

---

## 7. Enterprise Deal Execution

### Problem

Enterprise healthcare deals are long, technically complex, and involve dozens of stakeholders. A single deal can span 30+ meetings over six months, involve multiple EMR integrations, require custom pricing models, and demand coordination with product, delivery, and executive teams. Losing context across that timeline is the default failure mode.

### What I Built

A systematic deal execution framework, battle-tested across the largest opportunities in the pipeline. Four deals illustrate the range and depth:

**NextGen Partnership ($1M/year, 2-year commitment)**
The most meeting-intensive deal in the pipeline: 37 meetings spanning strategy sessions, technical deep-dives, integration planning, and commercial negotiation. This was an ecosystem integration play -- embedding Smarter Technologies' automation into NextGen's platform for their installed base. I built a dedicated CO16 implementation guide, delivery charter, and partner enablement package. The deal required evaluating NextGen's HL7/FHIR integration capabilities, designing a multi-tenant deployment model, and modeling per-transaction economics at scale.

**Personify Health ($1.9M Year 1, CLOSED-WON)**
A four-agent deployment across four geographic regions. This deal demanded precise delivery scoping: four separate FDE (Front Door Engineering) teams, regional payer mix analysis, and phased rollout planning. I built custom automation percentage estimates for each region, factoring in payer EDI readiness, portal RPA availability, and regional volume distributions. The pricing model combined fixed platform fees with variable per-transaction pricing, requiring a custom financial model.

**Jefferson Health ($30-40M Year 1 potential, 65K employees)**
The largest opportunity in the pipeline and a potential design partnership. A health system of this scale requires a fundamentally different SE approach: executive-level architecture presentations, multi-year transformation roadmaps, and joint innovation planning rather than standard product demos. I led the technical discovery process, evaluating Epic integration depth, enterprise data architecture requirements, and deployment sequencing for a phased rollout across a 65,000-employee organization.

**Athletico (~$8M, 920 clinics, finalist)**
A physical therapy chain with 920 locations and significant operational complexity: multiple EMR platforms across acquired practices, inconsistent SOPs, and high-volume eligibility verification requirements. I developed a custom automation estimation model accounting for their specific payer mix and multi-EMR landscape, delivered technical walkthroughs to their RCM leadership, and built the competitive differentiation narrative that advanced us to finalist stage.

### Outcomes

- **$1.95M** closed-won across completed deals
- **$31.8M** in active pipeline under management
- **37 meetings** managed for a single strategic partnership (NextGen)
- **4 regional deployments** scoped and won (Personify Health)
- Deal documentation sufficient for seamless delivery handoff on every closed deal

### Tech Stack

The full platform stack: meeting analysis pipeline, Notion deal tracking, pricing models, automation estimation, delivery charter generation, Git-based deal histories

---

## 8. Hiring and Team Development

### Problem

Scaling a sales engineering team in healthcare technology requires candidates with a rare combination: deep RCM domain knowledge, technical solution design ability, executive communication skills, and data reasoning capability. Traditional interview processes -- resume screens and behavioral questions -- do not reliably surface these competencies. We needed a rigorous, calibrated evaluation framework.

### What I Built

An eight-dimension SE candidate grading rubric, implemented as a Claude Code skill (`grading-se-candidates`), designed around a realistic case study: the A/R + Denials scenario using CVH (a fictional healthcare organization). Candidates receive a dataset and business context, then deliver both a written take-home analysis and a live presentation.

The eight scoring dimensions, each rated 1-5:

| Dimension | Category | What It Tests |
|-----------|----------|---------------|
| Discovery and Problem Framing | Core | Hypothesis quality, targeted questions, structured thinking |
| RCM Fluency (A/R + Denials) | Core | Denial mechanics, appeal workflows, payer behavior, A/R drivers |
| Solution Design and Deliverability | Core | Phased plans, constraints, risks, dependencies |
| Executive Communication | Supporting | ROI logic, prioritization, CFO-ready narrative |
| Data Reasoning | Core | Uses data to drive decisions, not just describe -- pivots, cross-tabs, patterns |
| Pre-to-Post Handoff | Differentiating | Handoff artifacts, acceptance criteria, governance model |
| Ownership and Collaboration | Supporting | Stakeholder management, cross-functional awareness |
| AI/Automation Judgment | Differentiating | Automation vs. process change distinction, realistic expectations |

Each dimension has distinct signal tables for take-home vs. live interview artifacts, recognizing that strong candidates may excel in different modalities. The grading skill processes both submission types, scores each dimension with evidence citations, and generates a structured evaluation report with a hire/no-hire recommendation.

A critical calibration step: after grading the first cohort, I compared my manual scores against Claude's default scoring and found systematic over-scoring in solution specificity, delivery handoff detail, and confidence calibration. I adjusted the rubric and Claude's scoring parameters to match my stricter baseline, ensuring consistency across evaluators.

### Outcomes

- Standardized evaluation across all SE candidates
- Calibrated scoring eliminates interviewer variance
- Time-to-evaluate reduced from 2+ hours to 30 minutes per candidate
- Rubric doubles as a training document for what "good" looks like in SE

### Tech Stack

Claude Code (candidate evaluation skill), Fireflies (live interview transcripts), Notion (candidate tracking), Markdown (rubric specification, evaluation reports)

---

## 9. Security and Compliance Automation

### Problem

Healthcare technology sales require extensive security documentation: VSRA questionnaires, vendor risk assessments, HIPAA compliance verifications, SOC 2 evidence requests. Each questionnaire contains 100-200+ questions, many asking the same things in slightly different ways. Answering them manually consumed days of SE time per prospect -- time that should have been spent on technical solutioning.

### What I Built

An automated security questionnaire answering system that reads questions from Google Sheets, matches them against a curated Notion answer bank, and writes back prospect-specific answers.

The pipeline:

1. **Ingest**: Reads the questionnaire from Google Sheets via API, auto-detecting format (2-column AI questions, 7-column risk assessments, etc.)
2. **Match**: Compares each question against 180+ approved answers in a Notion answer bank, using keyword routing and semantic matching
3. **Contextualize**: Layers in prospect-specific details from the deal's README -- products being sold, EMR integration points, data types in scope
4. **Generate**: Produces answers that are factually grounded in approved security language but tailored to the prospect's specific deployment
5. **Write Back**: Pushes answers directly to the Google Sheet, ready for security team review and approval

The answer bank is maintained in Notion with canonical Q&A pairs covering SOC 2 Type II, HIPAA (BAA, PHI handling, breach notification), Kubernetes infrastructure, AI risk management, incident response, and data governance. Each answer includes approved language that security and legal teams have vetted.

### Technical Architecture

The system uses two Python scripts: `questionnaire_io.py` for Google Sheets read/write operations and `notion_security_fetcher.py` for answer bank retrieval. The matching layer handles format variance -- the same HIPAA question might appear as "Do you maintain a BAA?", "Describe your Business Associate Agreement process", or "HIPAA BAA status" depending on the questionnaire author. A routing table maps keyword clusters to canonical answers.

Google Sheets integration supports both OAuth2 (full read/write) and public CSV export (read-only fallback). The system detects .xlsx files uploaded to Drive (which break the Sheets API) and guides conversion.

### Outcomes

- **180+ questions** in the answer bank covering major compliance frameworks
- Questionnaire completion time reduced from days to hours
- Consistent, pre-approved security language across all prospect-facing responses
- Answer bank grows with each new questionnaire -- novel questions get added after security review

### Tech Stack

Python (Google Sheets API, Notion API), Google Sheets (questionnaire I/O), Notion (answer bank, security hub), Claude Code (semantic matching, answer generation)

---

## 10. Commercial Innovation

### Problem

Healthcare RCM automation pricing is genuinely hard. You are selling productivity gains that depend on payer-specific EDI capabilities, EMR integration depth, claim volume distributions, denial rates, and staff efficiency -- none of which are standardized across prospects. Traditional SaaS pricing (per-seat, per-month) does not capture value in this market. We needed pricing models that aligned our revenue with the customer's realized value, and we needed automation estimation tools that could produce defensible projections.

### What I Built

**Pricing Model Innovation**

I developed and deployed five distinct pricing architectures across the pipeline, each designed for a specific deal structure:

- **Transaction-based**: Per-claim or per-verification pricing tied directly to automation volume. Used for high-volume, single-product deployments where value scales linearly.
- **FTE-based cost reduction**: Pricing anchored to the customer's current staffing cost, with our fee structured as a percentage of demonstrated savings. Requires baseline measurement and ongoing reporting.
- **Fixed + variable hybrid**: Platform fee for infrastructure and integration, plus variable per-transaction fees for automation throughput. Balances revenue predictability with value alignment.
- **Volume discount tiers**: Graduated pricing that rewards scale -- designed for multi-location deployments where per-unit cost decreases as clinics are onboarded.
- **Risk-sharing / contingency**: Smarter Technologies absorbs downside risk in exchange for upside participation. Used for design partnerships and strategic accounts where proving value is more important than initial revenue.

Each model was built in collaboration with commercial leadership and tailored to specific deal contexts. Pricing data for 30+ prospects is tracked in structured markdown files with full negotiation history.

**Automation Estimation Engine**

The estimation engine produces month-by-month automation percentage projections for each use case in a deal. It operates in two modes:

1. **Deterministic** (eligibility and prior authorization): Grounded in actual platform capabilities. The engine pulls payer-specific EDI coverage data from Stedi, RPA availability from the internal `t-payer-portal` matrix, and 278 API testing results from Availity. Automation percentage = payer volume share multiplied by channel automation ceiling multiplied by build timeline factor. These are defensible, auditable numbers.

2. **Historical/heuristic** (posting, A/R, denials): Uses exponential ramp curves calibrated against historical prospect deployments. The formula: `Base% + (Full% - Base%) x exponential_progress`, where Base is automation at value start and Full is steady-state maximum. Conservative by design -- Full Auto % is set below the sub-task blended rate (e.g., 75% vs. 94% sub-task rate).

Output is a professionally formatted Google Sheet with monthly automation ramps, FDE team assignments, delivery cost projections, and volume breakdowns. Created directly in Google Drive via API with native Sheets formatting -- not CSV uploads.

### Outcomes

- **5 pricing models** developed and deployed across active deals
- **30+ pricing analyses** documented in Git with full negotiation history
- Automation estimates used in $31.8M of pipeline proposals
- Cost-takeout consulting pathway created for 22 deals where traditional product sale was not the right fit
- Estimation engine accuracy validated against Personify Health actuals post-deployment

### Tech Stack

Python (Google Sheets API, payer capability mapping, exponential ramp calculations), Google Sheets (formatted output with charts), Google Drive API (automated file creation in shared folders), Stedi EDI data, Notion (pricing history tracking), Claude Code (estimation orchestration)

---

## Summary

Seven months. Two people. One system.

| Metric | Value |
|--------|-------|
| Commits | 943 |
| Pull Requests | 500+ (459 merged) |
| AI Skills Built | 23 |
| Python Scripts | 57 |
| API Integrations | 8+ |
| Deals Managed | 61 (62% of pipeline) |
| Pipeline Value | $31.8M |
| Closed-Won Revenue | $1.95M |
| Meetings Analyzed | 199 (Notion) / 483 (Fireflies) |
| Prospect Directories | 76 |
| Healthcare Verticals | 10+ |
| Product Lines | 8 |
| EMR Platforms Evaluated | 12+ |
| Pricing Models Developed | 5 architectures, 30+ prospect-specific |

The core thesis: a small team with the right AI-augmented systems can outperform a team many times its size. Not by cutting corners, but by eliminating the manual overhead that prevents deep technical work. Every minute I did not spend writing meeting summaries, updating spreadsheets, or searching for deal context was a minute spent on technical solutioning, relationship building, and commercial strategy.

The system is not theoretical. It is in production, managing real revenue, and has been since October 2025.

---

*All metrics sourced from production systems (Git, Notion, Fireflies, GitHub) as of March 28, 2026. Source documentation available on request.*
