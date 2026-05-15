---
Title: "Healthcare Agent Data Layer: Independent Research Project"
Start: January, 2026
End: Current
---

# The Agent-Native Patient Data Platform

Since early 2026, I've been independently developing a product thesis for what I believe is the most important missing infrastructure layer in U.S. healthcare: an agent-native, patient-consented data platform that serves as the source of truth every healthcare AI agent builds against.

This work has produced investor and partner memos, a full business plan, a technical architecture document, and an analysis of the competitive landscape. It is not a side project in the casual sense. It is a founder-level research effort that has shaped how I think about every healthcare AI product decision I make in my current role.

### The Thesis

Every healthcare AI agent company today - Abridge, Ambience, Notable Health, Cohere Health, Anterior - rebuilds the same patient-data plumbing against the same 7 EHRs. Each company writes its own FHIR client, its own consent management layer, its own audit logging, its own mapping logic for specialty-specific data. This duplication exists because no shared infrastructure does the job.

The opportunity: build the platform that makes that plumbing unnecessary. Not a wrapper around existing EHR APIs, but a purpose-built clinical data repository (CDR) with three structural differences from what exists today:

1. **Agent-native, protocol-agnostic from day one.** Healthcare AI agents don't all speak the same protocol, and that will remain true. MCP became the de facto standard after November 2024, with Anthropic, OpenAI, and Google DeepMind all adopting it and every major EHR vendor building adapters by 2026. A2A is gaining traction alongside it. More protocols will follow. The point is not to bet on any single one. The point is to expose the same underlying primitives (read, write, consent-check, audit log) through whatever surface a given agent expects: MCP today, A2A and custom CLIs and SDKs alongside it, and whatever comes next. Every existing solution wraps incumbent APIs with a protocol adapter. That is not a platform. A platform is agent-first at the substrate level, before any specific protocol surface is chosen.

2. **Patient-consent as a primitive.** Every tool call should be checked against the patient's standing consent record with cryptographic attestation. This is "patient-centered" architecture made real, not a marketing claim. It also unlocks the regulatory path: patient-authorized data sharing under the 21st Century Cures Act is legally cleaner than provider-authorized sharing for many AI use cases.

3. **FHIR-backwards-compatible but not FHIR-constrained.** FHIR is the mandated API surface and must be supported outbound. But FHIR cannot cleanly model specialty-specific data: ABA trial-by-trial data, complex oncology treatment records, cardiology waveform data. The internal data model should be a typed extensible graph; FHIR is a projection layer, not ground truth. This is the architectural mistake Medplum, Oystehr, and every FHIR-as-ground-truth platform makes.

### Why Now

Three things converged in 2025 and 2026 that made this the right time to build. Not "the AI moment is here" in the abstract. Specific, time-bound triggers.

The federal mandate is the hardest deadline. CMS-0057-F requires every Medicare Advantage plan, Medicaid MCO, CHIP, and QHP issuer to expose four FHIR-based APIs by January 1, 2027: a Prior Authorization API, an Enrollee Attribution API, a Provider Directory API, and a Payer-to-Payer data portability API. CMS-0062-P (April 2026) adds prescription drug PA with an October 2027 compliance date. The legacy X12 278 clearinghouse requirement has been waived for pure-FHIR workflows. Only 9% of organizations are ready today. That gap is the market.

The antitrust environment is doing something I did not expect to see: cracking open healthcare data moats that were assumed to be permanent. Three active lawsuits against Epic allege data gatekeeping. The DOJ filed an omnibus antitrust case against UnitedHealth targeting Optum Insight's "informational monopoly," with a criminal component added in July 2025. The Change Healthcare breach (192.7 million records, $3.1 billion in response costs) made decentralized, patient-consented infrastructure look like the safer architecture. Not the riskier one.

And then there is CentralReach. Roper Technologies acquired it for $1.65 billion in April 2025. Roper's playbook is operational efficiency and EBITDA extraction, not innovation. The ABA market's dominant EHR is now owned by a company with no incentive to open up its developer platform and every incentive to protect margin. That is a 24-month window. It is open now.

### The ABA Wedge

Platforms don't launch horizontally. They pick a wedge and prove the architecture on the hardest possible problem. My wedge is ABA therapy.

ABA is a $7.9 billion market with 200,000+ professionals and 27 prior-authorization events per patient per year. The dominant EHR is CentralReach: recently acquired by Roper Technologies, technically vulnerable, and openly hostile to third-party integrations. CentralReach's public API sits behind a "connect with your dedicated CentralReach representative" gate that is functionally inaccessible to any third party not in their preferred-partner program. Their API legal addendum explicitly forbids sublicensing or building "an API that functions substantially the same." That is the same conduct Particle Health is litigating against Epic. ABA EHRs are not ONC-certified, so federal information-blocking penalties don't attach cleanly. But the customer hostility is real, and real customer hostility converts.

I chose ABA for a second reason: it is the worst possible fit for FHIR-as-ground-truth platforms. ABA trial-by-trial behavior data (session, program, target, trial with antecedent/prompt/response/consequence) is collected offline 20-40 hours per week per patient. It does not map cleanly onto FHIR Observation resources. Medplum, Aidbox, and Oystehr force it into nested components and extensions, producing a private dialect that defeats the interoperability promise. The native-model CDR with FHIR projection handles this natively. If the architecture works for ABA, it works for every other specialty more easily. ABA is the stress test. That's the point.

The reference EHR is deliberately scoped to around 30% of CentralReach's surface area: deep on the workflows where CR is genuinely weak, not broad on the full product. The 30% I target is credential management, claims scrubbing, denials and AR management, authorization-aware scheduling, and BCBA supervision tracking. These are the exact workflows I've spent the last two years building automation on top of CentralReach to fix. The reference EHR ships them as first-class AI-native features, not workarounds. What I explicitly don't build: the CR Institute LMS, the avail precision-teaching IP, full 50-state EVV engines, or proprietary assessments. Going for full parity means playing CentralReach's game on CentralReach's field, backed by Roper's balance sheet. That's a losing hand. The point is to sidestep it.

### The Platform + Reference Co Structure

The structure is two entities, with a spin-off built into the founding thesis from day one. That decision was not made reluctantly. It is the thesis.

Platform Co is the agent-native data layer: patient-consent primitives, a PA agent product, specialty extension packs, and agent-facing protocol surfaces (MCP today, A2A and custom SDKs/CLIs alongside it). It sells to healthcare AI companies who are tired of rebuilding the same data plumbing, and to provider engineering teams who need to build against EHR data without waiting for a vendor to grant access. The business model is usage-based: per agent call, per patient per month, per integration. The comparison I reach for is Plaid for fintech, Stripe for payments, Twilio for communications. Healthcare data needs that layer. Nobody has built it yet.

Reference Co is the ABA EHR reference implementation built on Platform Co. It sells to ABA clinics directly, demonstrates the platform's value in production, and generates the design-partner case studies that prove the architecture works in the real world. At Series A, it spins out as an independent company: its own cap table, its own fundraise, its own CEO. Platform Co retains preferred equity and platform-usage revenue indefinitely.

The spin-off is structural, not rhetorical. The moment Platform Co ships a competing EHR with parity ambitions, every other ABA EHR (Motivity, Rethink, Noteable, Raven, AlohaABA) refuses to integrate with the platform. That collapses the addressable market from "every healthcare AI agent and every vertical EHR" to "our own stack." Zus Health raised $74 million from a16z, F-Prime, Maverick, Rock Health, and Oxeon on the positioning Jonathan Bush calls "EHR's best friend." That positioning was the bet investors funded. This platform is the adjacent category: "agent's best friend." Category multiples are roughly 5x apart at exit. Partner EHRs need to believe the positioning is structural, not stated. A separate legal entity with a separate cap table is how you make it structural, not a verbal commitment, not a chinese wall inside the company.

### Competitive Landscape

The honest picture: there is no direct competitor in the category this platform occupies. That is either a red flag or an opportunity. I believe it is an opportunity, and the competitive landscape is why.

Medplum, Aidbox, and Oystehr are FHIR-as-ground-truth CDRs. FHIR is the right outbound API surface. It is the wrong internal data model for specialty depth. A native-model CDR with FHIR projection has a fundamentally different ceiling.

Canvas Medical is the closest architectural analog: a composable EHR with a Python SDK and plugin sandbox that won Best in KLAS for Ambulatory Specialty in 2026. But Canvas is an EHR that exposes an SDK. This is a data layer that includes a reference EHR. The ordering matters for category multiples and for how partner EHRs decide whether you are infrastructure or a competitor.

Zus Health raised $74 million from a16z, F-Prime, Maverick, Rock Health, and Oxeon to be "EHR's best friend": a shared clinical data layer that partner EHRs (Elation, Canvas, Healthie) build on top of. That category is real and well-funded. This is the adjacent category: "agent's best friend." Not the layer EHRs integrate with. The layer healthcare AI agents reach for when they need patient-level context.

Particle Health, Redox, 1upHealth, and Health Gorilla are interoperability infrastructure: health data APIs that move records between systems. None are agent-native. None treat patient consent as a runtime primitive. None do specialty extension packs. Adjacent, not competing.

Cohere Health, Tennr, AKASA, Anterior, and Latent have collectively raised over $700 million to build PA automation agents. Every one of them has rebuilt the same data plumbing against the same EHR APIs. Every one of them is a likely customer once the platform is in production. That is not wishful thinking. It is the pattern I watched play out in RCM automation for the past two years.

Epic, Oracle, and athenahealth are building in-house AI and publishing MCP servers. Those MCP servers are thin adapters over incumbent APIs. They do not have patient-consent primitives. They do not do specialty extension packs. Three active antitrust suits are creating openings in a regulatory posture that assumed permanent data moats. The opening is real. The window is not indefinite.

### Built With

FHIR R4, SMART on FHIR OAuth2, Model Context Protocol (MCP), TEFCA/Carequality analysis, Python, CDR architecture design
