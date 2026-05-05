---
Title: "Smarter Technologies: AI-Powered SE Platform"
Start: September, 2025
End: Current
---

# Building the AI-Powered SE Platform

When I joined Smarter Technologies as Director of Sales Engineering, there was nothing. No deal tracking system, no repeatable demo process, no meeting analysis workflow, no templates. Two people. Eight product lines. Ten healthcare verticals. $31.8M in pipeline that needed managing.

The obvious answer would have been to buy CRM tooling and set up some spreadsheets. Instead, I built a custom AI-augmented SE platform using Claude Code as the agentic layer that ties everything together.

### What I Built

The platform is not a chatbot bolted onto existing tools. It is the primary interface through which all SE work gets executed, tracked, and analyzed. The architecture has a few core components:

**23 specialized AI skills**, each a self-contained module with its own specification document, Python scripts, and output templates. Skills range from meeting analysis and Notion sync to security questionnaire automation and pricing estimation. Each is invoked as a slash command (`/analyze-meeting`, `/work-on-prospect`, `/create-pricing`) that Claude interprets at runtime.

**57 Python integration scripts** handling API communication across Notion, Fireflies, Google Drive, Google Sheets, Slack, and GitHub. These scripts are the connective tissue: they move data between systems, enforce schema consistency, and automate the mechanical parts of SE work.

**3 GitHub Actions CI/CD workflows** for automated code review, Claude integration testing, and weekly demo review generation. The repository itself is the application, and CI keeps it healthy.

**5 parallel AI agents** for meeting intelligence, detailed in the Meeting Intelligence section. These were the most technically interesting piece of the system.

### The Architecture Decision

The system uses a deliberate state split. Notion holds deal metadata for executive visibility: stage, health, sizing, capacity planning, win probability. Git holds technical depth: meeting analyses, pricing models, action items, technical requirements, delivery scoping.

A bidirectional sync layer reconciles the two. README.md serves as the bridge document that exists in both systems: it lives in the Git repository as the canonical deal summary, and its contents sync to Notion so executives can see current deal state without touching Git. When the two drift (someone updates Notion from a mobile device, or I update a README in the field), the sync layer resolves conflicts with a simple rule: Notion wins for metadata fields, Git wins for content.

The "application" has no compiled binary and no deployment pipeline. The skill specifications are markdown documents that Claude interprets at runtime. Every new skill I write is immediately available. Every improvement is a commit.

### The Numbers

Seven months of production use produced numbers I'm proud of: 943 commits, 500+ pull requests (451 authored by me), $31.8M pipeline under active management, $1.95M in closed-won revenue, 76 prospect directories maintained with complete deal histories, and 199 demo meetings tracked with structured metadata.

Two people. $31.8M pipeline. The force multiplier worked.

### On-Demand Demo Engineering

One of the highest-friction activities in healthcare SE work is creating prospect-specific demos. Each prospect has a different specialty, EMR, payer mix, and set of pain points. A dental DSO running Dentrix and dealing with Delta Dental needs fundamentally different demo content than a hospital system on Epic with a Blue Cross-heavy commercial book. Building every demo from scratch was taking 3 to 4 days of work per prospect.

I built a demo creation skill into the GTM agent that reduced this to 3 to 4 hours. The skill operates in our AWS environment and has full knowledge of what demo artifacts need to exist for each product line: the specific data files, configuration manifests, audio or video components, and any environment-specific settings. When I run it with a prospect's context (specialty, EMR, deal stage, the workflows we've identified in discovery), it generates a complete demo package tailored to that prospect's situation rather than pulling from a generic library.

Critically, the skill also generates a makefile and test suite for every demo it creates. The makefile automates the build and deployment of the demo in our environment. The test suite validates that the demo hits the fidelity thresholds I defined before it's considered ready to present. If the demo can't pass its own tests, I know before the call, not during it. This was important because a demo that breaks in front of a CIO is worse than no demo at all.

The result was that every prospect meeting could have a custom, validated demo rather than a generic product walkthrough. At the deal volumes I was running, this was the difference between doing the job well and doing it at all.

Built with: Claude Code, AWS, Python, YAML manifests, Makefiles

### Security & Compliance Automation

Healthcare enterprise sales involves a disproportionate amount of security and compliance overhead. Every health system, payer, and large physician group has its own security questionnaire. Some are 30 questions, some are 300. They ask about data encryption, access controls, SOC 2 status, HIPAA compliance programs, penetration testing cadence, business associate agreement terms, and incident response procedures. Answering them manually is repetitive, time-consuming, and inconsistent.

I built a `/security-questionnaire` skill in the Claude Code GTM agent to address this. The skill works against two sources: a structured profile of our current product architecture and security posture, and a curated repository of previously submitted and well-received RFP and security questionnaire responses. When a new questionnaire comes in, the skill processes each question against both sources, matching to prior answers where the question pattern is familiar, and drafting new responses grounded in our actual architecture when it's genuinely new. The output is a complete, editable draft that I review and customize before submission.

This reduced questionnaire turnaround from days to hours and improved consistency across submissions. It also created an audit trail: every submitted response was versioned in Git, so when a prospect asked a follow-up or a subsequent questionnaire from the same organization covered similar ground, I could trace what we'd said before.

Beyond the automated questionnaire layer, I frequently took calls with CIOs and IT security leaders at prospective health systems to walk through our security posture directly. These weren't perfunctory checkbox conversations. Enterprise health system IT teams have sophisticated requirements around BAA structure, audit logging, data residency, and third-party risk management, and they wanted live Q&A with someone who understood the product architecture, not just a recitation of collateral. I delivered technical architecture walkthroughs covering our data flow, encryption model, access control design, and subprocessor relationships. These calls were often gatekeeping decisions for whether a deal moved to procurement.

Built with: Claude Code, Python, Git, custom RFP/security response repository

### Tech Stack

Claude Code, Python 3.11, Notion API, Fireflies GraphQL API, Google Drive/Sheets API (OAuth2), GitHub Actions, Git worktrees, Slack API
