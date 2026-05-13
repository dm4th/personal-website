---
Title: Smarter Technologies
Start: September, 2025
End: Current
---

# Director of Sales Engineering

In September 2025, Thoughtful AI underwent a private equity merger with three other healthcare automation companies to form Smarter Technologies. The timing hit during Thoughtful's Series B fundraising process and combined four companies into a single, larger entity focused on end-to-end healthcare revenue cycle automation.

The merger created an expected career pivot for me, but not for the reasons most would assume. As Lead Technical Product Manager, I'd spent the prior year becoming the essential technical voice in every major sales conversation at Thoughtful. The pre-sales track record was hard to ignore: 96% of prospects who met with me moved to proposal stage within a month. Sales teams broke scheduling rules to save stalling deals. "Just put Danny on a call, prospects love him" had become a standing instruction. When Smarter Technologies formed and the expanded sales organization needed to sharpen its messaging with prospects, the sales team had a blunt answer: "Can we just have Danny full-time?" I was promoted to Director of Sales Engineering the next day.

The role sits within delivery, which turned out to be exactly the right organizational home. As Director, I became the solutions leader for every large-scale engagement involving AI agents across all business units under Smarter Technologies, which in healthcare automation meant essentially every significant deal in the pipeline. Being accountable to delivery KPIs means I'm setting up intricate implementation cycles for success much earlier: during pre-sale rather than post-close, which is where things historically fell apart. The person scoping the deal is also accountable for its successful implementation.

There was no SE infrastructure when I started: no deal tracking, no meeting analysis pipeline, no prospect management system, no repeatable processes. The company was selling eight product lines across ten healthcare verticals with a team of two. We needed to operate at the scale of a team five times our size. So I built one.

Over seven months, I shipped 943 commits and 500+ pull requests while simultaneously managing $31.8M in active pipeline across 61 enterprise healthcare deals, 62% of total company pipeline. As the platform matured and word spread across the organization, team members were sending me Slack messages just to query my agent on their behalf. That was the signal to expand: I ported the highest-impact skills to Claude's Cowork platform so the whole team could run them directly, without needing to go through me.

### EMR Integration and FHIR Architecture

A recurring technical challenge across nearly every deal I ran at Smarter Technologies was scoping EMR integration architecture. Our agents needed to read patient and clinical data from the customer's EHR and write results back. The right approach differed significantly depending on the platform and what the agent was doing.

The pattern I settled on and used consistently: **FHIR for reads, RPA for write-backs**. FHIR APIs (available in modern Epic, Cerner, and Athena environments) are excellent for reading structured clinical and administrative data: patient demographics, encounter history, insurance coverage, prior authorization status, medication records. The FHIR R4 standard is well-implemented by the major EMR vendors for these read use cases, and it let us pull the context our agents needed without requiring custom API agreements or screen scraping.

Write-back was a different problem. FHIR write capabilities are inconsistently implemented across EMR vendors, and many of our agent workflows needed to post results back into the EHR: updating eligibility status, logging authorization outcomes, posting payment records. In most cases, FHIR write support either didn't exist or required negotiating custom implementation agreements. Our solution was RPA for these write operations: direct browser or native application automation that mimicked the billing team's manual steps. This was more brittle than an API integration, but it was the only path to write-back reliability across the range of systems we encountered.

This FHIR-read/RPA-write architecture became standard across our agent designs and shaped how I scoped integration feasibility during pre-sales technical discovery. When a prospect asked how we'd connect to their Epic environment, I could give a specific answer: FHIR endpoints for the data-in direction, and a defined set of write-back workflows handled through portal automation. That specificity was a meaningful differentiator in enterprise deals where the IT team was trying to understand actual implementation risk.

I scoped this architecture across 12+ EMR platforms (Epic, Cerner, Athena, eClinicalWorks, NextGen, Meditech, WellSky, ModMed, Raintree, and others), each with different levels of FHIR maturity, different API credential requirements, and different constraints on what could be automated. Understanding those differences at the platform level was essential to making accurate promises during pre-sales.

### Pages in This Section

- [AI-Powered SE Platform](/info/career/smarter-technologies/ai-se-platform): The operating system I built for all SE work
- [Meeting Intelligence](/info/career/smarter-technologies/meeting-intelligence): Five-agent parallel pipeline for processing sales calls
- [Pipeline Management](/info/career/smarter-technologies/pipeline-management): Managing 61 enterprise healthcare deals at once
- [ICP Scoring](/info/career/smarter-technologies/icp-scoring): Data-driven prospect prioritization framework
- [Demo Engineering](/info/career/smarter-technologies/demo-engineering): Reusable demo platform for 8 product lines
- [Enterprise Deals](/info/career/smarter-technologies/enterprise-deals): Landmark deals and how I executed them
- [Security & Compliance](/info/career/smarter-technologies/security-compliance): Automating security questionnaire responses
- [Commercial Innovation](/info/career/smarter-technologies/commercial-innovation): Pricing models and automation estimation
- [Hiring & Team](/info/career/smarter-technologies/hiring-and-team): Building the SE function from scratch
- [Shutdown and Retention](/info/career/smarter-technologies/shutdown-and-retention): What happened when the company shut down, and what came next
