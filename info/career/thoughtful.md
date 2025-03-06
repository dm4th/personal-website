---
Title: Thoughtful
Start: September, 2023
End: Current
---
# Discovering Thoughtful

After a couple of months interviewing at different companies, I realized I was spending significant time working on a product with a friend of mine. Rather than researching new problems, I felt I had already found a promising candidate. [DocWow](https://www.danielmathieson.com/info/projects/docwow) was gaining traction as an appeals letter generator for health insurance denials. After finishing the MVP, I researched competition in the AI-enabled RCM space and discovered Thoughtful AI. They had an open Solutions Architect role that I applied for immediately. Chris at Thoughtful was the only hiring manager who used my chat interface on this website to learn more about me—demonstrating exactly what he and Thoughtful valued. I knew I had found my next step.

At the time, Thoughtful was still an RPA shop serving any customer willing to pay, without a vertical specialty focus. The company was still searching for product-market fit. My Solutions Architect role was fairly general, emphasizing problem-solving and systems design. I was eager to enter a lucrative industry with complex problems to solve, and this assumption proved correct. 


# Solutions Architect

As a Solutions Architect at Thoughtful, I spent extensive time with customers understanding their systems and processes in detail. I then created comprehensive documentation called Master Automation Plans (MAPs) for our offshore development team. These MAPs were essentially detailed pseudo-code with data structures and precise instruction sets. Using this approach, we could automate virtually any process, whether on-premises or in the cloud. 

As we built more automations, it became clear that healthcare—specifically revenue-cycle-management (RCM)—offered our fastest path to growth. Healthcare billing is ideal for automation due to the misaligned incentives in health insurance. While providers prioritize patient care, payers are incentivized to minimize claim payouts. This creates a system favoring insurers, with healthcare costs rising as providers struggle with high denial rates. Our pivot to healthcare RCM created fascinating challenges for a systems-thinker like myself to solve.

### Hybrid-RAG
#### Key Technologies
- Python
- Jupyter Notebook
- Cursor
- OpenAI GPT3.5
- OpenAI Text Embedding Small
- Microsoft Excel
- Sharepoint API
- pgvector
- AWS RDS

#### Description
Dental eligibility verification is one of the most challenging tasks in RCM. Services have varying coverage levels, exclusions, and limitations depending on the patient's specific plan. Patient demographics and dental history significantly impact eligibility determinations. Dental offices often check eligibility for numerous services in advance, even when they're not initially scheduled, to allow flexibility during appointments.

Coverage details are typically communicated through unstructured free-text fields. For example, a procedure code like D0140 might have limitations described as "2x per year," "2x," or "twice per year" across different payer systems. These fields also contain information about age restrictions, benefit maximums related to other codes, and tooth-specific limitations. This unstructured text makes edge cases unpredictable, especially with payers that intentionally create complexity. The classic indicator of a difficult automation problem appeared when I asked clients to define their decision rules and they responded, "I don't know, I just do it." 

Fortunately, we had accumulated valuable training data from previous work with the client. I retrieved this data and matched it to correct eligibility determinations for various code-level limitations. I formatted these inputs as prompt-ready strings and mapped them to their respective outputs, creating structured input→output pairs for prompt engineering. All individual inputs, outputs, and prompt strings were compiled in an Excel file and verified by the client for accuracy.

I then loaded this verified data into an AWS RDS database, embedding each input string using OpenAI's small embedding model. I built a pipeline to import new spreadsheet data with embeddings daily. The engineering team retrofitted our agent to collect unstructured data and add it to the spreadsheet with our predicted answers. When uncertain (about 80% of initial cases), we would alert the customer that automation couldn't resolve the case. The customer would provide the correct answer, giving us new labeled examples to learn from.

The key innovation was using vector similarity to find relevant examples from our database and inject them into prompts for GPT-3.5. For exact matches to previously seen cases, we could bypass the embedding and LLM steps entirely and return pre-approved results. For new scenarios, we would write our predicted answer to the spreadsheet for customer verification. Once approved, each case became a new example in our system, while providing accuracy feedback. Using just five similar examples for in-context learning, we achieved over 95% accuracy within two days and 100% accuracy shortly after.

This hybrid RAG approach proved so successful that we implemented similar systems in three more automations within a month. Within two months of joining Thoughtful, I was presenting this feature to our board as a breakthrough innovation.
