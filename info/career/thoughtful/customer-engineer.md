---
Title: Thoughtful AI: Customer Engineer
Start: March, 2024
End: November, 2024
---

# Customer Engineer

As Thoughtful solidified its focus on healthcare automation, my role evolved significantly. Our team transitioned from Solutions Architects to Customer Engineers, reflecting expanded responsibilities beyond process design into hands-on implementation and continuous improvement.

This evolution was driven by the increasing complexity of our healthcare implementations, which required deeper domain expertise. Rather than documenting processes, we began developing the automation agents directly. Our small team (just three of us at this point) became the cornerstone of Thoughtful's technical delivery as the company achieved product-market fit. With rapid sales growth, my workweek expanded from 50 hours to approximately 70 hours. Our CEO, who doubled as head of sales, frequently promised we just needed "two more months" of intense work, a timeline that kept moving.

Despite the demanding pace, this period was transformative. We developed healthcare automation expertise that genuinely differentiated us from general-purpose RPA providers, and our deeper involvement in implementation let us build more resilient solutions tailored to the specific complexities of healthcare billing.

### Agent Telemetry and Analytics

I spotted an opportunity to transform the JSON metadata our automation agents were already generating for debugging purposes into customer-facing business intelligence.

After learning from a platform engineer that this metadata was stored in AWS, I explored AWS Quicksight's visualization capabilities. I prototyped a dashboard around eligibility verification metrics, transforming raw PostgreSQL data into visual insights demonstrating automation performance and business impact. When I shared the initial prototype with a customer, their enthusiastic response prompted immediate prioritization of the feature.

I worked with our Next.js team to integrate Quicksight dashboards directly into the customer portal via iFrames, dynamically rendering visualizations by passing dashboard IDs as parameters. The SQL queries extracted relevant performance metrics; the frontend made those insights accessible without customers needing to touch AWS directly.

These dashboards became instrumental in executive-level customer relationships. Showing automation success rates, processing times, and cost savings in clear visual terms made the ROI argument concrete in a way that narrative summaries never could.

The most technically demanding part was the data transformation layer. Our AI agents emitted deeply nested JSON as their execution output: structured logging for debugging, not for reporting. There was no dedicated data engineering team at this stage, so I became the de facto one. I wrote SQL queries that parsed and unnested JSON structures directly inside PostgreSQL, extracting fields from nested objects and arrays using SQL's JSON operators rather than preprocessing the data in Python. This let me query hundreds of thousands of agent execution records without standing up a separate ETL pipeline. It was a niche but powerful pattern: treating SQL as a scripting and transformation language, not just a query language.

This work also introduced me to building customer-facing analytics infrastructure with a skeleton crew. I was shipping SQL, integrating with frontend engineers on the iFrame embedding approach, and managing customer expectations about dashboard availability, all simultaneously, without a formal data team to hand off to.

Built with: PostgreSQL, AWS, Quicksight, iFrames, SQL JSON parsing, Python, Next.js

### Low-Code Automation Rescue and Extension

One of my early customers was a physician practice trying to build an AI-powered SOAP notes generator. They were using Make to wire together their clinical workflow: intake data flowing into a language model, structured output routing back to their EHR. The problem: the Make workflows were broken. Conditional logic was misfiring, webhook payloads weren't being parsed correctly, and the automations kept silently failing in ways the customer couldn't diagnose.

I stepped in and rebuilt the broken Make workflows from scratch: correcting the webhook configurations, fixing the JSON parsing logic in the routers, and restructuring the branching logic so failures surfaced clearly instead of disappearing. Once the foundation was solid, I extended the workflows to do more. Our AI agents at Thoughtful needed to be able to trigger those Make workflows programmatically, sending structured data via webhook so the agents could pull patient record context on demand as part of their execution. I built the webhook integration on both ends: the agent side (outbound payload construction) and the Make side (inbound routing to the right workflow branches).

The result was a tightly coupled system where Thoughtful's AI agents and the customer's Make automation layer spoke to each other bidirectionally: agents triggering Make workflows to fetch data, Make workflows triggering downstream actions on completion. It was my first direct hands-on experience with low-code automation platforms in a production clinical context, and it reinforced that low-code tools and full-code agents aren't alternatives. They're layers that need to interoperate cleanly.

Built with: Make (Integromat), webhooks, JSON, Python, Thoughtful AI agents

### Multi-Portal Eligibility Verification

This project tested my limits in both technical problem-solving and customer relationship management. The scope: automate eligibility verification across 20+ distinct payer portals within six months, far beyond our established pace of one new portal integration every two months.

Facing that gap between commitment and capacity, I built a data-driven value attainment model in Google Sheets to quantify portal traffic and prioritize integrations by volume impact. The analysis showed we could cover approximately 80% of verification volume by focusing on the highest-traffic portals first, a realistic target given our constraints.

Each portal required its own MAP documenting unique technical requirements, authentication methods, and data extraction methodologies. We hit substantial obstacles: unreliable portal interfaces, inconsistent data formatting, authentication edge cases that didn't surface until production. These issues, combined with the aggressive timeline, caused deployment setbacks that required significant rework and honest conversations with the customer about what we could realistically deliver.

The project provided some of my most valuable lessons about setting realistic expectations, transparent communication, and the importance of thorough technical discovery before making timeline commitments. I spent considerable time working directly with the customer to rebuild trust and adjust scope. The delivered solution provided real value. It just took longer and covered less than originally promised.

Built with: Python, Notion, Google Sheets, AWS, Quicksight

### Healthcare Data Interchange Formats

Working across 20+ payer portals and multiple EMR integrations gave me deep functional fluency in the healthcare data interchange standards that govern how payers, providers, and clearinghouses exchange information. I did not write low-level EDI parsers from scratch, but I worked extensively with these formats at the design and integration level: understanding their structure, the information they carry, and the ways they fail in practice, across nearly every automation we built.

**EDI X12 transactions** were the connective tissue of our eligibility and claims automation work:

- **270/271 (Eligibility Inquiry and Response)**: The 270 is the structured query a provider sends to a payer asking whether a patient is covered and what their benefits are. The 271 is the response: often thousands of characters of structured segments covering deductibles, copays, out-of-pocket maximums, and benefit-level limitations. My hybrid-RAG eligibility system was built specifically to make sense of the free-text limitation fields embedded inside 271 responses, which payers render inconsistently across plans. Understanding the loop and segment structure of the 271 was prerequisite to designing the extraction layer.

- **835 (Remittance Advice / ERA)**: The 835 is the electronic explanation of payment that payers send when adjudicating a claim. It tells providers what was paid, what was denied, at what rate, and why, using CARC and RARC codes. Our payment posting and denials management automations depended on parsing 835 files to classify denial reasons and route accounts to the correct follow-up workflow. I understood the 835 segment structure well enough to scope integrations and design downstream logic around adjustment reason codes.

- **276/277 (Claim Status Inquiry and Response)**: The 276 is a claim status request; the 277 is the response indicating whether a claim is pending, paid, or denied. We used these for automated claim statusingworkflows that replaced manual portal checks. Understanding the 277 response codes (and their inconsistent implementation across payers) was essential to building reliable denial detection logic.

**FHIR APIs** became increasingly relevant as EMR vendors opened read-level access. The key insight I developed: FHIR is excellent for reading structured patient data: demographics, clinical history, medication lists, encounter records. But most payer and billing workflows require writing back to the EHR, and FHIR write capabilities are inconsistently implemented or simply not available. Our standard architecture became FHIR for reads (patient lookup, eligibility context, prior auth history) combined with RPA for write-backs (posting results, updating records, triggering downstream workflows). This hybrid pattern let us integrate with modern EMRs without being blocked by write limitations.

**HL7 v2 interoperability** came up primarily in the context of automations I sold rather than built directly. Several of our most complex integrations (particularly in hospital systems running legacy infrastructure) required HL7 v2 message routing for admission, discharge, and transfer events (ADT) and order management (ORM/ORU). I understood the interoperability requirements well enough to scope these integrations and identify which customers would need middleware layers between their legacy HL7 infrastructure and our automation agents.

The practical value of this exposure: when a health system or payer asks what it would take to integrate their data pipeline with an AI workflow, I can have a specific conversation about where the 271 benefit data lives, how the 835 denial codes map to workflow decisions, and whether FHIR read access is sufficient or whether they'll need a write-back strategy. That specificity earns technical trust in a way that generic "we integrate with your EHR" framing never does.

### Saving Struggling Accounts

Our rapid growth, combined with some hiring missteps, created a crisis. Multiple customer implementations began showing distress simultaneously, faltering without adequate technical oversight. As these situations threatened both reputation and renewals, I identified the pattern early and volunteered to intervene.

I took on three times my standard implementation load, stepping in to stabilize accounts that had been left adrift. For each one: review the project history, identify the critical gaps in both technical implementation and customer expectations, develop a tailored recovery plan with clearly defined success metrics and timeline projections in Notion, and then execute.

This required 80+ hour weeks and frequent after-hours calls with anxious customers. I used Quicksight dashboards to provide transparent progress updates, rebuilding trust with stakeholders who had reason to be skeptical. I prioritized interventions using Python analysis tools to assess implementation health across my expanded portfolio.

I successfully stabilized most of the troubled implementations. One account had deteriorated beyond recovery before my intervention. That was a hard loss to accept. But the initiative prevented what could have been a significant wave of departures during a critical growth phase.

The experience crystallized something important: a company can have genuinely excellent technology and still fail its customers if growth outpaces operational discipline. The lessons from this period (early warning signs of implementation distress, how to rebuild fractured relationships, what sustainable scaling actually requires) have shaped my approach ever since.
