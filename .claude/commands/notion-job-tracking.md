# Notion Job Tracking

Creates or updates the Notion job hunt tracking entries for a completed application. Reads from the local `page-config.json` and `notes.md` files and scaffolds the Company, Job Opportunity, and first Job Encounter in the Notion pipeline.

## Input

$ARGUMENTS

If a slug is provided (e.g., `notion-solutions-engineer-enterprise-amer`), use it directly. If not, ask the user for the slug before proceeding.

---

## Notion Database IDs (hardcoded, do not change)

- **Job Opportunities:** `collection://34bfc8f4-554c-80e5-ab24-000b45a034ef`
- **Companies:** `collection://34bfc8f4-554c-8059-bd1d-000b1359b9eb`
- **Job Encounters:** `collection://34bfc8f4-554c-80e8-a66f-000b05b2a117`

---

## Step 1 — Read Local Application Files

Read both of these files from the slug:

- `job-applications/[slug]/page-config.json` — extract: `company`, `role`, `fitScore`, `jobDescriptionUrl`, `appliedDate`, `dimensions` (score breakdown), `strengths`, `weaknesses`
- `job-applications/[slug]/notes.md` — extract: talking points, gap scripts, interview questions

If either file is missing, warn the user and proceed with whatever is available.

---

## Step 2 — Determine Application Status

Map the local state to a Notion status value:

| Local state | Notion status |
|---|---|
| `appliedDate` is set | `Application Submitted` |
| Resume + cover letter PDFs exist but no applied date | `Application Ready` |
| No PDFs yet | `Fit Scored` |

Valid Notion status values: `Not Started`, `Fit Scored`, `Application Ready`, `Application Submitted`, `Interviewing`, `Denied`, `Offered`

---

## Step 3 — Check for Existing Company Entry

Search the Companies DB for the company name using the `notion-search` tool with `data_source_url: "collection://34bfc8f4-554c-8059-bd1d-000b1359b9eb"`.

- If found: note the page URL for use in Step 5.
- If not found: create a new company entry in the Companies DB with:
  - `Company`: the company name from page-config.json
  - `Web Page`: the company homepage (derive from company name if not in config — e.g., `https://notion.com` for Notion)

---

## Step 4 — Check for Existing Opportunity Entry

Search the Job Opportunities DB for the role title using the `notion-search` tool with `data_source_url: "collection://34bfc8f4-554c-80e5-ab24-000b45a034ef"`.

- If a matching entry already exists for this company: tell the user, show the URL, and ask whether to update it or skip.
- If not found: proceed to Step 5.

---

## Step 5 — Create the Job Opportunity Entry

Create a page in the Job Opportunities data source (`collection://34bfc8f4-554c-80e5-ab24-000b45a034ef`) with:

**Properties:**
- `Opportunity`: role title from page-config.json
- `Application Status`: determined in Step 2
- `Job Fit Score`: fitScore from page-config.json
- `Job Post`: jobDescriptionUrl from page-config.json (omit if empty)
- `🏢 Companies`: URL of the company page from Step 3
- `date:Application Create Date:start`: today's date (ISO 8601)
- `date:Application Create Date:is_datetime`: 0
- `date:Application Submit Date:start`: appliedDate from page-config.json (only if set)
- `date:Application Submit Date:is_datetime`: 0

**Page content** (use Notion Markdown):

Build a structured notes page from the local files. Include all of the following sections:

```
# Fit Score: [score]/100

[One sentence from fitScoreNote in page-config.json]

## Score Breakdown

| Dimension | Score | Note |
|---|---|---|
| Core job function | X/10 | [rationale, first sentence only] |
| Seniority | X/10 | [rationale, first sentence only] |
| Technical skills | X/10 | [rationale, first sentence only] |
| Industry/vertical | X/10 | [rationale, first sentence only] |
| Logistics | X/10 | [rationale, first sentence only] |

## Strongest Talking Points

[Numbered list from notes.md "Strongest talking points" section]

## Gaps and How to Address Them

[From notes.md "Remaining gaps" section — one paragraph per gap with the mitigation]

## Interview Questions to Ask

[Numbered list from notes.md "Questions to ask" section]

## Application Materials

- Resume: job-applications/[slug]/Dan Mathieson Resume.pdf
- Cover letter: job-applications/[slug]/Dan Mathieson Cover Letter.pdf
- Referral page config: job-applications/[slug]/page-config.json
- Referral page ID: [id from page-config.json]
```

---

## Step 6 — Create the Job Encounter Entry

Create a page in the Job Encounters data source (`collection://34bfc8f4-554c-80e8-a66f-000b05b2a117`) with:

**Properties:**
- `Encounter Title`: `Application materials generated`
- `date:Date:start`: the Application Create Date used in Step 5
- `date:Date:is_datetime`: 0
- `Job`: URL of the opportunity page created in Step 5
- `Description`: one sentence summarizing the cover letter angle and the referral page ID
- `Link to Artifact`: jobDescriptionUrl from page-config.json

---

## Step 7 — Report Back

Tell the user:
- Company: found existing / created new (with URL)
- Opportunity: created (with URL) — or skipped if duplicate
- Encounter: created (with URL)
- Next step: when ready to submit, flip Application Status to "Application Submitted" and set the submit date
