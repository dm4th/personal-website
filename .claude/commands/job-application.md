# Job Application Workflow

Scores a job description against Dan's documented experience, fills gaps through targeted content additions, then hands off to `/fit-resume` to generate application materials.

## Input

$ARGUMENTS

If a job description is not provided in $ARGUMENTS, ask the user to paste one before proceeding.

---

## Overview

This workflow runs in two phases before delegating:

1. **Score** — Run the fit analyzer against the JD. Present score, strengths, and gaps clearly.
2. **Improve** — For each meaningful gap, ask a targeted question. Update `/info` files based on answers. Re-run. Loop until score >= 75 or user decides to proceed.
3. **Generate** — Invoke `/fit-resume` with the JD and slug. It handles resume, cover letter, PDFs, and notes.

---

## Phase 1: Initial Fit Analysis

### Step 1.1 — Update the analysis script

Open `scripts/analyze-jd.ts` and replace the `JD` constant with the new job description. Do not change anything else in the file.

If the previous JD is not already in the `HISTORICAL_JDS` array, add a compact version of it (role, company, key requirements as a short summary string) so its vocabulary terms stay in the glossary for future runs.

### Step 1.2 — Run the analysis

```bash
ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env.local | cut -d= -f2) \
  node --env-file=.env.local ./node_modules/.bin/tsx scripts/analyze-jd.ts
```

### Step 1.3 — Present results

Show the user a clean formatted summary:

**Score: X/100** (one-line interpretation: strong/good/partial/weak match)

| Dimension           | Score | Weighted  |
|---------------------|-------|-----------|
| Core job function   |  X/10 |   Y/30    |
| Seniority           |  X/10 |   Y/20    |
| Technical skills    |  X/10 |   Y/25    |
| Industry/vertical   |  X/10 |   Y/15    |
| Logistics           |  X/10 |   Y/10    |

For each dimension, add one sentence of rationale below the table (the `rationale` field from the output).

Then:
- **Strengths**: Numbered list, one line each, with the evidence file cited
- **Gaps**: Numbered list, one line each

Do not show the raw JSON. Format it cleanly for a human.

---

## Phase 2: Gap-Filling Loop

Focus on the lowest-scoring dimensions first. For each dimension where the score is 6/10 or below, and where real experience might exist but isn't documented, ask a targeted question. Immediately call out logistics and seniority gaps as structural (cannot be closed with content) rather than asking about them.

### How to ask good gap questions

- Be specific about what the JD is asking for
- Give Dan an easy way to say "yes I have this, here's the story" or "no I don't have this"
- When asking, briefly explain why the pipeline flagged it and what a good answer would do for the score
- Ask one gap at a time, not all at once. Wait for the answer before asking the next.

Example format:
> **Technical Skills — 6/10 (+3-4 pts potential)**
> The JD asks for hands-on Python and SQL experience, and the pipeline scored this dimension lower because the career files show data analysis work but not explicit Python production code. The technical skills dimension is the highest-weighted area after core function.
>
> Have you written Python beyond analysis scripts — production pipelines, automation tooling, API integrations? Even "I built the backend ingestion script for the eligibility pipeline" counts and would move this score significantly.

### When the user provides an answer

1. Identify which `/info` file it belongs in (career file for the relevant role/company)
2. Write a new subsection or expand an existing one with the content
3. Match the tone and style of the surrounding content — conversational, first-person, specific
4. **No em-dashes** in any new content. Use commas, colons, or periods instead.
5. Tell the user which file was updated and what was added

### Re-run after each meaningful update

After 2-3 file updates (or whenever the user provides a significant new anecdote), re-run the analysis script and show both the total delta and the per-dimension changes:

> Score: 72 → 78 (+6 pts)
> Technical Skills: 6/10 → 8/10 (+5 pts weighted)
> Core function: unchanged at 9/10

### Loop exit conditions

Stop the loop and move to Phase 3 when any of these are true:
- Score >= 75
- Two full rounds of updates have been completed
- The remaining gaps are structural (title mismatch, years of experience) and cannot be closed with content
- The user says "generate", "let's proceed", "that's enough", or similar

Before exiting the loop, tell the user the final score and explain which gaps remain and why they are structural vs. addressable.

---

## Phase 3: Hand Off to /fit-resume

Once the loop exits, derive the output slug:
- Format: `[company-slug]-[role-type]` (lowercase, hyphenated, no special characters)
- Examples: `8090-solutions-tpm`, `distyl-ai-strategist-healthcare`, `openai-solutions-engineer`

Then invoke the `/fit-resume` command, passing the job description and slug as arguments. `/fit-resume` owns all material generation: resume, cover letter, PDFs, and notes.

Tell the user the final score, the slug, and that generation is starting.

---

## Source Files

### Analysis infrastructure
- `scripts/analyze-jd.ts` — The script to update and run for each JD
- `scripts/jd-terms-glossary.json` — Auto-maintained vocabulary glossary (do not edit manually)
- `lib/agent/tools/analyzeJdFit.ts` — The analysis tool (do not modify)

### Career content (update these during Phase 2)
- `info/career/smarter-technologies/index.md` + subdirectory files
- `info/career/thoughtful/solutions-architect.md`
- `info/career/thoughtful/customer-engineer.md`
- `info/career/thoughtful/lead-tpm.md`
- `info/career/action-network/year-two-and-departure.md`
- `info/career/fanduel/revenue-team.md`
- `info/career/google/my-year-at-google.md`
- `info/about-me/education/bucknell-overview.md`
- `info/ai-ml/cal-tech/bootcamp.md`

### Style and key facts
- `work-product/work-context/key-facts.md` — Canonical metrics, positioning angles, style rules, contact info
