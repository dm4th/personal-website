---
Title: "Smarter Technologies: Enterprise Deals"
Start: September, 2025
End: Current
---

# Enterprise Deal Execution

Enterprise healthcare deals are long, technically complex, and involve dozens of stakeholders. A single deal can span 30+ meetings over six months, involve multiple EMR integrations, require custom pricing models, and demand coordination with product, delivery, and executive teams. Losing context across that timeline is the default failure mode.

The platform I built was designed specifically to prevent that. Every deal has a complete, version-controlled history. Every meeting produces structured analysis. Every pricing conversation is documented. Four deals from my first seven months illustrate the range and depth of what that looks like in practice.

### Healthcare IT Platform Partnership ($1M/year, 2-year commitment)

The most meeting-intensive deal in the pipeline: 37 meetings spanning strategy sessions, technical deep-dives, integration planning, and commercial negotiation. This was an ecosystem integration play: embedding Smarter Technologies' automation into the partner's platform for their installed base of healthcare customers.

I built a dedicated implementation guide, delivery charter, and partner enablement package. The deal required evaluating the partner's HL7/FHIR integration capabilities, designing a multi-tenant deployment model, and modeling per-transaction economics at scale across their customer base. The complexity wasn't in any single meeting. It was in maintaining coherent context and a consistent technical narrative across 37 of them.

### Four-Region Deployment ($1.9M Year 1, CLOSED-WON)

A four-agent deployment across four distinct geographic regions for a benefits management platform. This deal demanded precise delivery scoping: four separate implementation teams, regional payer mix analysis, and phased rollout planning with different go-live timelines per region.

I built custom automation percentage estimates for each region, factoring in payer EDI readiness, portal RPA availability, and regional volume distributions. The pricing model combined fixed platform fees with variable per-transaction pricing, requiring a custom financial model rather than our standard pricing sheet. This was the first closed-won deal I drove end-to-end from technical discovery through contract.

### Large Regional Health System ($30-40M Year 1 potential)

The largest opportunity in the pipeline and a potential design partnership: a 65,000-employee regional health system. A deal of this scale requires a fundamentally different SE approach: executive-level architecture presentations rather than product demos, multi-year transformation roadmaps rather than standard implementation timelines, and joint innovation planning conversations rather than feature walkthroughs.

I led the technical discovery process, evaluating Epic integration depth, enterprise data architecture requirements, and deployment sequencing for a phased rollout across a complex multi-facility organization. The deal is still active. Health system procurement cycles are long. But it advanced further and faster than comparable opportunities in the market because of the technical depth and executive-level documentation we brought to every meeting.

### National Physical Therapy Network (~$8M, 920 clinics)

A physical therapy chain with 920 locations, significant operational complexity, and a common problem in multi-location healthcare: multiple EMR platforms across acquired practices, inconsistent SOPs, and high-volume eligibility verification requirements with meaningful denial rates.

I developed a custom automation estimation model accounting for their specific payer mix and multi-EMR landscape, delivered technical walkthroughs to their RCM leadership, and built the competitive differentiation narrative that advanced us to finalist stage. The multi-EMR situation required more nuanced scoping than a single-platform health system: different automation ceilings per EMR, different implementation sequencing, different FTE displacement projections.

### On-Site Discovery Workshops

For the largest and most complex opportunities, standard discovery calls weren't enough. I ran structured on-site workshop engagements at several health systems where the goal was to map the full revenue cycle from intake through payment reconciliation with business leaders, department managers, and IT staff all in the same room.

The format was consistent: two full days on-site. Day one was process mapping. We'd walk through every step of their RCM workflow, from patient registration and eligibility verification through claims submission, denial management, and payment posting. We'd use Notion for structured note-taking and Lucid for visual process maps, building a shared artifact in real time that everyone in the room could see and correct. The most important thing we captured on day one wasn't what they did. It was how they actually did it, including the informal workarounds, the exception-handling tribal knowledge, and the things that were technically in their SOP but nobody followed.

Day two was prioritization. With a complete process map on the wall, we'd work through a structured scoring exercise: for each workflow we'd identified, what was the level of effort to automate it versus the business value it would deliver? This exercise was as much about identifying what we would not build as what we would. Scoping down to the highest-value, highest-feasibility workflows and getting explicit agreement from the customer's leadership team before any engagement was signed was how we avoided the "we promised too much" failure mode that killed other implementations.

I ran this format with Jefferson Health (the 65,000-employee regional health system) and with Presbyterian Health in New Mexico, a large regional health system where we went on-site with a team of TPMs and customer success partners. Both engagements produced detailed prioritized workflow inventories that became the technical foundation for any subsequent commercial conversations. Presbyterian was notable for the breadth of their RCM operation: multiple facilities, complex payer mix, and a significant amount of workflow variability across their sites that the process mapping exercise surfaced and that would have caused serious delivery problems if we'd tried to scope it remotely.

The philosophy behind this approach: do the consultative discovery work before the customer signs, not after. Customers who understand exactly what will and won't be automated before purchase have dramatically better implementations than customers who learn the scope limitations post-sale. Pre-sale process mapping was more work upfront but eliminated the most common source of post-sale disappointment.

Personify Health's four-region deployment was scoped using a variant of this approach post-sale: a structured 9-step, 18-meeting process mapping engagement that mapped each region's payer mix, EMR configuration, and workflow specifics before any build work began. That level of scoping rigor is why a four-region deployment with four separate go-live timelines stayed on track.

### What Made These Work

Each of these deals required deep, deal-specific work. But the platform infrastructure underneath made that depth possible. Automated meeting analysis ensured I never lost track of what was said, what was promised, or what open questions remained. Version-controlled pricing documents meant every negotiation had a traceable history. Structured delivery scoping meant post-sale teams inherited real documentation rather than a handshake and a slide deck.

$1.95M in closed-won revenue. $31.8M in active pipeline. Two-person team.

### Tech Stack

Meeting analysis pipeline, Notion deal tracking, Python-based pricing models, automation estimation engine, delivery charter generation, Git-based deal history
