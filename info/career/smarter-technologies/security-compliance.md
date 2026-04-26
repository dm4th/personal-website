---
Title: Smarter Technologies — Security & Compliance
Start: September, 2025
End: Current
---

# Security and Compliance Automation

Healthcare technology sales comes with a paperwork problem. Every enterprise prospect requires security documentation before they'll let you near their systems: VSRA questionnaires, vendor risk assessments, HIPAA compliance verifications, SOC 2 evidence requests. Each questionnaire contains 100 to 200+ questions, and many of them ask the same thing in slightly different ways across different forms.

Answering them manually consumed days of SE time per prospect. Days that should have been spent on technical solutioning.

### What I Built

An automated security questionnaire answering system that reads questions from Google Sheets, matches them against a curated answer bank in Notion, and writes back prospect-specific answers. The whole process—ingest, match, contextualize, generate, write back—runs with a single command.

The pipeline has five stages:

**Ingest** reads the questionnaire from Google Sheets via API, auto-detecting the format. Different vendors use different templates: some are two-column (question, answer), others are seven-column risk assessment grids with severity ratings and evidence fields. The system handles both.

**Match** compares each question against 180+ approved answers in a Notion answer bank, using keyword routing and semantic matching. The same HIPAA question might appear as "Do you maintain a BAA?", "Describe your Business Associate Agreement process", or "HIPAA BAA status" depending on who wrote the questionnaire. The routing table maps keyword clusters to canonical answers regardless of phrasing.

**Contextualize** layers in prospect-specific details from the deal's README—which products are being sold, which EMR integration points are in scope, what data types will be processed. A security answer for an eligibility verification deployment should reference different data flows than one for a prior authorization platform.

**Generate** produces answers that are grounded in approved security language but tailored to the specific deployment context.

**Write Back** pushes answers directly to the Google Sheet, ready for the security team to review and approve before sending to the prospect.

### The Answer Bank

The answer bank lives in Notion and covers the major compliance frameworks that come up repeatedly: SOC 2 Type II, HIPAA (BAA requirements, PHI handling, breach notification timelines), Kubernetes infrastructure, AI risk management, incident response, and data governance. Every answer includes pre-vetted language that legal and security teams have approved.

The bank grows with each new questionnaire. When a question doesn't match an existing canonical answer, it gets escalated for human response and then added to the bank after review. After seven months, novel questions are rare.

### Technical Notes

Two Python scripts handle the heavy lifting: one for Google Sheets read/write operations and one for Notion answer bank retrieval. The system supports both OAuth2 (full read/write) and public CSV export (read-only fallback). It also handles a common edge case: prospects sometimes upload .xlsx files to Drive, which break the standard Sheets API—the system detects this and guides conversion.

### Results

180+ questions in the answer bank. Questionnaire completion time dropped from days to hours. Consistent, pre-approved language across all prospect-facing security responses. The system paid for itself in the first month.

### Tech Stack

Python (Google Sheets API, Notion API), Google Sheets (questionnaire I/O), Notion (answer bank), Claude Code (semantic matching and answer generation)
