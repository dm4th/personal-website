---
Title: Thoughtful
Start: September, 2023
End: Current
---
# Discovering Thoughtful

After a couple of months interviewing at different companies, I realized I was spending significant time working on a product with a friend of mine. Rather than researching new problems, I felt I had already found a promising candidate. [DocWow](https://www.danielmathieson.com/info/projects/docwow) was gaining traction as an appeals letter generator for health insurance denials. After finishing the MVP, I researched competition in the AI-enabled RCM space and discovered Thoughtful AI. They had an open Solutions Architect role that I applied for immediately. Chris at Thoughtful was the only hiring manager who used my chat interface on this website to learn more about me—demonstrating exactly what he and Thoughtful valued. I knew I had found my next step.

At the time, Thoughtful was still an RPA shop serving any customer willing to pay, without a vertical specialty focus. The company was still searching for product-market fit. My Solutions Architect role was fairly general, emphasizing problem-solving and systems design. I was eager to enter a lucrative industry with complex problems to solve, and this assumption proved correct. 


# Solutions Architect

As a Solutions Architect at Thoughtful, I spent extensive time with customers understanding their systems and processes in detail. I then created comprehensive documentation called Master Automation Plans (MAPs) for our offshore development team. These MAPs were essentially detailed pseudo-code with data structures and precise instruction sets. Using this approach, we could automate virtually any process, whether on-premises or in the cloud. My job was nearly evenly split between education of and providing value to customers. I really enjoyed my early days delighting customers with what we could automate for them, and how it normally took all the way until our first live production runs for customers to really truly grasp what was possible for them.

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

### Master Automation Plans
#### Key Technologies
- Notion
- Markdown Formatting
- HTTP Requests

#### Description
At Thoughtful, I leveraged Notion to develop detailed Master Automation Plans (MAPs) that served as blueprints for customer automations. These documents contained comprehensive pseudo-code with step-by-step instructions that bridged the gap between customer requirements and technical implementation. 

I focused on optimizing efficiency by thoroughly documenting API endpoints and HTTP requests that could bypass traditional RPA steps, significantly reducing development time. Each MAP included structured JSON data schemas that clearly defined the data objects our automations would process. This approach ensured our offshore development team had precise implementation guidelines while providing transparency to customers.

These MAPs functioned as formal contracts between Thoughtful and our customers, establishing clear expectations for deliverables. By sharing these detailed technical specifications with both customers and engineers, we created alignment across stakeholders and streamlined the development process. This documentation approach became a cornerstone of our successful delivery methodology.

### Patient Credit Balancing
#### Key Technologies
- Notion
- Markdown Formatting
- HTTP Requests
- Python

#### Description
This project represents one of Thoughtful's most rapid deployment successes, where I designed and delivered a complete automation solution in just one week. The automation handled the critical financial task of applying credits to outstanding patient balances within the customer's Electronic Health Record (EHR) system.

The exceptional speed of this implementation was achieved through meticulous HTTP request mapping in the early design phase. Rather than relying on traditional Selenium-based web automation, I documented all required API endpoints and request patterns in the MAP, allowing our developer to implement direct system-to-system integration. This technical approach eliminated the brittleness typically associated with UI-based automation while dramatically accelerating the development cycle.

By focusing on the underlying technical architecture rather than surface-level interactions, we delivered a robust solution that processed patient credit applications with minimal maintenance requirements. This project established a new benchmark for our delivery timeframes and influenced our approach to subsequent automation designs.

### Automated Denial Appeals Letter Generation
#### Key Technologies
- Notion
- Markdown Formatting
- HTTP Requests
- Python
- Make
- OpenAI GPT 3.5

#### Description
This challenging project focused on automating the generation of insurance denial appeal letters, a critical revenue recovery process for healthcare providers. The system needed to analyze denial codes from payers, extract the context, and generate appropriate appeal letters to maximize reimbursement success rates and minimize revenue cycle time.

Working with a demanding customer who frequently shifted requirements, I navigated significant technical and relationship complexities. The core automation was initially developed using our standard Python-based framework. However, midway through implementation, the customer independently developed Make (formerly Integromat) workflows to handle portions of the letter generation process.

I pivoted our approach by developing integration layers between the customer's Make automations and our existing Python infrastructure. This required deep technical understanding of both platforms' capabilities and limitations. I constructed adapter workflows in Make that maintained data integrity while bridging between the customer's preferred workflow and our robust processing engine.

By leveraging OpenAI GPT-3.5 for contextual understanding of denial codes and implementing clean handoffs between systems, we ultimately delivered a hybrid solution that satisfied the customer's workflow preferences while maintaining our quality standards. The experience highlighted the importance of technical adaptability and relationship management when dealing with complex integration scenarios.


# Customer Engineer

As Thoughtful solidified its focus on healthcare automation, particularly within revenue cycle management, my role evolved significantly. Our team transitioned from Solutions Architects to Customer Engineers, reflecting our expanded responsibilities beyond process design into hands-on implementation and continuous improvement.

This evolution was driven by the increasing complexity of our healthcare implementations, which required deeper domain expertise and technical capabilities. Rather than simply documenting processes, we began developing the automation agents directly, applying our growing healthcare knowledge to build more sophisticated and effective solutions. This hands-on approach allowed us to recommend process optimizations that neither our customers nor traditional RPA developers would have identified.

Our small but specialized team (just three of us at this point) became the cornerstone of Thoughtful's technical delivery as the company achieved product-market fit. With rapid sales growth, my workweek expanded from an already intensive 50 hours to approximately 70 hours to meet demand. Our CEO, who doubled as our head of sales, frequently encouraged us with promises that we just needed to push through "two more months" of intense work—a timeline that continually extended as our sales pipeline grew.

Despite the challenging workload, this period was transformative as we developed expertise in healthcare automations that increasingly differentiated us from general-purpose RPA providers. Our deeper involvement in implementation allowed us to build more resilient and adaptable solutions tailored specifically to the complexities of healthcare billing and claims processing.

### Agent Telemetry and Analytics
#### Key Technologies
- PostgreSQL
- AWS
- Quicksight
- iFrames
- Python
- Next.js

#### Description
I identified a significant opportunity to transform our operational data into actionable business intelligence by leveraging the JSON metadata our automation agents were already generating. While this data was primarily used for debugging, I recognized its potential for performance analytics and value demonstration.

After learning from a platform engineer that this metadata was being stored in AWS, I began exploring AWS Quicksight's capabilities for data visualization. I prototyped a dashboard focused on eligibility verification metrics, transforming raw PostgreSQL data into visual insights that clearly demonstrated automation performance and business impact.

When I shared the initial dashboard with a customer, their enthusiastic response prompted immediate prioritization of this feature. I collaborated with our Next.js development team to implement a seamless dashboard integration using iFrames, allowing us to dynamically render Quicksight visualizations directly within our customer portal by passing dashboard IDs as parameters.

The technical implementation involved writing SQL queries to extract relevant performance metrics, configuring Quicksight to visualize the data effectively, and developing the frontend integration that made these insights accessible to customers. While I began work on automating dashboard creation, the varied nature of our automation builds and the need for a proper data lake architecture made fully productizing this feature challenging within our timeframe.

These dashboards became instrumental in our customer relationships, particularly at the executive level. By visualizing automation success rates, processing times, and cost savings, we provided customers with clear evidence of ROI and performance improvements. The project demonstrated how leveraging existing data through AWS services could create significant added value with relatively modest development investment.

### Multi-Portal Eligibility Verification
#### Key Technologies
- Notion
- Markdown Formatting
- HTTP Requests
- Python
- Google Sheets
- AWS
- Quicksight

#### Description
This complex project presented significant technical and project management challenges as we attempted to implement eligibility verification automation across multiple insurance portals. The scope was ambitious: automate verification processes across more than 20 distinct payer portals within a six-month timeframe—well beyond our established capacity of one portal integration every two months.

Facing this gap between commitment and capability, I developed a data-driven value attainment model using Google Sheets to quantify portal traffic and prioritize integrations based on volume impact. This analysis showed we could potentially cover approximately 80% of verification volume by focusing on the highest-traffic portals first—a more realistic target given our constraints.

The technical implementation required adapting our Python automation framework to handle the wide variation in portal designs, authentication methods, and data formats. For each portal, I documented unique technical requirements, HTTP request patterns, and data extraction methodologies in structured MAPs. We leveraged AWS infrastructure for concurrent processing and Quicksight dashboards to track performance metrics across portals.

Despite our structured approach, we encountered numerous technical obstacles, including unreliable portal interfaces, inconsistent data formatting, and authentication challenges. These issues, combined with our aggressive timeline, resulted in several deployment setbacks that required substantial rework.

This project provided invaluable lessons about setting realistic expectations, transparent communication with customers, and the importance of thorough technical discovery before making commitments. I spent considerable time working directly with the customer to rebuild trust and adjust expectations, ultimately delivering a solution that, while not meeting the original timeline, provided significant value through partial automation of their verification workflow.

The technical knowledge gained about diverse eligibility portals and the project management experience in handling challenging customer relationships proved invaluable for future implementations and helped establish more rigorous pre-sales technical assessment processes.

