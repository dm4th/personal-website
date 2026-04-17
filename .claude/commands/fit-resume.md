# Fit Resume to Job Description

You are creating a tailored version of Dan Mathieson's resume for a specific job opportunity.

## Input

$ARGUMENTS

The user will provide a job description and optionally additional context (company info, why they're interested, specific angles to emphasize). If no job description is provided, ask for one before proceeding.

## Source Files

**Base resume HTML**: `work-product/danny-mathieson-resume.html`
- This is the master resume. Never modify this file directly for a fit version.

**Full work history and metrics** (for pulling in relevant details):
- `work-product/work-context/danny-mathieson-resume.md` — Complete structured resume
- `work-product/work-context/project-portfolio.md` — 10 detailed project descriptions
- `work-product/work-context/role-fit-analysis.md` — Career positioning across 6 role types with fit scores
- `work-product/work-context/notion-data.md` — Pipeline and deal metrics
- `work-product/work-context/resume-sources.md` — Source verification for claims

**Website content** (for additional narrative context):
- `info/career/smarter-technologies.md` — Director SE role details
- `info/career/thoughtful.md` — Earlier Thoughtful AI roles
- `info/career/action-network.md`, `info/career/google.md`, `info/career/fanduel.md`

## Instructions

1. **Read the job description** carefully. Identify:
   - Required skills and experience
   - Preferred qualifications
   - Key responsibilities
   - Company industry and stage
   - Seniority level and reporting structure
   - Any specific technologies, domains, or methodologies mentioned

2. **Read the role-fit-analysis.md** — it contains pre-analyzed fit scores across 6 role categories (Founder, VP/Dir SE, Head of Solutions, Dir AI/Automation, Technical PM, Principal SE). Find the closest match and use that analysis to inform positioning.

3. **Read the base resume HTML** and the full work-context files to find the most relevant achievements.

4. **Create a tailored resume** at `work-product/fitted-resumes/[company-name]-resume.html`:
   - Copy the base HTML structure and styling (navy blue #2B4C7E, 2-page layout, sidebar metrics)
   - **Rewrite the Professional Summary** to directly address the role's core requirements
   - **Reorder and reweight bullet points** — lead with the most relevant achievements for this role
   - **Adjust the sidebar metrics** — highlight the numbers most relevant to this role
   - **Adjust Technical Skills** — lead with technologies mentioned in the job description
   - **Adjust the Thoughtful AI section** — emphasize the projects most relevant to this role
   - **Adjust earlier career** — expand or condense based on relevance
   - Pull in additional details from project-portfolio.md or notion-data.md that aren't in the base resume but are relevant to this specific role
   - Maintain the same professional quality and formatting

5. **Create a cover letter brief** at `work-product/fitted-resumes/[company-name]-notes.md`:
   - 3-5 bullet points on why Dan is a strong fit
   - Key talking points for an interview
   - Any gaps or areas to address proactively
   - Suggested questions to ask the interviewer

6. **Search the web** for additional context on the company if helpful:
   - Recent news, funding rounds, product launches
   - Company size, growth stage, culture signals
   - Competitors and market position
   - Use this to inform positioning in the resume and notes

## Positioning Guidelines

Based on the role-fit-analysis.md, Dan's strongest positioning angles are:

- **For SE/Solutions leadership roles** (9/10 fit): Already doing the job at compressed scale. A 2-person team managing ~100 deals is VP-level scope. Built tooling that multiplied team capacity by 10x.
- **For AI/Automation roles** (8/10 fit): Built AI automation in production, not just prototypes. Understands what to automate and what not to. Healthcare RCM is the hottest automation target.
- **For Technical PM/Product roles** (8/10 fit): Built a product from scratch with real users (943 commits, not a side project). Is his own customer. Ships.
- **For Founder/Co-founder** (9/10 fit): Built a product, understands customers, has commercial instinct, can do everything simultaneously.
- **For Principal/Staff SE** (8/10 fit): Technical depth with code not credentials. Makes others better. Thrives in ambiguity.

## Style Guidelines

- No em-dashes. Use commas, colons, or periods instead.
- Bold key metrics and outcomes.
- Match the tone and formality to the target company (startup vs. enterprise).
- Be specific. Replace generic claims with quantified results.
- Dan's name: "Dan Mathieson"
- Email: danny.mathieson233@gmail.com

## Key Differentiators to Weave In

- Built one of the most complex Claude Code deployments in production
- Rare combination: builds production software + closes large deals + deep domain expertise
- $31.8M pipeline managed by a 2-person team (efficiency story)
- Healthcare RCM domain depth across 12+ EHR platforms
- Commercial sophistication (5 pricing models, ROI frameworks)
- Promoted because the sales team couldn't function without him
