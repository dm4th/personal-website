---
Title: "Healthcare Agent Data Layer — Independent Research Project"
Start: January, 2026
End: Current
---

# The Agent-Native Patient Data Platform

Since early 2026, I've been independently developing a product thesis for what I believe is the most important missing infrastructure layer in U.S. healthcare: an MCP-native, patient-consented data platform that serves as the source of truth every healthcare AI agent builds against.

This work has produced three versions of investor and partner memos, a full business plan, a technical architecture document, and an analysis of the competitive landscape. It is not a side project in the casual sense. It is a founder-level research effort that has shaped how I think about every healthcare AI product decision I make in my current role.

### The Thesis

Every healthcare AI agent company today — Abridge, Ambience, Notable Health, Cohere Health, Anterior — rebuilds the same patient-data plumbing against the same 7 EHRs. Each company writes its own FHIR client, its own consent management layer, its own audit logging, its own mapping logic for specialty-specific data. This duplication exists because no shared infrastructure does the job.

The opportunity: build the platform that makes that plumbing unnecessary. Not a wrapper around existing EHR APIs, but a purpose-built clinical data repository (CDR) with three structural differences from what exists today:

1. **MCP-native from day one.** Anthropic's Model Context Protocol became the de facto agent-tool standard after November 2024, with OpenAI, Google DeepMind, and every major EHR vendor building adapters by 2026. But existing MCP servers wrap incumbent APIs. There is no MCP-native healthcare data *platform*. The read path, write path, consent-check, and audit log should all be MCP tools before they are REST endpoints.

2. **Patient-consent as a primitive.** Every tool call should be checked against the patient's standing consent record with cryptographic attestation. This is "patient-centered" architecture made real, not a marketing claim. It also unlocks the regulatory path: patient-authorized data sharing under the 21st Century Cures Act is legally cleaner than provider-authorized sharing for many AI use cases.

3. **FHIR-backwards-compatible but not FHIR-constrained.** FHIR is the mandated API surface and must be supported outbound. But FHIR cannot cleanly model specialty-specific data: ABA trial-by-trial data, complex oncology treatment records, cardiology waveform data. The internal data model should be a typed extensible graph; FHIR is a projection layer, not ground truth. This is the architectural mistake Medplum, Oystehr, and every FHIR-as-ground-truth platform makes.

### The Perplexity Connection

In May 2026, I submitted a Perplexity exercise thread for a Product Manager (Builder) application. Rather than teaching the product team a hobby topic, I used the thread to argue that Perplexity is strategically positioned to own this infrastructure layer.

The argument: Perplexity already sits where the agent meets the tools. In a world where MCP becomes the lingua franca for agent-tool connectivity, there will be a default healthcare data MCP server that agents call when they need patient-level context. If Perplexity does not co-design that surface, it will inherit the constraints of whoever does. Perplexity's model-plus-orchestration expertise, infrastructure mindset, and capital profile are a better fit for this than any healthcare-vertical startup — because healthcare data infra is multi-year, capital-intensive, and regulatory-heavy, and most vertical startups underbuild the platform.

The thread walked through five steps: how HITECH created the EHR oligopoly, why 21st Century Cures Act enforcement is inverting the regulatory capture, the current FHIR-plus-legacy technical landscape, why the U.S. healthcare system is not ready for the agentic AI revolution, and why Perplexity specifically is positioned to fix it.

### Why This Matters for the Role

My interest in this space is not abstract. I have:

- Spent two years building production AI systems that navigate exactly these constraints: FHIR-based data access, multi-portal eligibility verification, EHR-specific integration patterns across 12+ platforms, RPA for write-backs where APIs don't exist.
- Designed hybrid-RAG architectures specifically to handle the data quality problems that come from free-text clinical notes and inconsistent coding across systems.
- Built agent workflows for healthcare RCM automation where a wrong answer has direct financial consequences, which is the highest bar for AI system reliability.

The business plan, investor memos, and partner memos represent the translation of that hands-on experience into a product and market thesis. I am not proposing something I've read about. I am proposing something I've been building toward for two years.

### Materials

- Business Plan v3: MCP-First Patient Data Platform with ABA EHR as Reference Implementation
- Investor Memo v3: The Agent-Native Patient Data Platform
- Partner Memo v3: The Agent-Native Patient Data Platform
- Technical Solution Architecture v1
- Competitive Analysis: bWell vs. Agent-Native Platform
- Market Research: U.S. Healthcare EMR Data Landscape — History, Privacy, Interoperability, Litigation & Market Opportunity

### Built With

FHIR R4, SMART on FHIR OAuth2, Model Context Protocol (MCP), TEFCA/Carequality analysis, Python, CDR architecture design
