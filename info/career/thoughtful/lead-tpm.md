---
Title: "Thoughtful AI: Lead Technical Product Manager"
Start: November, 2024
End: September, 2025
---

# Lead Technical Product Manager

My success as a Customer Engineer created an unexpected challenge for Thoughtful's leadership: how to scale the role as the company grew. Despite extensive recruiting efforts to "find more people like Danny," leadership realized the combination of deep technical knowledge, customer relationship management, and healthcare domain expertise was exceptionally rare in a single person.

This realization prompted a restructuring of the Customer Engineer role into three specialized positions: a Customer Success Analyst (customer-facing, ROI roadmaps), a Technical Product Manager (automation design, customer consultation), and a Forward-Deployed Engineer (technical implementation). I transitioned to the TPM role as it sat at the intersection of technical expertise and customer understanding.

I quickly became the trusted technical advisor to both CSAs and the sales team, translating complex customer needs into viable technical solutions. I maintained a full delivery load through the transition, serving as the bridge between our evolving organizational structure and our expanding customer base.

### Value Realization Modeling

One of the most impactful things I built at Thoughtful wasn't an automation. It was a framework for measuring what our automations were actually worth.

We lacked a coherent model for demonstrating ROI. I developed an end-to-end simulation of a customer's revenue cycle management process: from eligibility verification through denials management to payment posting. Using Python in Jupyter Notebook, I built a statistical model incorporating probability distributions for success and failure scenarios throughout the lifetime of patient encounters and claims.

The simulation projected automation impact with genuine accuracy, accounting for the complex interdependencies in healthcare billing. I then designed specialized Quicksight dashboards for each agent in our portfolio, showing time savings, error reduction, and denial prevention rates within the simulated environment. The most impactful piece was an executive dashboard that translated technical performance into business outcomes: cumulative staff hours saved, revenue protected through reduced denials.

This framework became the foundation for our sales team's value proposition conversations. Healthcare executives could see concrete projections of how our automation suite would impact their specific workflows and financial outcomes. It helped us close deals and retain customers who might otherwise have struggled to articulate the ROI internally.

Built with: Quicksight, Python, Google Sheets, AWS, Jupyter Notebook, statistical modeling

### Taking Over the Team

After the restructuring, Thoughtful tried several leadership configurations for the three specialized teams. External managers came in and struggled. The fundamental problem was that leading these teams required understanding the intricate relationships between customer needs, healthcare domain knowledge, and our technical capabilities. That knowledge had been built organically over two years of being in the trenches. It couldn't be transferred in an onboarding.

As leadership challenges threatened our delivery momentum, the executive team asked me to step in as team lead during what was framed as a temporary transition. I accepted reluctantly. I'd intentionally avoided management earlier in my career to stay focused on technical development.

The interim role became permanent as I demonstrated I could maintain delivery quality while establishing processes that let our growing team scale. I strategically redistributed my project portfolio: keeping the most complex implementations for myself while delegating others to create bandwidth for leadership work. Balancing tactical execution with vision-setting while the company was scaling fast was genuinely hard. But stepping into the role was the right call, and it shaped my understanding of what technical leadership actually requires.

### TPM Delivery Contribution

My time as a formal TPM was brief: roughly three months before I was promoted to lead the team. But the output from that window was significant. During the period I held the TPM role, my implementations accounted for approximately 63% of Thoughtful's net new ARR as the company grew 3x year-over-year. That ratio reflects something important about the role: the TPM function sat at the exact intersection where technical complexity and commercial outcome met. Getting an implementation to production and demonstrating ROI was what turned a customer into a reference and a reference into the next logo.

The reason I got promoted so quickly wasn't just delivery volume. It was that I was doing something harder than implementation. I was making judgment calls about what to build, in what order, at what fidelity, against what constraints. Those are product decisions. The Lead TPM role formalized what I was already doing informally: setting the direction, not just executing it.

### Determinism as a Design Principle

One of the most important things I learned building AI automations in healthcare was when not to use non-deterministic AI. Healthcare billing workflows have near-zero tolerance for probabilistic outputs. A wrong eligibility determination means a denied claim, a wrong payment posting means a compliance problem, and a wrong denial routing means lost revenue. Customers didn't care about our model's average accuracy; they cared that every output was correct.

My design philosophy evolved into a consistent pattern: use AI where it genuinely adds value (pattern matching across variable inputs, extracting structure from unstructured text, handling edge cases that can't be enumerated in advance), and everywhere else, write code. A deterministic Python function is always more reliable than an LLM producing the same output. The hybrid-RAG architecture I built at Thoughtful was an explicit implementation of this: the system converged toward determinism over time. The human-verified outputs from each cycle became hard-coded answers for future identical inputs, shrinking the space that required live inference. Eventually, most cases were handled without touching the LLM at all.

I extended this to how I wrote MAPs. Rather than designing workflows that depended on the agent "figuring it out," I specified explicit decision trees wherever possible. The agent became the executor of deterministic logic, not the reasoner making uncertain judgments. Pairing LLMs with engineers writing deterministic execution paths, rather than hoping the LLM handles it, is what let our agents achieve accuracy levels an order of magnitude above the human baseline.

### EOB Parsing and Eval Engineering

Before my promotion, I was assigned to an Explanation of Benefits (EOB) parsing project: automating the extraction of structured payment data from PDF EOBs sent by payers. EOBs are genuinely hard to parse. Format varies by payer, layout changes across plan years, and the data structures are inconsistently placed across the document. I built evaluation infrastructure for the parsing agents: a labeled dataset of EOB samples across payer formats, scoring logic that measured field-level extraction accuracy, and regression tests that flagged when a model or prompt change degraded performance on previously passing cases.

I was pulled off the project mid-stream when the Lead TPM opportunity arose. The eval framework I'd built remained in use by the team that continued the work.

### The Merger and What Came Next

In September 2025, Thoughtful AI underwent a private equity merger during our Series B fundraising process. We combined with three other companies to form [Smarter Technologies](/info/career/smarter-technologies).

For me it was a natural transition point. After two years building deep RCM expertise, customer-facing credibility, and leadership experience across three roles, I stepped into the newly created Director of Sales Engineering position at the combined company. Everything I'd learned at Thoughtful (the healthcare RCM knowledge, the customer instincts, the systems thinking, the leadership lessons from both the successes and the crises) became the foundation for what I built next.
