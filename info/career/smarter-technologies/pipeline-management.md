---
Title: Smarter Technologies — Pipeline Management
Start: September, 2025
End: Current
---

# Healthcare Pipeline Management at Scale

Two people covering the entire SE pipeline for a company selling eight product lines into healthcare. The deals ranged from $250K behavioral health proofs-of-concept to $40M health system design partnerships. Each one required deep domain knowledge—different EMR integrations, different payer landscapes, different regulatory constraints, different clinical workflows. Without a system, deals fall through cracks or get shallow technical coverage.

### The Deal Management System

I built a structured deal management system spanning 76 prospect directories. Each directory contains a complete deal history: a README with deal summary and current state, meeting notes from every call, open action items, technical requirements, pricing data, and delivery scoping. Every prospect follows the same template structure, which means both a human and an AI can navigate any deal's current state in seconds.

The SE Deal Tracker in Notion provides the executive visibility layer: 99 total deals with stage, health, priority, deal size, win probability, delivery pods, EMR platform, product lines, and SE owner. The schema is centralized in Python to ensure consistency across all automated updates. Fields fall into three categories: Auto (synced from Git at session end), Derived (Claude suggests, human confirms), and Manual (only updated on explicit request).

### The Workspace Architecture

Working on 61 deals simultaneously creates a file management problem. I solved it with an ephemeral workspace system built on Git worktrees. When I run `/work-on-prospect <name>`, the system creates a fresh worktree, checks out the prospect's branch, queries Notion for current deal state, reconciles any drift between Notion and local files, and presents a briefing: deal stage, recent activity, open action items, last meeting date.

When I finish a work session, a session-end hook commits all changes, pushes to the remote branch, creates or updates a PR, syncs updated fields back to Notion, and deletes the local worktree—zero disk footprint. The worktree is ephemeral; all state persists to the remote branch and Notion. If my laptop stopped working tomorrow, every deal's current state would be recoverable from those two sources within minutes.

This produced 451 pull requests through that workflow alone, one per work session per prospect.

### The Verticals and Products

The scope was genuinely broad. Healthcare verticals covered: hospital systems, behavioral health, physical therapy, vision and ophthalmology, dental, ABA therapy, home health, specialty medicine, oncology, and primary care. Products sold across those verticals: SmarterEligibility, SmarterAuthorizations, SmarterReceivables, ConverseAI, SmarterAgents, SmarterPosting, SmarterDenials, SmarterPreBill.

EMR platforms I evaluated integration readiness for: Epic, NextGen, Cerner, eClinicalWorks, Athena, Raintree, Meditech, ModMed, WellSky, Allscripts, iMediware, NextTech—and others. Twelve-plus platforms, each with different API maturity, different EDI capabilities, and different implementation complexity.

### The Numbers

61 deals personally managed (62% of company pipeline), $31.8M in pipeline value, $1.95M in closed-won revenue across five deals, 76 prospect directories with complete documentation, 8 product lines across 10+ healthcare verticals. I handled four times the deal volume of the second team member while maintaining quality scores above 80/100.

### Tech Stack

Notion (deal tracker databases, health indicators, status fields), Git (version-controlled deal state and history), Python (schema validation, deal tracker audit scripts), Claude Code (automated field updates and briefing generation)
