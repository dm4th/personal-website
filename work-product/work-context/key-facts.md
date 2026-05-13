# Key Facts — Dan Mathieson

Single source of truth for metrics, positioning angles, style rules, and contact info.
Referenced by `/job-application` and `/fit-resume` commands. Do not embed these facts directly in command files — always read from here.

---

## Contact & Identity

- **Full name**: Dan Mathieson
- **Email**: danny.mathieson233@gmail.com
- **Website**: danielmathieson.com
- **Location**: San Francisco, CA
- **Education**: BS Electrical & Computer Engineering, Bucknell University
- **Certificate**: CalTech AI/ML Professional Certificate

---

## Canonical Metrics (preserve exactly)

### AccessHealthcare / Smarter Technologies (Sep 2025 - Present)
- **VP of Solutions** at AccessHealthcare (largest healthcare RCM BPO, multi-billion dollar portfolio company), promoted within first month post-shutdown
- Retained as **1 of ~15%** of employees after April 2026 Smarter Technologies shutdown; only non-Product/Engineering person kept
- Executives at both the PE firm and AccessHealthcare made a special exception for retention

### Smarter Technologies (Sep 2025 - Apr 2026, ~7 months as Director SE)
- **$31.8M** active pipeline, personal ownership
- **61** enterprise healthcare deals managed personally
- **62%** of total company pipeline (2-person team)
- **$1.95M** closed-won revenue
- **96%** of prospects who met with Dan moved to proposal stage within a month (pre-sales effectiveness)
- **271 hours / 483 meetings** logged (138 prospect-facing across 48+ accounts)
- **8+ healthcare verticals**, **12+ EHR platforms**, 8 product lines
- **81.1/100 engagement score**, 77.9 pitch quality across 85 AI-scored meetings
- SE platform: **22-skill, 5-agent, 57-script** system with API integrations across Notion, Fireflies, Google Drive, GitHub, JIRA
- Deployed SE platform skills to Claude Cowork after team members were Slacking Dan to query his agent on their behalf

### Thoughtful AI (2023-2025)
- **63% of net new ARR** at Thoughtful during 3x year-over-year growth (2024)
- Promoted to Lead TPM within 3 months of joining as TPM
- **943 commits, 500+ PRs** in 7 months (platform engineering)
- Hybrid-RAG eligibility engine: **95% accuracy** within 2 days on live workflow
- On-site discovery workshops: Jefferson Health (65,000-employee system), Presbyterian Health (New Mexico)
- Multi-portal eligibility scoping: modeled automation ceiling across multiple patient-access portals

---

## Positioning Angles by Role Type

These are pre-analyzed fit scores. Always read `role-fit-analysis.md` for the full breakdown.

- **SE/Solutions leadership** (9/10): Already doing VP-level scope with a 2-person team. Tooling multiplied capacity 10x.
- **AI/Automation** (8/10): Built AI automation in production. Understands what to automate and what not to. Healthcare RCM is the hottest automation target.
- **Technical PM / TPM / Delivery** (8/10): Held the TPM title at Thoughtful, promoted based on delivery output not tenure. Drove 63% of ARR. MAPs as PRDs: 8-20 hour SOP capture sessions, pseudo-code specs engineers build directly from, customer-signed definition of done.
- **Founder/Co-founder** (9/10): Built a product, understands customers, has commercial instinct, can do everything simultaneously.
- **Principal/Staff SE** (8/10): Technical depth with code not credentials. Makes others better. Thrives in ambiguity.

---

## Key Differentiators

- Forward-deployed delivery: discovery through production ownership, same person scopes and delivers
- Global team leadership: led forward-deployed engineering teams at Thoughtful AI based in South America, South Africa, and Eastern Europe; at AccessHealthcare works daily with India-based delivery teams; open and accustomed to travel for on-site customer engagements
- MAP (Master Automation Plan) methodology: SOP capture, pseudo-code decision-tree specs, customer-signed definition of done before any code is written, test plan executed by Dan before production
- Determinism-first design philosophy: Python deterministic functions preferred over LLM reasoning; LLM used only where genuine variability exists; hybrid-RAG convergence (non-deterministic path shrinks as verified examples accumulate)
- On-demand demo engineering: GTM agent generates complete demo package from prospect context; reduced creation from 3-4 days to 3-4 hours
- Healthcare RCM domain depth: 12+ EHR platforms, FHIR-read/RPA-write architecture, multi-portal eligibility, denial management, payment posting
- Rare combination: builds production software, closes large deals, deep domain expertise, all in one person
- Implementation rescue: diagnosed gap between promises and delivered system, built recovery plans with transparent success metrics, rebuilt stakeholder trust

---

## Resume Structure Guidelines

- **Base file**: `work-product/danny-mathieson-resume.html` — never modify directly
- **Output path**: `work-product/job-applications/[slug]/resume.html`
- **Slug format**: `[company-slug]-[role-type]` (lowercase, hyphenated, no special chars)
- **Styling**: Navy blue `#2B4C7E`, 8.5in page, Segoe UI, two-column page 1 (main + 210px sidebar)
- **Sidebar KPIs**: Always split into "Smarter Technologies (Last 7 Months)" and "Thoughtful AI (2023-2025)" sections when Thoughtful has strong signal for the role
- **Smarter Technologies bullets**: Lead with the subsection most relevant to the role (Discovery/Scoping, Customer Engagement, or Platform Engineering)
- **Thoughtful AI bullets**: For delivery/TPM roles, lead with 63% ARR stat and MAP/PRD methodology. For SE/GTM roles, lead with pre-sales and hybrid-RAG system.
- **Skills sidebar**: Lead with skill categories the JD emphasizes most

---

## Cover Letter Guidelines

- **Output path**: `work-product/job-applications/[slug]/cover-letter.html`
- **Styling**: Match 8090 Solutions cover letter structure (header with name + contact line, date, salutation, body paragraphs, signature)
- **Structure**:
  1. Opening: one sentence connecting Dan's background to the company's specific thesis or mission
  2. Thoughtful AI paragraph: lead with 63% ARR / 3x growth stat. TPM roles: MAPs, definition of done, production ownership. SE/GTM roles: pre-sales funnel results.
  3. Discovery/scoping paragraph: Jefferson Health or Presbyterian Health on-site workshop example, or multi-portal eligibility scoping, whichever is most relevant
  4. AI production systems paragraph: hybrid-RAG with eval loop and determinism philosophy
  5. Smarter Technologies paragraph: 2-3 most relevant achievements, condensed
  6. Closing: connect to the company's specific thesis, ask for a conversation
- **Length**: No more than 5-6 paragraphs. Each paragraph earns its place.

---

## Style Rules (Non-Negotiable)

- **No em-dashes** anywhere in generated content (resume, cover letter, notes, info file updates). Use commas, colons, or periods instead.
- **First-person** in cover letter and notes. Third-person or neutral in resume bullets.
- **Bold key metrics** in resume bullets: `<strong>$31.8M</strong>`, `<strong>63%</strong>`, etc.
- **Specific over generic**: "61 enterprise healthcare deals" not "many enterprise deals"
- **Conversational but precise**: no jargon for its own sake, no generic corporate language
- When updating `/info` files: match the tone and style of surrounding content, first-person, specific

---

## Previous Applications (Style Reference)

- `work-product/job-applications/distyl-ai-strategist-healthcare/`
- `work-product/job-applications/8090-solutions-tpm/`
- `work-product/job-applications/openai-solutions-engineer-healthcare/`
