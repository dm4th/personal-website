---
Title: Smarter Technologies — Meeting Intelligence
Start: September, 2025
End: Current
---

# Multi-Agent Meeting Intelligence

Our sales cycle generated enormous meeting volume. By March 2026 I had 483 meetings logged in Fireflies, totaling 271 hours of recorded conversation. Manually extracting action items, pricing signals, technical requirements, competitive intelligence, and deal health indicators from every call was simply not possible at our scale. Generic AI meeting summaries weren't the answer either—they miss the domain-specific signals that matter in healthcare RCM sales.

So I built a five-agent parallel analysis pipeline that processes every meeting through specialized lenses simultaneously.

### The Five Agents

When I run `/analyze-meeting`, the system dispatches the Fireflies transcript to five concurrent AI agents, each with a distinct analytical mandate:

**Sales Training Analyzer** evaluates pitch quality, objection handling, and discovery technique. It produces coaching-grade feedback with specific transcript references—the kind of call review that would normally require a sales manager listening to every recording.

**Commercial Pricing Analyzer** extracts every pricing signal from the conversation: willingness-to-pay indicators, budget constraints, competitive price anchors, volume leverage points. It builds cumulative pricing histories across multi-meeting deal cycles, so by meeting 10 I have a complete commercial picture of what a prospect will and won't accept.

**Product Feedback Analyzer** identifies feature requests, capability gaps, competitive feature comparisons, and integration requirements. Findings get routed to product management—this is how customer feedback from the field actually makes it into the product roadmap.

**Delivery Scoping Analyzer** assesses implementation complexity: EMR integration depth, data migration scope, organizational readiness, staffing implications. Its output feeds directly into delivery pod estimation, so the post-sale delivery team inherits a scoping document on day one rather than starting from scratch.

**Design Partnership Analyzer** evaluates strategic partnership potential—innovation appetite, executive sponsorship, co-development willingness, reference-ability. This one catches the signals that would otherwise get lost in a technically focused conversation.

### How It Works

The agents run in parallel via Claude Code's agent dispatch framework. Each is defined as a markdown specification in `.claude/agents/`—200 to 400 lines of domain-specific instruction. They share no state during execution. After all five complete, an orchestrator merges results into a comprehensive analysis document, updates the prospect's README and action items, creates a Notion Demo Meeting entry with scored metadata, and triggers a Deal Tracker update if any stage-changing signals were detected.

Each meeting analysis typically generates three to five files: the core analysis document, an updated README reflecting new information, updated action items, and sometimes updated pricing data and technical notes. Everything is version-controlled.

### Results

199 meetings analyzed with full multi-agent processing. Average engagement score of 81.1/100. Average pitch quality of 77.9/100. Analysis turnaround dropped from 30–45 minutes of manual work to under 5 minutes.

The more interesting outcome: this generated structured coaching data that would never have existed otherwise. A two-person SE team has no time for systematic call reviews. The pipeline made that possible.

### Tech Stack

Claude Code agents (parallel dispatch), Fireflies GraphQL API, Notion REST API, Python (YAML extraction, meeting metadata parsing), Git
