---
Title: "Thoughtful AI: Solutions Architect"
Start: September, 2023
End: March, 2024
---

# Discovering Thoughtful

After my career break, I spent a couple months interviewing but found myself more energized by a project I'd been building with a friend. [DocWow](/info/projects/docwow) was gaining traction as an appeals letter generator for health insurance denials. While finishing the MVP, I researched the AI-enabled RCM space and found Thoughtful AI. They had an open Solutions Architect role that I applied for immediately.

Chris at Thoughtful was the only hiring manager who used the chat interface on my personal website to learn more about me, demonstrating exactly what Thoughtful valued. I knew I'd found my next step.

At the time, Thoughtful was still an RPA shop serving any customer willing to pay, without a vertical focus. The company was still searching for product-market fit. My Solutions Architect role was fairly general, emphasizing problem-solving and systems design. Healthcare's complexity (especially the misaligned incentives in insurance billing) meant there were genuinely fascinating problems to work on.

# Solutions Architect

As a Solutions Architect, I spent extensive time with customers understanding their systems and processes in detail. I created comprehensive documentation called Master Automation Plans (MAPs) for our offshore development team: essentially detailed pseudo-code with data structures and precise instruction sets. Using this approach, we could automate virtually any process, whether on-premises or in the cloud. My job was nearly evenly split between educating customers and delivering value to them. I loved the early days when customers didn't fully believe what was possible until they saw their first live production run.

As we built more automations, it became clear that healthcare RCM offered our fastest path to growth. Healthcare billing is ideal for automation: providers prioritize patient care, payers are incentivized to minimize claim payouts, and the resulting complexity creates endless operational work that neither side enjoys. Our pivot to healthcare RCM created fascinating challenges for a systems-thinker.

### Hybrid-RAG for Dental Eligibility

Dental eligibility verification is one of the hardest tasks in RCM. Coverage details (procedure-level limitations, age restrictions, benefit maximums, tooth-specific rules) live in unstructured free-text fields that vary wildly across payers. The classic signal of a genuinely hard automation problem appeared when I asked customers to describe their decision rules and they said, "I don't know, I just do it."

We had accumulated labeled training data from previous client work. I matched that data to correct eligibility determinations for various code-level limitations, formatted the inputs as prompt-ready strings, and compiled everything in an Excel file that the client verified for accuracy. I then loaded this verified data into AWS RDS, embedding each input string with OpenAI's small embedding model, and built a daily pipeline to import new examples.

The key innovation was using vector similarity to find relevant examples and inject them into GPT-3.5 prompts for in-context learning. For exact matches to previously seen cases, we bypassed the embedding and LLM steps entirely. For new scenarios, we wrote our predicted answer to the spreadsheet for customer verification, and each verified answer became a new training example.

Using five similar examples for in-context learning, we achieved over 95% accuracy within two days and 100% accuracy shortly after. The approach was so successful that we implemented similar hybrid-RAG systems in three more automations within a month. Within two months of joining Thoughtful, I was presenting this feature to our board as a breakthrough innovation.

### Production Deployment and Accuracy Maintenance

This was not a prototype; it was a live production system used by customer agents every day as part of their eligibility verification workflows. Customer service agents at dental billing teams relied on it to make correct benefit determination calls on real patient accounts. The system had a direct financial impact: a wrong determination meant either a denied claim or an unnecessary write-off.

Because accuracy had direct business consequences, I built a test and evaluation framework from the start. I maintained a labeled holdout dataset of edge cases and ran the model against it every time we added new training examples or changed the prompt structure. This let me catch accuracy regressions before they reached production. I tracked precision and recall by limitation category (age restrictions, frequency limits, tooth-specific rules) because failure modes were not uniform across types. When accuracy dipped below the 95% threshold we had committed to customers, I traced it to specific categories and either added targeted examples or adjusted the retrieval logic.

Over the two years I worked in this system and its successors, I ran dozens of evaluation cycles, wrote test suites in Python with Jupyter notebooks, and learned more about what makes RAG-based systems fail in production than I would have from any course. The pattern I internalized (rapid prototyping, tight eval loop, customer-verifiable accuracy benchmarks) carried into every GenAI system I designed after it.

Built with: Python, Jupyter Notebook, OpenAI GPT-3.5, OpenAI Text Embedding Small, pgvector, AWS RDS, SharePoint API

### Master Automation Plans

MAPs were the documentation backbone of every automation we built, but describing them as "documentation" undersells what they actually were. A MAP was simultaneously a PRD, a technical specification, and a pseudo-code implementation plan. Writing one required sitting with a customer for anywhere from 8 to 20 hours to fully capture their standard operating procedure for a given workflow. Most customers couldn't tell you their own decision rules. They just did it. Extracting that implicit knowledge and making it explicit was the first real deliverable.

The output of those sessions was a document that walked through every logical decision and pathway the agent needed to follow to complete the workflow: what data to read from which system, what conditions triggered which path, what to do when edge cases occurred, what to return as output, and how to handle failures at each step. It was pseudo-code in the true sense: structured enough for engineers to implement directly, written in plain language so the customer could verify it accurately reflected their intent.

I'd hand the MAP to our offshore development team as the primary build artifact. Then I'd create formal success criteria that the customer would review and sign off on. It was a definition of done that both sides agreed to before a single line of code was written. That sign-off prevented the most common failure mode in implementation work: scope drift and disagreement about what "done" meant.

Once the build was ready, I'd execute the testing plan I wrote alongside the MAP. I was the QA layer before anything touched a customer environment. When defects surfaced, I documented them against the original MAP so engineers had precise reproduction cases, not vague reports.

A core principle I built into every MAP was the push toward determinism. Our customers needed our agents to perform an order of magnitude better than their best human. Not just as good, not "close enough." Non-deterministic LLM reasoning paths often couldn't hit that bar reliably, and customers weren't comfortable with probabilistic outputs on financial workflows. So wherever possible, I designed the MAP to specify deterministic logic: explicit conditions with explicit outcomes. The hybrid-RAG system was a direct expression of this: it built a growing library of deterministic answers derived from human-verified examples, so the non-deterministic reasoning path shrank over time rather than persisting indefinitely. Every MAP I wrote tried to push the agent toward the same convergence: reduce the scope of what requires inference, maximize the scope of what's rule-driven.

The internal analytics and tracking for each automation were also mine to build. I instrumented every agent with the telemetry needed to measure its production performance, and then built customer-facing dashboards as the foundation for what became our formal customer analytics product. Customers had visibility into accuracy rates, processing volumes, and exception counts without needing to access our internal systems.

Each MAP included structured JSON data schemas defining the objects our automations would process, precise error-handling specifications, and explicit integration points. These documents functioned as formal contracts between Thoughtful and our customers, shared with both the client and the offshore engineering team to create alignment across all stakeholders.

### Patient Credit Balancing

This project represents one of our fastest delivery successes: a complete automation solution in one week. The automation applied credits to outstanding patient balances within the customer's EHR system.

The speed came from meticulous HTTP request mapping in the design phase. Rather than relying on Selenium-based web automation, I documented all required API endpoints in the MAP, letting our developer implement direct system-to-system integration. This eliminated brittleness and dramatically accelerated the build cycle. It established a new benchmark for our delivery timeframes.

### Denial Appeals Letter Generation

An automation that analyzed denial codes from payers, extracted context, and generated appeal letters to maximize reimbursement recovery. The core was built in our standard Python framework, but midway through, the customer independently built Make (formerly Integromat) workflows for portions of the process.

I pivoted to build integration layers between their Make automations and our Python infrastructure, adapter workflows that maintained data integrity while bridging both systems. Leveraging GPT-3.5 for contextual understanding of denial codes, we delivered a hybrid solution that worked with the customer's preferences while meeting our quality standards. The project taught me as much about technical adaptability as about the underlying automation.
