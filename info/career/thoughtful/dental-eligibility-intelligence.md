---
Title: "Dental Eligibility Intelligence"
Start: Oct 2023
End: Jan 2024
Link: /projects/dental-eligibility
---

# Dental Eligibility Intelligence

**[Try the live demo →](/projects/dental-eligibility)**

This is the system I'm most proud of from my time at Thoughtful AI. Within two days of deploying to production, it hit 95%+ accuracy on a live dental billing workflow. Within a few weeks, it was close to 100%.

The demo on this site is a faithful recreation using current OpenAI APIs.

### The Problem

Dental eligibility verification is one of the hardest tasks in revenue cycle management.

When a patient checks in for a procedure, someone has to answer: is this procedure covered? At what percentage? Is the deductible met? Are there frequency limitations that would trigger a denial?

The source of truth is the 271 EDI response — a structured but verbose X12 document that can run thousands of characters. Payers embed coverage rules in free-text limitation fields that vary wildly across plans. One payer writes "Amalgam restorations covered at 80%"; another writes "Basic restorative services subject to plan provisions at standard benefit level." Same information, completely different encoding.

Human billing specialists learn to read these responses over years. The question was whether we could teach a model to do it well enough to route claims automatically.

### The Architecture: Hybrid RAG

The system uses what I call a hybrid-RAG approach:

1. **Embedding**: Each eligibility query (procedure code + description + payer + coverage text) gets embedded using OpenAI's text-embedding-3-small model
2. **Similarity search**: The query embedding is compared against a library of previously verified cases using cosine similarity in pgvector
3. **Exact-match bypass**: If similarity exceeds a threshold (~0.97), the system returns the stored determination without calling the LLM. No tokens consumed. No latency from generation
4. **RAG + synthesis**: For novel cases, the top-k most similar verified cases are assembled as few-shot context, and GPT-3.5 (now GPT-4o in the demo) synthesizes a structured determination

### The Determinism Principle

The most important design decision wasn't architectural — it was philosophical.

Healthcare billing has near-zero tolerance for probabilistic outputs. A wrong eligibility determination means a denied claim, a delay in payment, and a patient who gets an unexpected bill. The goal isn't to use AI everywhere; it's to use AI only where it genuinely adds value.

So I designed the system to converge toward determinism over time. Every time a human billing specialist confirmed a determination was correct, that case was promoted to a hard-coded answer. The system's reliance on live LLM inference shrank with every cycle. Eventually, most queries were handled by exact match — no model call at all.

The interactive demo lets you see this principle in action. Approve a hybrid-RAG result and it gets added to the case library. Re-run the same query: it now hits exact match.

### Production Results

- **95%+ accuracy within 2 days** of initial deployment
- **Near 100% accuracy** after the first few human review cycles
- The system ran live as part of customer agents' daily eligibility verification workflows

### Design Decisions

**Why RAG over fine-tuning?**

Interpretability. A fine-tuned model gives you an answer with no citation. A RAG determination tells you exactly which cases influenced the result and what their similarity scores were. When a determination is wrong, you can trace why — and fix it by adding a correctly-verified case to the library, not by retraining a model.

Fine-tuning also requires substantial labeled data upfront and retraining cycles whenever coverage rules change. RAG lets you add new cases continuously without touching the model.

**Why not a rules engine?**

Payer coverage language is too inconsistent for deterministic rules to generalize. You'd need thousands of payer-specific rules, maintained manually. RAG handles the variation through similarity — the model learns from analogous cases rather than explicit rules.

**Low temperature**

GPT calls use temperature 0.1. Eligibility determinations need clinical consistency, not creative interpretation.

### Tech Stack

- **Python** — core inference pipeline
- **OpenAI text-embedding-3-small** — query and case embeddings
- **pgvector on AWS RDS** — cosine similarity search at production scale
- **GPT-3.5** (now GPT-4o in demo) — structured JSON determination generation
- **SharePoint API** — importing new verified cases from the human review workflow

### The Demo

The demo at [/projects/dental-eligibility](/projects/dental-eligibility) uses 18 synthetic cases covering the full range of scenarios: exact matches, novel cases with ambiguous payer language, age restrictions, frequency limit triggers, annual maximum exhaustion, and low-confidence cases that route to human review.

It's not connected to real PHI. It's a clean rebuild designed to show how the system works, not to process real patient data.
