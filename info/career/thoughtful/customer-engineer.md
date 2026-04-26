---
Title: Thoughtful AI — Customer Engineer
Start: March, 2024
End: November, 2024
---

# Customer Engineer

As Thoughtful solidified its focus on healthcare automation, my role evolved significantly. Our team transitioned from Solutions Architects to Customer Engineers, reflecting expanded responsibilities beyond process design into hands-on implementation and continuous improvement.

This evolution was driven by the increasing complexity of our healthcare implementations, which required deeper domain expertise. Rather than documenting processes, we began developing the automation agents directly. Our small team—just three of us at this point—became the cornerstone of Thoughtful's technical delivery as the company achieved product-market fit. With rapid sales growth, my workweek expanded from 50 hours to approximately 70 hours. Our CEO, who doubled as head of sales, frequently promised we just needed "two more months" of intense work—a timeline that kept moving.

Despite the demanding pace, this period was transformative. We developed healthcare automation expertise that genuinely differentiated us from general-purpose RPA providers, and our deeper involvement in implementation let us build more resilient solutions tailored to the specific complexities of healthcare billing.

### Agent Telemetry and Analytics

I spotted an opportunity to transform the JSON metadata our automation agents were already generating for debugging purposes into customer-facing business intelligence.

After learning from a platform engineer that this metadata was stored in AWS, I explored AWS Quicksight's visualization capabilities. I prototyped a dashboard around eligibility verification metrics, transforming raw PostgreSQL data into visual insights demonstrating automation performance and business impact. When I shared the initial prototype with a customer, their enthusiastic response prompted immediate prioritization of the feature.

I worked with our Next.js team to integrate Quicksight dashboards directly into the customer portal via iFrames, dynamically rendering visualizations by passing dashboard IDs as parameters. The SQL queries extracted relevant performance metrics; the frontend made those insights accessible without customers needing to touch AWS directly.

These dashboards became instrumental in executive-level customer relationships. Showing automation success rates, processing times, and cost savings in clear visual terms made the ROI argument concrete in a way that narrative summaries never could.

Built with: PostgreSQL, AWS, Quicksight, iFrames, Python, Next.js

### Multi-Portal Eligibility Verification

This project tested my limits in both technical problem-solving and customer relationship management. The scope: automate eligibility verification across 20+ distinct payer portals within six months—far beyond our established pace of one new portal integration every two months.

Facing that gap between commitment and capacity, I built a data-driven value attainment model in Google Sheets to quantify portal traffic and prioritize integrations by volume impact. The analysis showed we could cover approximately 80% of verification volume by focusing on the highest-traffic portals first—a realistic target given our constraints.

Each portal required its own MAP documenting unique technical requirements, authentication methods, and data extraction methodologies. We hit substantial obstacles: unreliable portal interfaces, inconsistent data formatting, authentication edge cases that didn't surface until production. These issues, combined with the aggressive timeline, caused deployment setbacks that required significant rework and honest conversations with the customer about what we could realistically deliver.

The project provided some of my most valuable lessons about setting realistic expectations, transparent communication, and the importance of thorough technical discovery before making timeline commitments. I spent considerable time working directly with the customer to rebuild trust and adjust scope. The delivered solution provided real value—it just took longer and covered less than originally promised.

Built with: Python, Notion, Google Sheets, AWS, Quicksight

### Saving Struggling Accounts

Our rapid growth, combined with some hiring missteps, created a crisis. Multiple customer implementations began showing distress simultaneously—faltering without adequate technical oversight. As these situations threatened both reputation and renewals, I identified the pattern early and volunteered to intervene.

I took on three times my standard implementation load, stepping in to stabilize accounts that had been left adrift. For each one: review the project history, identify the critical gaps in both technical implementation and customer expectations, develop a tailored recovery plan with clearly defined success metrics and timeline projections in Notion, and then execute.

This required 80+ hour weeks and frequent after-hours calls with anxious customers. I used Quicksight dashboards to provide transparent progress updates, rebuilding trust with stakeholders who had reason to be skeptical. I prioritized interventions using Python analysis tools to assess implementation health across my expanded portfolio.

I successfully stabilized most of the troubled implementations. One account had deteriorated beyond recovery before my intervention—that was a hard loss to accept. But the initiative prevented what could have been a significant wave of departures during a critical growth phase.

The experience crystallized something important: a company can have genuinely excellent technology and still fail its customers if growth outpaces operational discipline. The lessons from this period—early warning signs of implementation distress, how to rebuild fractured relationships, what sustainable scaling actually requires—have shaped my approach ever since.
