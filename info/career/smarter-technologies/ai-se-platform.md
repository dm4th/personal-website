---
Title: Smarter Technologies — AI-Powered SE Platform
Start: September, 2025
End: Current
---

# Building the AI-Powered SE Platform

When I joined Smarter Technologies as Director of Sales Engineering, there was nothing. No deal tracking system, no repeatable demo process, no meeting analysis workflow, no templates. Two people. Eight product lines. Ten healthcare verticals. $31.8M in pipeline that needed managing.

The obvious answer would have been to buy CRM tooling and set up some spreadsheets. Instead, I built what I believe is one of the most sophisticated AI-augmented SE systems in healthcare technology—using Claude Code as the agentic layer that ties everything together.

### What I Built

The platform is not a chatbot bolted onto existing tools. It is the primary interface through which all SE work gets executed, tracked, and analyzed. The architecture has a few core components:

**23 specialized AI skills**, each a self-contained module with its own specification document, Python scripts, and output templates. Skills range from meeting analysis and Notion sync to security questionnaire automation and pricing estimation. Each is invoked as a slash command (`/analyze-meeting`, `/work-on-prospect`, `/create-pricing`) that Claude interprets at runtime.

**57 Python integration scripts** handling API communication across Notion, Fireflies, Google Drive, Google Sheets, Slack, and GitHub. These scripts are the connective tissue—they move data between systems, enforce schema consistency, and automate the mechanical parts of SE work.

**3 GitHub Actions CI/CD workflows** for automated code review, Claude integration testing, and weekly demo review generation. The repository itself is the application, and CI keeps it healthy.

**5 parallel AI agents** for meeting intelligence—detailed in the Meeting Intelligence section. These were the most technically interesting piece of the system.

### The Architecture Decision

The system uses a deliberate state split. Notion holds deal metadata for executive visibility—stage, health, sizing, capacity planning, win probability. Git holds technical depth—meeting analyses, pricing models, action items, technical requirements, delivery scoping.

A bidirectional sync layer reconciles the two. README.md serves as the bridge document that exists in both systems: it lives in the Git repository as the canonical deal summary, and its contents sync to Notion so executives can see current deal state without touching Git. When the two drift (someone updates Notion from a mobile device, or I update a README in the field), the sync layer resolves conflicts with a simple rule: Notion wins for metadata fields, Git wins for content.

The "application" has no compiled binary and no deployment pipeline. The skill specifications are markdown documents that Claude interprets at runtime. Every new skill I write is immediately available. Every improvement is a commit.

### The Numbers

Seven months of production use produced numbers I'm proud of: 943 commits, 500+ pull requests (451 authored by me), $31.8M pipeline under active management, $1.95M in closed-won revenue, 76 prospect directories maintained with complete deal histories, and 199 demo meetings tracked with structured metadata.

Two people. $31.8M pipeline. The force multiplier worked.

### Tech Stack

Claude Code, Python 3.11, Notion API, Fireflies GraphQL API, Google Drive/Sheets API (OAuth2), GitHub Actions, Git worktrees, Slack API
