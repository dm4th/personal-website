# Update Resume & Website Content

You are updating Dan Mathieson's resume and personal website content with new professional information.

## Context

$ARGUMENTS

## Source Files

**Resume HTML** (editable source): `work-product/danny-mathieson-resume.html`
- This is a self-contained 2-page HTML resume with embedded CSS
- Page 1: Smarter Technologies / Thoughtful AI experience (main column) + Key Metrics sidebar + Technical Skills sidebar
- Page 2: Earlier career (Action Network, Google, FanDuel) + Education + Full Technical Skills + Projects
- Print to PDF via Chrome for final output; replace `info/career/resume.pdf` with the new PDF

**Website content files** (for browsing + RAG chat):
- `info/career/smarter-technologies.md` — Director of Sales Engineering (Sept 2025 - Present)
- `info/career/thoughtful.md` — Solutions Architect → Customer Engineer → Lead TPM (Sept 2023 - Sept 2025)
- Other career files: `info/career/action-network.md`, `info/career/google.md`, `info/career/fanduel.md`

**Work product reference** (raw data from AI assistant):
- `work-product/work-context/danny-mathieson-resume.md` — Structured resume content
- `work-product/work-context/project-portfolio.md` — Detailed project descriptions
- `work-product/work-context/notion-data.md` — Pipeline and deal metrics
- `work-product/work-context/fireflies-data.md` — Meeting data
- `work-product/work-context/resume-sources.md` — Source verification for all claims
- `work-product/work-context/role-fit-analysis.md` — Career positioning analysis

## Instructions

1. **Read the current resume HTML** and all website content files to understand what's already documented
2. **Read any new information** provided by the user (files in work-product/, conversation context, or $ARGUMENTS)
3. **Identify what's new** — compare new information against existing content to find:
   - New deals, metrics, or achievements not yet documented
   - Updated numbers (pipeline size, deal counts, revenue, etc.)
   - New projects or tools built
   - New skills or technologies used
   - Role changes or promotions
4. **Update the resume HTML** (`work-product/danny-mathieson-resume.html`):
   - Maintain the existing 2-page layout, navy blue accent color (#2B4C7E), and structure
   - Update metrics in the sidebar
   - Add/update bullet points in the appropriate sections
   - Keep bullet points concise and achievement-oriented
   - No em-dashes. Use commas, colons, or periods instead
5. **Update website content** (`info/career/smarter-technologies.md` and/or other files):
   - Follow H1/H3 heading convention only (no H2 or H4) — the embedding script chunks on these
   - Keep sections under 1500 words for optimal embedding
   - First-person narrative voice with specific metrics and anecdotes
   - Include "Key Technologies" and "Description" subsections under each H3
   - YAML frontmatter with Title, Start, End fields
6. **After content updates**, remind the user to:
   - Run `node scripts/generate_embeddings.mjs` to re-embed updated content
   - Print the HTML resume to PDF in Chrome and replace `info/career/resume.pdf`
   - Deploy edge functions if system prompts were updated

## Style Guidelines

- **Resume**: Concise, metric-driven bullets. Bold key numbers and outcomes. No em-dashes.
- **Website content**: Rich first-person narrative. Tell the story, include the "why" not just the "what". Specific examples and metrics woven into the narrative.
- **Consistency**: Ensure numbers match across resume and website content. Cross-reference `work-product/work-context/resume-sources.md` for data verification.
- **Dan's voice**: Professional yet personable. Solution-oriented. Highlights learning and growth alongside achievements.

## Key Facts (for reference)

- Name: Dan Mathieson
- Email: danny.mathieson233@gmail.com
- Website: danielmathieson.com
- Location: San Francisco, CA
- Current role: Director, Sales Engineering at Smarter Technologies (Sept 2025 - Present)
- Smarter Technologies formed via PE merger of Thoughtful AI + SmarterDx + Access Healthcare + Pieces
- Promoted from Lead TPM after sales team insisted on dedicated SE leadership
- Role sits within delivery org, aligning pre-sale scoping with delivery KPIs
- 2-person SE team covering ~100 deals, >95% of new business pipeline
