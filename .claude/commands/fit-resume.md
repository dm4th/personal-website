# Generate Application Materials

Creates a tailored resume, cover letter, PDFs, and notes file for a specific job opportunity. Can be invoked directly with a JD, or called from `/job-application` after the gap-filling loop.

## Input

$ARGUMENTS

Provide a job description and, optionally, a pre-derived output slug (format: `[company-slug]-[role-type]`). If neither is provided, ask for the job description before proceeding.

---

## Key Facts Reference

Read `work-product/work-context/key-facts.md` before generating any content. It contains:
- Canonical metrics (do not change or approximate these numbers)
- Positioning angles by role type
- Key differentiators
- Resume and cover letter structure guidelines
- Style rules (especially: no em-dashes anywhere)
- Contact info

---

## Source Files

**Base resume HTML**: `work-product/danny-mathieson-resume.html`
Always use this as the structural template. Never modify it directly.

**Work history and context**:
- `work-product/work-context/danny-mathieson-resume.md` — Complete structured resume
- `work-product/work-context/project-portfolio.md` — 10 detailed project write-ups
- `work-product/work-context/role-fit-analysis.md` — Pre-analyzed fit scores for 6 role types
- `work-product/work-context/notion-data.md` — Pipeline and deal metrics

**Career narrative** (for richer bullet content):
- `info/career/smarter-technologies/` — Director SE role, enterprise deals, AI platform
- `info/career/thoughtful/` — TPM, Solutions Architect, Customer Engineer roles
- `info/career/action-network/`, `info/career/google/`, `info/career/fanduel/`

**Previous applications** (for style reference):
- `job-applications/distyl-ai-strategist-healthcare/`
- `job-applications/8090-solutions-tpm/`
- `job-applications/openai-solutions-engineer-healthcare/`

---

## Step 1 — Determine Output Location

If a slug was passed as an argument, use it. Otherwise derive one from the job description:
- Format: `[company-slug]-[role-type]` (lowercase, hyphenated, no special characters)
- Examples: `8090-solutions-tpm`, `distyl-ai-strategist-healthcare`, `openai-solutions-engineer`

Output directory: `job-applications/[slug]/`

---

## Step 2 — Research the Company

Search the web for:
- What the company does (in their own words)
- Recent news, funding, or product launches
- Company size, stage, culture signals
- Specific language or values they use

Use this to inform the resume summary and cover letter opening. Reference the company's actual thesis, not generic descriptions.

---

## Step 3 — Generate the Resume

Create `job-applications/[slug]/resume.html` using `work-product/danny-mathieson-resume.html` as the structural template.

Refer to `key-facts.md` for the resume structure guidelines. Key decisions to make per role:

- **Header subtitle**: Rewrite to match the role type (e.g., "Technical Program Manager | Forward-Deployed AI Delivery | Healthcare & Life Sciences")
- **Professional Summary**: Address the role's core requirements directly. Not generic.
- **Sidebar KPIs**: Split into "Smarter Technologies (Last 7 Months)" and "Thoughtful AI (2023-2025)" sections when both are relevant. Lead with the metrics most signal-rich for this role.
- **Smarter Technologies bullets**: Lead with the most relevant subsection (Discovery/Scoping, Customer Engagement, or Platform Engineering)
- **Thoughtful AI bullets**: For delivery/TPM roles, lead with 63% ARR and MAP/PRD methodology. For SE/GTM roles, lead with pre-sales and hybrid-RAG system.
- **Skills sidebar**: Lead with the skill categories the JD emphasizes most
- **No em-dashes** anywhere in the HTML

Pull richer detail from `info/career/` files when the base resume bullets are too compressed for this role.

---

## Step 4 — Generate the Cover Letter

Create `job-applications/[slug]/cover-letter.html` using the 8090 Solutions cover letter as a structural reference (`work-product/job-applications/8090-solutions-tpm/cover-letter.html`).

Follow the cover letter structure in `key-facts.md`. Key decisions to make per role:

- **Opening**: Connect Dan's background to the company's specific thesis. One sentence. Not generic.
- **Thoughtful AI paragraph**: For delivery/TPM roles, lead with MAP methodology and 63% ARR. For SE/GTM roles, lead with pre-sales funnel and hybrid-RAG.
- **Discovery paragraph**: Choose the most relevant example (Jefferson Health workshop, Presbyterian Health workshop, or multi-portal eligibility scoping model)
- **Smarter Technologies paragraph**: Condensed to 2-3 achievements most relevant to this role. Should not overshadow Thoughtful if role values delivery.
- **Closing**: Reference the company's specific thesis. Ask for a conversation.

No more than 5-6 paragraphs. No em-dashes. Conversational but precise.

---

## Step 5 — Generate PDFs

```bash
cd job-applications/[slug]

/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless --disable-gpu \
  --print-to-pdf="Dan Mathieson Resume.pdf" \
  --print-to-pdf-no-header --no-margins \
  "file://$(pwd)/resume.html"

/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless --disable-gpu \
  --print-to-pdf="Dan Mathieson Cover Letter.pdf" \
  --print-to-pdf-no-header --no-margins \
  "file://$(pwd)/cover-letter.html"
```

Confirm both PDFs were written and report file sizes.

---

## Step 6 — Create Notes File

Create `job-applications/[slug]/notes.md` with:
- Final fit score (if this was called from `/job-application`) and what drove it
- 3-5 strongest talking points for an interview (written as Dan would actually say them, first-person)
- Remaining gaps and how to address them in conversation
- 4-5 questions Dan should ask in the interview, tailored to this specific company

---

## Step 7 — Generate Referral Page Config

Create `job-applications/[slug]/page-config.json` as a stub referral page config. Populate from the notes file and JD analysis:

- Set `id` to the slug (Dan can change this to something shorter later)
- Set `fitScore` from the final weighted score (0-100)
- Set `fitScoreNote` to one sentence summarizing what drove the overall score
- Set `dimensions` from the `JdFitOutput.dimensions` object returned by the analysis. For each dimension's `citations` array (which contains `/info` file paths like `"career/smarter-technologies/index.md"`), convert them to `JobCitation` format by deriving a human-readable label from the filename and an internal site path:
  - `"career/smarter-technologies/index.md"` → `{ "label": "Smarter Technologies", "path": "/info/career/smarter-technologies" }`
  - `"career/thoughtful/solutions-architect.md"` → `{ "label": "Solutions Architect (Thoughtful)", "path": "/info/career/thoughtful/solutions-architect" }`
  - Strip `/index.md` suffixes; strip `.md` suffix; capitalize words; use the last 1-2 path segments for the label
- Extract 3-5 strengths from the "Strongest Talking Points" section of notes.md, with placeholder `citations: []` arrays for Dan to fill in
- Extract 2-3 weaknesses from the "Remaining Gaps" section of notes.md, including `mitigation` text from the "how to address" guidance
- Set `jobDescriptionUrl` to `""` (Dan fills this in)
- Set `jobDescriptionText` to `""` (Dan fills this in)
- Set `referralBlurb` to `""` (Dan fills this in)
- Set `applicationQuestions` to `[]` (Dan fills this in)
- Set `projects` to `[]` (Dan fills this in)
- Set `resumeFile` to `"Dan Mathieson Resume.pdf"` and `coverLetterFile` to `"Dan Mathieson Cover Letter.pdf"`

Schema reference:
```json
{
  "id": "[slug]",
  "company": "...",
  "role": "...",
  "appliedDate": "",
  "fitScore": 0,
  "fitScoreNote": "...",
  "dimensions": {
    "coreJobFunction": {
      "score": 8,
      "rationale": "...",
      "citations": [{ "label": "Smarter Technologies", "path": "/info/career/smarter-technologies" }]
    },
    "seniority": { "score": 7, "rationale": "...", "citations": [] },
    "technicalSkills": { "score": 8, "rationale": "...", "citations": [] },
    "industryVertical": { "score": 9, "rationale": "...", "citations": [] },
    "logistics": { "score": 9, "rationale": "...", "citations": [] }
  },
  "jobDescriptionUrl": "",
  "jobDescriptionText": "",
  "strengths": [{ "title": "...", "description": "...", "citations": [] }],
  "weaknesses": [{ "title": "...", "description": "...", "mitigation": "..." }],
  "referralBlurb": "",
  "projects": [],
  "applicationQuestions": [],
  "resumeFile": "Dan Mathieson Resume.pdf",
  "coverLetterFile": "Dan Mathieson Cover Letter.pdf"
}
```

---

## Step 8 — Output Summary

Tell the user:
- Files created (with paths)
- The single strongest talking point to open with in an interview
- Any structural gaps to be prepared to address
- Remind Dan to fill in `jobDescriptionUrl`, `referralBlurb`, `projects`, and `applicationQuestions` in `page-config.json` before sharing the referral page
