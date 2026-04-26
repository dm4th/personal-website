---
Title: Thoughtful AI — Solutions Architect
Start: September, 2023
End: March, 2024
---

# Discovering Thoughtful

After my career break, I spent a couple months interviewing but found myself more energized by a project I'd been building with a friend. [DocWow](/info/projects/docwow) was gaining traction as an appeals letter generator for health insurance denials. While finishing the MVP, I researched the AI-enabled RCM space and found Thoughtful AI. They had an open Solutions Architect role that I applied for immediately.

Chris at Thoughtful was the only hiring manager who used the chat interface on my personal website to learn more about me—demonstrating exactly what Thoughtful valued. I knew I'd found my next step.

At the time, Thoughtful was still an RPA shop serving any customer willing to pay, without a vertical focus. The company was still searching for product-market fit. My Solutions Architect role was fairly general, emphasizing problem-solving and systems design. Healthcare's complexity—especially the misaligned incentives in insurance billing—meant there were genuinely fascinating problems to work on.

# Solutions Architect

As a Solutions Architect, I spent extensive time with customers understanding their systems and processes in detail. I created comprehensive documentation called Master Automation Plans (MAPs) for our offshore development team—essentially detailed pseudo-code with data structures and precise instruction sets. Using this approach, we could automate virtually any process, whether on-premises or in the cloud. My job was nearly evenly split between educating customers and delivering value to them. I loved the early days when customers didn't fully believe what was possible until they saw their first live production run.

As we built more automations, it became clear that healthcare RCM offered our fastest path to growth. Healthcare billing is ideal for automation: providers prioritize patient care, payers are incentivized to minimize claim payouts, and the resulting complexity creates endless operational work that neither side enjoys. Our pivot to healthcare RCM created fascinating challenges for a systems-thinker.

### Hybrid-RAG for Dental Eligibility

Dental eligibility verification is one of the hardest tasks in RCM. Coverage details—procedure-level limitations, age restrictions, benefit maximums, tooth-specific rules—live in unstructured free-text fields that vary wildly across payers. The classic signal of a genuinely hard automation problem appeared when I asked customers to describe their decision rules and they said, "I don't know, I just do it."

We had accumulated labeled training data from previous client work. I matched that data to correct eligibility determinations for various code-level limitations, formatted the inputs as prompt-ready strings, and compiled everything in an Excel file that the client verified for accuracy. I then loaded this verified data into AWS RDS, embedding each input string with OpenAI's small embedding model, and built a daily pipeline to import new examples.

The key innovation was using vector similarity to find relevant examples and inject them into GPT-3.5 prompts for in-context learning. For exact matches to previously seen cases, we bypassed the embedding and LLM steps entirely. For new scenarios, we wrote our predicted answer to the spreadsheet for customer verification—and each verified answer became a new training example.

Using five similar examples for in-context learning, we achieved over 95% accuracy within two days and 100% accuracy shortly after. The approach was so successful that we implemented similar hybrid-RAG systems in three more automations within a month. Within two months of joining Thoughtful, I was presenting this feature to our board as a breakthrough innovation.

Built with: Python, Jupyter Notebook, OpenAI GPT-3.5, OpenAI Text Embedding Small, pgvector, AWS RDS, SharePoint API

### Master Automation Plans

MAPs were the documentation backbone of every automation we built—detailed pseudo-code with step-by-step instructions bridging customer requirements and technical implementation. I optimized them by thoroughly documenting API endpoints and HTTP requests that could bypass traditional RPA steps, significantly reducing development time and making automations far less brittle.

Each MAP included structured JSON data schemas defining the objects our automations would process, precise error-handling specifications, and explicit integration points. These documents functioned as formal contracts between Thoughtful and our customers—shared with both the client and the offshore engineering team to create alignment across all stakeholders.

### Patient Credit Balancing

This project represents one of our fastest delivery successes: a complete automation solution in one week. The automation applied credits to outstanding patient balances within the customer's EHR system.

The speed came from meticulous HTTP request mapping in the design phase. Rather than relying on Selenium-based web automation, I documented all required API endpoints in the MAP, letting our developer implement direct system-to-system integration. This eliminated brittleness and dramatically accelerated the build cycle. It established a new benchmark for our delivery timeframes.

### Denial Appeals Letter Generation

An automation that analyzed denial codes from payers, extracted context, and generated appeal letters to maximize reimbursement recovery. The core was built in our standard Python framework, but midway through, the customer independently built Make (formerly Integromat) workflows for portions of the process.

I pivoted to build integration layers between their Make automations and our Python infrastructure—adapter workflows that maintained data integrity while bridging both systems. Leveraging GPT-3.5 for contextual understanding of denial codes, we delivered a hybrid solution that worked with the customer's preferences while meeting our quality standards. The project taught me as much about technical adaptability as about the underlying automation.
