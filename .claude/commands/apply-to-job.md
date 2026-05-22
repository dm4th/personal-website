# New Job Application — Full Cycle

End-to-end skill for processing a new job opportunity from scratch. Runs the complete pipeline: JD analysis and gap-filling, application material generation (resume, cover letter, PDFs, notes), and Notion tracking scaffolding. Invoke this for any new role where you have not yet started the application.

## Input

$ARGUMENTS

Expects a job description as input — either pasted directly or as a URL. If neither is provided, ask the user to paste the JD before proceeding.

Optionally, the user can also pass a pre-derived slug (format: `[company-slug]-[role-type]`). If no slug is provided, derive one from the JD as part of Phase 1.

---

## Overview

This skill runs three phases in sequence. Each phase must complete before the next begins — do not skip or parallelize phases.

**Phase 1: Fit Analysis and Gap Filling** — Score the JD, surface gaps, ask targeted questions, update `/info` files with new content, re-score. Loop until score >= 75 or user decides to proceed.

**Phase 2: Material Generation** — Generate tailored resume, cover letter, PDFs, notes file, and page-config.json for the referral page.

**Phase 3: Notion Tracking** — Scaffold the Company, Job Opportunity, and Job Encounter entries in the Notion job hunt pipeline.

---

## Phase 1: Fit Analysis and Gap Filling

Invoke `/job-application` with the job description as input.

`/job-application` owns this phase entirely. It will:
- Run the JD fit analysis script
- Present the score table and rationale
- Ask targeted gap questions and update `/info` files with answers
- Loop until score >= 75 or the user decides to proceed
- Derive the output slug
- Hand off to `/fit-resume` automatically when the loop exits

**Wait for `/job-application` to complete before moving to Phase 2.** Phase 1 is interactive — do not attempt to run Phase 2 until the user has confirmed they are ready to proceed past the gap-filling loop.

---

## Phase 2: Material Generation

`/job-application` automatically invokes `/fit-resume` at the end of Phase 1. `/fit-resume` owns Phase 2 entirely. It will:

- Generate `resume.html` and `cover-letter.html` tailored to the role
- Generate PDFs via Chrome headless
- Create `notes.md` with talking points, gap scripts, and interview questions
- Create `page-config.json` for the referral page

**Wait for `/fit-resume` to confirm all files are written before proceeding to Phase 3.**

---

## Phase 3: Notion Tracking

Once Phase 2 is complete, invoke `/notion-job-tracking` with the slug derived in Phase 1.

`/notion-job-tracking` owns this phase entirely. It will:
- Read `page-config.json` and `notes.md` from the output directory
- Check for an existing company entry in the Notion Companies DB; create one if missing
- Check for an existing opportunity entry; create one with full notes content if missing
- Create a Job Encounter entry for "Application materials generated"
- Report the URLs of all created pages

---

## Final Summary

After all three phases complete, present a single summary to the user:

**Score:** X/100 (final score after gap-filling)

**Files created:**
- `job-applications/[slug]/resume.html`
- `job-applications/[slug]/cover-letter.html`
- `job-applications/[slug]/Dan Mathieson Resume.pdf`
- `job-applications/[slug]/Dan Mathieson Cover Letter.pdf`
- `job-applications/[slug]/notes.md`
- `job-applications/[slug]/page-config.json`

**Notion:**
- Company: [name] — [found existing / created new] ([URL])
- Opportunity: [role] — created ([URL])
- Encounter: Application materials generated — created ([URL])

**Strongest opening for an interview:** [single best talking point from notes.md]

**Gaps to be ready for:** [2-3 bullet list from notes.md]

**Before sharing the referral page:** fill in `referralBlurb`, `projects`, and `applicationQuestions` in `page-config.json`.

---

## Source Files

This skill delegates entirely to its sub-skills. Refer to their files for implementation detail:
- `.claude/commands/job-application.md` — Phase 1
- `.claude/commands/fit-resume.md` — Phase 2
- `.claude/commands/notion-job-tracking.md` — Phase 3
