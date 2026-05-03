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

Show the user:

- **Score**: X/100 with a one-line interpretation (strong/good/partial match)
- **Strengths**: Numbered list, one line each, with the evidence file cited
- **Gaps**: Numbered list, one line each

Do not show the raw JSON. Format it cleanly for a human.

---

## Phase 2: Gap-Filling Loop

For each gap where the score impact is meaningful (>2 points) and where real experience might exist but isn't documented, ask a targeted question.

### How to ask good gap questions

- Be specific about what the JD is asking for
- Give Dan an easy way to say "yes I have this, here's the story" or "no I don't have this"
- When asking, briefly explain why the pipeline flagged it and what a good answer would do for the score
- Ask one gap at a time, not all at once. Wait for the answer before asking the next.

Example format:
> **Gap 2 of 3 — Customer-facing POC building during discovery (+3-4 pts)**
> The JD asks for someone who can "build or contribute to live POCs when needed" during a customer engagement. The pipeline sees demos and internal tools but not prototype-on-demand work built specifically to answer a prospect's technical question.
>
> Have you ever built something quick and specific — a script, a data analysis, a working prototype — during or because of a discovery conversation, specifically to prove feasibility or close a deal? Even a "I pulled their data and showed them a projection in two days" counts.

### When the user provides an answer

1. Identify which `/info` file it belongs in (career file for the relevant role/company)
2. Write a new subsection or expand an existing one with the content
3. Match the tone and style of the surrounding content — conversational, first-person, specific
4. **No em-dashes** in any new content. Use commas, colons, or periods instead.
5. Tell the user which file was updated and what was added

### Re-run after each meaningful update

After 2-3 file updates (or whenever the user provides a significant new anecdote), re-run the analysis script and show the new score delta:

> Score: 72 → 78 (+6 pts). Here is what moved...

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
