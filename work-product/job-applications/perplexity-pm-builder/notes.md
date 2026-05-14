# Perplexity — Product Manager (Builder) | Application Notes

**Applied:** May 2026
**Fit Score:** 52/100
**Slug:** perplexity-pm-builder
**Comp:** $230K-$330K + equity

---

## What Drove the Score

**Strengths that scored well:**
- Production agentic AI systems with real financial stakes (Thoughtful, Smarter)
- Nondeterminism-as-a-design-parameter philosophy: hybrid-RAG convergence, determinism-first
- Eval engineering: labeled holdout sets, precision/recall by category, regression tests
- Small team / zero infrastructure builder: 943 commits + $31.8M pipeline, 2-person team
- Data flywheel: hooks-based usage tracking + 15-20% feedback sampling loop
- Consumer PLG experience: Action Network value clicks, LTV modeling, funnel identification

**Structural gaps that capped the score:**
- No formal PM title at a consumer product company
- PLG at Perplexity's scale (self-serve SaaS growth mechanics) is undocumented experience
- Perplexity is a search/answer product; all AI product work is enterprise automation
- Short formal PM tenure (~3 months Lead TPM before Smarter transition)

**The Perplexity exercise thread is the application's X-factor.** Used Perplexity to pitch Perplexity's product team on building the MCP-native healthcare agent data layer, backed by v3 investor and partner memos. No other candidate will have submitted that.

---

## Strongest Talking Points (say these, in this voice)

**1. The exercise thread opener (use this if they ask about the submission):**
"I didn't teach you a hobby topic. I used Perplexity to argue that Perplexity should build the healthcare agent data layer, and I had the investor memos to back it up. I've spent two years building exactly the systems that make that argument non-obvious: FHIR integrations, multi-portal eligibility, EHR-specific data handling across 12 platforms. The thesis isn't something I read about. It's something I've been building toward."

**2. On nondeterminism (maps directly to "steer nondeterministic models into high value outcomes"):**
"At Thoughtful I built a hybrid-RAG eligibility system that hit 95% accuracy within two days on a live billing workflow. The architecture was designed to converge toward determinism: as human-verified outputs accumulated, future identical cases bypassed the model entirely. The way I think about it is that nondeterminism is a design parameter, not a property to tolerate. You decide where in your system it's acceptable and where it isn't, then you engineer the boundary. For a product where user trust in the answer is what you're selling, that boundary matters more than model capability."

**3. On the data flywheel (maps directly to "building data-driven flywheels for iterative improvement"):**
"At Smarter Technologies I built a hooks-based usage tracking system on top of the agent platform I deployed to my sales team. Every skill invocation was logged. On 15-20% of usages the system prompted for feedback: thumbs up, thumbs down, or a written note. A cluster of thumbs-down responses on the pricing skill with notes about missing EHR context told me exactly what to fix. Before that I did essentially the same thing at Action Network: built the tracking pipeline that identified the highest-LTV user funnel and created Value Clicks as the company-wide north star. Both cases, same instinct: what gets measured gets improved."

**4. On the PM title gap (address it directly, don't dance around it):**
"I don't have PM in my title history, mostly. But I've been doing product work for two years. At Thoughtful, I was promoted to Lead TPM in three months because I was already making build/don't-build calls before the title reflected it. During that window my implementations drove 63% of net new ARR during a 3x growth year. The title was the formalization. The work was already happening."

**5. On being a builder (the core differentiator for this specific role):**
"I shipped 943 commits and 500 pull requests in seven months at Smarter Technologies while managing $31.8M in active pipeline with two people. The platform that made that scale possible was entirely self-built: 22 skills, 5 parallel agents, 57 Python integration scripts. I'm not a PM who hands specifications to engineers. I'm the person who builds the thing, then makes the next call about what to build."

---

## Remaining Gaps: How to Address in Conversation

**Consumer PM / PLG at scale:**
Acknowledge it directly. "I haven't owned a consumer growth product. My consumer product analytics work was at Action Network and FanDuel: I built the LTV models and identified the funnel, but I wasn't the PM making the feature calls. I'd be learning Perplexity's specific growth mechanics while contributing on the agentic AI and enterprise sides where I have genuine depth."

**Search / knowledge work product domain:**
"I'm a power user who thinks critically about where Perplexity wins and loses. I've spent the last year building knowledge work tools for my own team: a system that turns meeting recordings into structured deal intelligence. The underlying problem is the same one Perplexity solves: how do you make nondeterministic AI reliably useful for knowledge workers? The domain is different. The hardest parts of the problem are the same."

**Short PM title tenure:**
"The title is short. The work isn't. I've been making product decisions, writing specs, running evals, and owning outcomes for two years. The Lead TPM title just meant the company caught up to what I was already doing."

---

## Questions to Ask in the Interview

1. **On Computer specifically:** "Where is the team drawing the line between what Computer does autonomously and what it surfaces to the user for confirmation? How has that design decision evolved as you've seen real usage patterns?"

2. **On the Builder framing:** "When you say Builder PM, are you looking for someone who writes production code alongside the engineering team, or someone who can prototype and spec at code-level but hands off to eng for the final build? I can do either, and I want to make sure I understand which creates more leverage at Perplexity's current stage."

3. **On enterprise:** "The JD mentions anticipating opportunities for innovation in enterprise industries. Is healthcare one of the active verticals on the roadmap, or is that directional? I have a specific thesis about where the biggest opportunity is."

4. **On nondeterminism in the product:** "How does the team currently measure whether a model change made Computer better or worse for a given use case? Is there an eval infrastructure, or is it more qualitative at this stage?"

5. **On team size and scope:** "How many PMs are on the Computer product right now? Is the expectation that each PM owns a surface area, or is the team small enough that there's significant overlap?"

---

## Files

- `resume.html` / `Dan Mathieson Resume.pdf` (223 KB, 2 pages)
- `cover-letter.html` / `Dan Mathieson Cover Letter.pdf` (66 KB, 1 page)
- `notes.md` (this file)

## Key Exercise Submission Note

The Perplexity exercise thread should be submitted as the URL to the shared thread. The thread argued for Perplexity to build the MCP-native healthcare agent data layer. If the application asks for Option 1 or Option 2, this was effectively Option 1 (teach us about a topic) but reframed as a product thesis pitch. Reference the investor memo work in the cover letter if they ask for more context.

---

## Company Context — 2026 Product Launches (Supplemental Research)

*Added May 2026 based on web research.*

**Perplexity Computer (agentic AI):**
- Launched 2026 as an autonomous AI agent that executes multi-step workflows: browses the web, uses software, fills forms, manages tasks without user input.
- Extended into enterprise at the "Ask 2026" developer conference: multi-model architecture, Slack integration, Snowflake connectors, 20 orchestrated AI models — explicitly competing against Microsoft Copilot and Salesforce.
- Over 100 enterprise customers requested access in a single weekend of the enterprise launch.
- The Register headline (March 2026): *"Perplexity: Everything is Computer"* — signals this is the company's defining product direction, not just a feature.

**Perplexity Health:**
- Launched 2026 as a dedicated section within the app: connects wearables, personal medical records, and specialized AI health agents in a secure environment.
- Currently consumer-facing. Enterprise/provider extension has not formally launched — this is the stated gap and the product opportunity most directly relevant to this role.
- Positioning: secure, private, AI-agent-driven. The enterprise RCM / clinical operations extension is clearly directional but hasn't been shipped.

**Company scale:**
- ~1,472 employees (grown from <50 in early 2024)
- $500M ARR in 2025; 5x revenue growth on 34% team growth
- $9B+ valuation; targeting 2x revenue in 2026 with same team size — "highly leveraged small team" is literal, not marketing language

---

## Key Contacts (for warm outreach — see `/warm-outreach-guide.md`)

| Name | Role | Best channel |
|---|---|---|
| Dmitry Shevelenko | Chief Business Officer | Twitter/X @dmitry140 → LinkedIn → dmitry@perplexity.ai |
| Raman Malik | VP Product & Growth | LinkedIn (linkedin.com/in/ramanrmalik) → raman@perplexity.ai |
| Jason Urbiztondo | Head of Customer Success | Direct email: jason@perplexity.ai (confirmed) |
| Aravind Srinivas | CEO & Co-Founder | Twitter/X @AravSrinivas (active, known to respond to substantive DMs) |

**Note on Aravind:** He's been described as directly involved in key hires at the PM level. He's active on X and is known for engaging with people who have genuine product takes, not just fan messages. If you have a strong 2-3 sentence thesis on the healthcare Computer opportunity, a DM to him is worth trying after exhausting the CBO/VP channels. Keep it under 280 characters and lead with the thesis, not the job ask.
