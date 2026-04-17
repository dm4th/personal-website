---
Title: Smarter Technologies
Start: September, 2025
End: Current
---

# Director of Sales Engineering

In September 2025, Thoughtful AI underwent a private equity merger with SmarterDx, Access Healthcare, and Pieces to form Smarter Technologies. The merger happened during Thoughtful's Series B fundraising process, combining four companies into a single, larger entity focused on healthcare automation.

The timing coincided with a pivotal moment in my own trajectory. As Lead Technical Product Manager, I'd been doing increasingly heavy lifting with the sales team—helping new sales execs explain our services to prospects, providing technical support to move deals forward, and becoming the person they couldn't really operate without. I was slated to move onto our burgeoning product team, but the sales team pushed back hard. They insisted, against what I actually wanted at the time, that I move into a go-to-market leadership role full-time. The new sales executives had started leaning on me so heavily throughout their sales cycles that the team couldn't function effectively without dedicated SE support. Alex and Dan (our CEO and CPO respectively) agreed, and I was promoted to Director of Sales Engineering.

The role sits within delivery, which turned out to be the right organizational home. Being beholden to delivery KPIs means I'm setting up our intricate delivery cycles for success much earlier in the customer lifecycle—during pre-sale rather than post-close, which is where things historically fell apart. It's a fundamentally different approach: the person scoping the deal is accountable for its successful implementation, not just for closing it.

There was no SE infrastructure when I started: no deal tracking, no meeting analysis pipeline, no prospect management system, no repeatable processes. The company was selling eight product lines across ten healthcare verticals with a team of two. We needed to operate at the scale of a team five times our size. So I built one.

Over seven months, I shipped 943 commits and 500+ pull requests while simultaneously managing $31.8M in active healthcare pipeline across 61 enterprise deals—62% of the total company pipeline. The key insight was that AI-augmented tooling could be a force multiplier, not just for coding, but for the entire sales engineering workflow.

# Building the AI-Powered SE Platform

### The Operating System
#### Key Technologies
- Claude Code
- Python 3.11
- Notion API
- Fireflies GraphQL API
- Google Drive/Sheets API (OAuth2)
- GitHub Actions
- Git Worktrees
- Slack API

#### Description
I built what I believe is one of the most sophisticated AI-augmented sales engineering systems in healthcare technology. The platform is not a chatbot bolted onto existing tools—it is the primary interface through which all SE work is executed, tracked, and analyzed. Built around Claude Code as an agentic copilot, the system comprises 23 specialized AI skills (each a self-contained module with its own specification, Python scripts, and templates), 57 Python integration scripts connecting Notion, Fireflies, Google Drive, Google Sheets, Slack, and GitHub, 3 GitHub Actions CI/CD workflows, and 5 parallel AI agents for meeting intelligence.

The architecture is deliberately unconventional. Each skill is a markdown specification that Claude interprets at runtime—there is no compiled application, no deployment pipeline, and no infrastructure cost. The "application" is the repository itself. State management follows a deliberate split: Notion holds deal metadata for executive visibility (stage, health, sizing, capacity planning), while Git holds technical depth (meeting analyses, pricing models, action items, technical requirements). A bidirectional sync layer reconciles the two, with README.md serving as the bridge document that exists in both systems.

The result: 943 commits over 7 months, 500+ PRs (451 authored by me), $31.8M pipeline under active management, and $1.95M in closed-won revenue. All managed by a two-person team.

### Multi-Agent Meeting Intelligence
#### Key Technologies
- Claude Code Agents
- Fireflies GraphQL API
- Notion REST API
- Python
- YAML

#### Description
Our sales cycle generated enormous meeting volume—483 meetings in my Fireflies account alone, totaling 271 hours of recorded conversation over 4.5 months. Manually extracting action items, pricing signals, technical requirements, competitive intelligence, and deal health indicators from every call was impossible at our scale. And superficial AI summaries miss the domain-specific signals that matter in healthcare RCM sales.

I built a five-agent parallel analysis pipeline that processes every prospect meeting through specialized lenses. When I run `/analyze-meeting`, the system dispatches the transcript to five concurrent AI agents: a Sales Training Analyzer (evaluates pitch quality, objection handling, discovery technique), a Commercial Pricing Analyzer (extracts willingness-to-pay indicators, budget constraints, competitive price anchors), a Product Feedback Analyzer (identifies feature requests and capability gaps), a Delivery Scoping Analyzer (assesses implementation complexity and EMR integration depth), and a Design Partnership Analyzer (evaluates strategic partnership potential).

Each agent writes to a structured output format. The orchestrator merges results into a comprehensive meeting analysis document, updates the prospect's deal files, creates a Notion entry with scored metadata, and triggers deal tracker updates if stage-changing signals are detected. The result: 199 meetings analyzed with full multi-agent processing, an average 81.1/100 engagement score and 77.9/100 pitch quality score across scored meetings, and analysis turnaround reduced from 30-45 minutes of manual work to under 5 minutes.

### Prospect Workspace Architecture
#### Key Technologies
- Git Worktrees
- Notion REST API
- Python
- Bash
- GitHub CLI

#### Description
Working on 61 deals simultaneously creates a file management nightmare. I needed isolated workspaces that could spin up instantly, capture all work, persist to remote, and disappear cleanly. I built an ephemeral workspace system on Git worktrees. When I run `/work-on-prospect <name>`, the system creates a fresh worktree, checks out the prospect's branch, queries Notion for current deal state, reconciles any drift between Notion and local files, and presents a briefing with the deal's current stage, recent activity, and open action items.

When I finish work, a session-end hook commits all changes, pushes to the remote branch, creates or updates a PR, syncs updated fields back to Notion, and deletes the local worktree—zero disk footprint. The worktree is ephemeral; all state persists to the remote branch and Notion. If my laptop catches fire, every deal's current state is recoverable from those two sources within minutes. The system created 451 PRs through this workflow, maintains 76 prospect directories with complete deal histories, and achieves sub-10-second workspace creation for any prospect.

# Enterprise Deal Execution

### Pipeline Management at Scale
#### Key Technologies
- Notion
- Python
- Claude Code
- Git

#### Description
Two people covering the entire SE pipeline for a company selling eight product lines into healthcare. The deals ranged from $250K behavioral health POCs to $40M health system design partnerships. Each required deep domain knowledge—different EMR integrations, different payer landscapes, different regulatory constraints, different clinical workflows. Without a system, deals fall through cracks or get shallow technical coverage.

I built a structured deal management system spanning 76 prospect directories, each containing a full deal history: README with deal summary, meeting notes, action items, technical requirements, pricing data, and delivery scoping. Every prospect follows the same template structure, enabling both human and AI to navigate any deal's state in seconds. The SE Deal Tracker in Notion provides the executive layer: 99 total deals with stage, health, priority, deal size, win probability, delivery pods, EMR, product lines, and SE owner.

The numbers tell the story: 61 deals managed personally (62% of company pipeline), $31.8M in pipeline value, $1.95M closed-won revenue across 5 deals, 76 healthcare prospects covered across 8+ verticals including hospital systems, behavioral health, physical therapy, vision care, dental, ABA therapy, home health, and specialty medicine. I handled 4x the deal volume of the second team member while maintaining quality scores above 80/100.

### Landmark Deals
#### Key Technologies
- Meeting Analysis Pipeline
- Notion Deal Tracking
- Pricing Models
- Automation Estimation
- Delivery Charter Generation

#### Description
Four deals illustrate the range and depth of the enterprise work I led:

**NextGen Healthcare Partnership ($1M/year, 2-year commitment)**: The most meeting-intensive deal in the pipeline—37 meetings spanning strategy sessions, technical deep-dives, integration planning, and commercial negotiation. This was an ecosystem integration play, embedding Smarter Technologies' automation into NextGen's platform for their installed base. I built a dedicated CO16 implementation guide, delivery charter, and partner enablement package, evaluating NextGen's HL7/FHIR integration capabilities and designing a multi-tenant deployment model.

**Personify Health ($1.9M Year 1, CLOSED-WON)**: A four-agent deployment across four geographic regions. This demanded precise delivery scoping: four separate FDE teams, regional payer mix analysis, and phased rollout planning. I built custom automation percentage estimates for each region factoring in payer EDI readiness, portal RPA availability, and regional volume distributions, with a pricing model combining fixed platform fees and variable per-transaction pricing.

**Jefferson Health ($30-40M Year 1 potential, 65,000 employees)**: The largest opportunity in the pipeline and a potential design partnership. A health system of this scale requires a fundamentally different SE approach: executive-level architecture presentations, multi-year transformation roadmaps, and joint innovation planning. I led the technical discovery process evaluating Epic integration depth, enterprise data architecture requirements, and deployment sequencing.

**Athletico Physical Therapy (~$8M, 920 clinics)**: A PT chain with significant operational complexity—multiple EMR platforms across acquired practices, inconsistent SOPs, and high-volume eligibility verification. I developed a custom automation estimation model for their specific payer mix and multi-EMR landscape, advancing us to finalist stage.

# Commercial Innovation

### Pricing Architecture and Estimation
#### Key Technologies
- Python
- Google Sheets API
- Google Drive API
- Stedi EDI Data
- Notion
- Claude Code

#### Description
Healthcare RCM automation pricing is genuinely hard. You're selling productivity gains that depend on payer-specific EDI capabilities, EMR integration depth, claim volume distributions, denial rates, and staff efficiency—none of which are standardized across prospects. I developed five distinct pricing architectures: transaction-based ($2.50-$6.00/action), FTE-based cost reduction ($1,932 blended rate), fixed+variable hybrid ($250K/quarter + scale), volume discount tiers (8-25% step-down), and risk-sharing/contingency models for design partnerships. Each was built in collaboration with commercial leadership and tailored to specific deal contexts.

I also built an automation estimation engine that produces month-by-month projections for each use case in a deal. It operates in two modes: deterministic (for eligibility and prior auth, grounded in actual payer EDI coverage data from Stedi, RPA availability from our internal portal matrix, and 278 API testing results) and historical/heuristic (for posting, A/R, and denials, using exponential ramp curves calibrated against actual deployments). Output is a professionally formatted Google Sheet with monthly automation ramps, FDE team assignments, delivery cost projections, and volume breakdowns—created directly via Google Drive API with native formatting. Over 30 pricing analyses were documented across the pipeline, with estimates used in $31.8M of proposals.

### Healthcare RCM Expertise
#### Key Technologies
- 12+ EHR/PM Platforms
- EDI/HL7 Standards
- Clearinghouse Integration
- HIPAA/SOC2/HITRUST Compliance

#### Description
Over more than two years between Thoughtful AI and Smarter Technologies, I developed deep expertise in healthcare revenue cycle management. I've evaluated 12+ EHR platforms—Epic, NextGen, Cerner, eClinicalWorks, Athena, Raintree, Meditech, ModMed, WellSky, Allscripts, iMediware, and NextTech—understanding their integration capabilities, API maturity, and automation potential. I've scoped automation across 8 product lines: Eligibility Verification, Prior Authorization, AR + Denials Management, Payment Posting, Medical Coding, Voice AI, Agent Automation, and Clinical Intelligence.

The domain knowledge is not academic—it comes from hundreds of prospect conversations across hospital systems, behavioral health, physical therapy, vision/ophthalmology, dental, ABA therapy, home health, specialty medicine, oncology, and primary care. I've addressed use cases spanning 6,500 to 82,000 monthly authorizations, 7,000 to 37,300 monthly eligibility checks, 17-21% denial rates, and $20M+ financial impact projections. This depth lets me quickly identify where automation will deliver real value versus where process changes are the better investment.

# Team Building and Hiring

### Building the SE Function
#### Key Technologies
- Claude Code
- Fireflies
- Notion
- Structured Evaluation Frameworks

#### Description
Scaling a sales engineering team in healthcare technology requires candidates with a rare combination: deep RCM domain knowledge, technical solution design ability, executive communication skills, and data reasoning capability. I built an eight-dimension SE candidate evaluation rubric covering Discovery and Problem Framing, RCM Fluency, Solution Design and Deliverability, Executive Communication, Data Reasoning, Pre-to-Post Handoff, Ownership and Collaboration, and AI/Automation Judgment. Each dimension is rated 1-5 with distinct signal tables for take-home and live interview artifacts.

A critical calibration step: after grading the first cohort, I compared my manual scores against Claude's default scoring and found systematic over-scoring in solution specificity, delivery handoff detail, and confidence calibration. I adjusted the rubric and scoring parameters to match my stricter baseline, ensuring consistency across evaluators. The rubric doubles as a training document for what "good" looks like in healthcare SE.

As a two-person team (Director + Team Lead), I handled 4x the deal volume of the second team member while maintaining quality scores above 80/100. The cross-functional collaboration was intense—working with the CEO, 2 VPs of Sales, VP of Delivery, Product Manager, and Director of Commercial Ops on deal strategy, pipeline reviews, and product roadmap. I also co-developed an ICP V4 Calibration framework with the VP of Delivery, scoring 66 deals across 6 weighted dimensions to establish rigorous prospect prioritization and the "Score the Scope" qualification methodology.
