---
Title: Smarter Technologies — Enterprise Deals
Start: September, 2025
End: Current
---

# Enterprise Deal Execution

Enterprise healthcare deals are long, technically complex, and involve dozens of stakeholders. A single deal can span 30+ meetings over six months, involve multiple EMR integrations, require custom pricing models, and demand coordination with product, delivery, and executive teams. Losing context across that timeline is the default failure mode.

The platform I built was designed specifically to prevent that. Every deal has a complete, version-controlled history. Every meeting produces structured analysis. Every pricing conversation is documented. Four deals from my first seven months illustrate the range and depth of what that looks like in practice.

### Healthcare IT Platform Partnership ($1M/year, 2-year commitment)

The most meeting-intensive deal in the pipeline: 37 meetings spanning strategy sessions, technical deep-dives, integration planning, and commercial negotiation. This was an ecosystem integration play—embedding Smarter Technologies' automation into the partner's platform for their installed base of healthcare customers.

I built a dedicated implementation guide, delivery charter, and partner enablement package. The deal required evaluating the partner's HL7/FHIR integration capabilities, designing a multi-tenant deployment model, and modeling per-transaction economics at scale across their customer base. The complexity wasn't in any single meeting—it was in maintaining coherent context and a consistent technical narrative across 37 of them.

### Four-Region Deployment ($1.9M Year 1, CLOSED-WON)

A four-agent deployment across four distinct geographic regions for a benefits management platform. This deal demanded precise delivery scoping: four separate implementation teams, regional payer mix analysis, and phased rollout planning with different go-live timelines per region.

I built custom automation percentage estimates for each region, factoring in payer EDI readiness, portal RPA availability, and regional volume distributions. The pricing model combined fixed platform fees with variable per-transaction pricing, requiring a custom financial model rather than our standard pricing sheet. This was the first closed-won deal I drove end-to-end from technical discovery through contract.

### Large Regional Health System ($30–40M Year 1 potential)

The largest opportunity in the pipeline and a potential design partnership—a 65,000-employee regional health system. A deal of this scale requires a fundamentally different SE approach: executive-level architecture presentations rather than product demos, multi-year transformation roadmaps rather than standard implementation timelines, and joint innovation planning conversations rather than feature walkthroughs.

I led the technical discovery process, evaluating Epic integration depth, enterprise data architecture requirements, and deployment sequencing for a phased rollout across a complex multi-facility organization. The deal is still active—health system procurement cycles are long—but it advanced further and faster than comparable opportunities in the market because of the technical depth and executive-level documentation we brought to every meeting.

### National Physical Therapy Network (~$8M, 920 clinics)

A physical therapy chain with 920 locations, significant operational complexity, and a common problem in multi-location healthcare: multiple EMR platforms across acquired practices, inconsistent SOPs, and high-volume eligibility verification requirements with meaningful denial rates.

I developed a custom automation estimation model accounting for their specific payer mix and multi-EMR landscape, delivered technical walkthroughs to their RCM leadership, and built the competitive differentiation narrative that advanced us to finalist stage. The multi-EMR situation required more nuanced scoping than a single-platform health system—different automation ceilings per EMR, different implementation sequencing, different FTE displacement projections.

### What Made These Work

Each of these deals required deep, deal-specific work. But the platform infrastructure underneath made that depth possible. Automated meeting analysis ensured I never lost track of what was said, what was promised, or what open questions remained. Version-controlled pricing documents meant every negotiation had a traceable history. Structured delivery scoping meant post-sale teams inherited real documentation rather than a handshake and a slide deck.

$1.95M in closed-won revenue. $31.8M in active pipeline. Two-person team.

### Tech Stack

Meeting analysis pipeline, Notion deal tracking, Python-based pricing models, automation estimation engine, delivery charter generation, Git-based deal history
