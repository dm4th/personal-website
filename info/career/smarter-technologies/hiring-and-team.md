---
Title: "Smarter Technologies: Hiring & Team"
Start: September, 2025
End: Current
---

# Building the SE Function

Building a sales engineering team in healthcare technology is a specific challenge. You need candidates who combine deep RCM domain knowledge with technical solution design ability, executive communication skills, and data reasoning capability. That combination is rare. Traditional interview processes (resume screens and behavioral questions) don't reliably surface it.

I designed an eight-dimension candidate evaluation framework from scratch, built as a Claude Code skill that processes both take-home submissions and live interview transcripts.

### The Evaluation Framework

Candidates receive a realistic case study: the A/R and Denials scenario using a fictional healthcare organization with real operational complexity. They deliver a written take-home analysis and a live presentation. The rubric evaluates eight dimensions:

**Core dimensions** (the non-negotiables):
- Discovery and Problem Framing: hypothesis quality, targeted questions, structured thinking
- RCM Fluency in A/R and Denials: denial mechanics, appeal workflows, payer behavior, AR aging drivers
- Solution Design and Deliverability: phased implementation plans, constraints, risks, dependencies
- Data Reasoning: uses data to drive decisions rather than just describe findings (pivots, cross-tabs, pattern recognition)

**Supporting dimensions** (important but teachable):
- Executive Communication: ROI logic, prioritization, CFO-ready narrative
- Ownership and Collaboration: stakeholder management, cross-functional awareness

**Differentiating dimensions** (the signals that separate good candidates from great ones):
- Pre-to-Post Handoff: quality of handoff artifacts, acceptance criteria, governance model
- AI/Automation Judgment: distinguishes where automation helps from where process change is the better investment

Each dimension is rated 1 to 5 with distinct signal tables for take-home and live interview artifacts. Strong candidates often excel in different modalities. Some write beautifully but freeze in live Q&A; others can't write a structured document but are exceptional in discovery conversations. The rubric is designed to capture both.

### Calibration Against Claude

After grading the first cohort, I compared my manual scores against Claude's default scoring of the same submissions and found systematic differences. Claude over-scored on solution specificity, delivery handoff detail, and confidence calibration. It was more charitable than I intended in contexts where vague or hedged answers shouldn't earn full credit.

I adjusted the rubric and Claude's scoring parameters to match my stricter baseline. The calibration step turned out to be as valuable as the rubric itself: it forced me to make explicit what signals I was actually looking for rather than relying on pattern-matching intuition.

### Operating as a Two-Person Team

For the first seven months, the SE team was two people: myself and a team lead. I handled four times the deal volume of the second team member while maintaining quality scores above 80/100 across the pipeline.

Cross-functional collaboration was constant: working with the CEO, two VPs of Sales, VP of Delivery, Product Manager, and Director of Commercial Operations on deal strategy, pipeline reviews, and product roadmap discussions. The role functioned more like a technical co-founder for the sales process than a traditional SE manager.

### Results

Standardized evaluation across all SE candidates. Calibrated scoring that reduces interviewer variance. Time-to-evaluate reduced from 2+ hours to 30 minutes per candidate. The rubric doubles as a training document for what strong healthcare SE performance looks like, useful for onboarding as much as for evaluation.

### Tech Stack

Claude Code (candidate evaluation skill), Fireflies (live interview transcripts), Notion (candidate tracking), Markdown (rubric specification and evaluation reports)
