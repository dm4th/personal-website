---
Title: Smarter Technologies: Commercial Innovation
Start: September, 2025
End: Current
---

# Commercial Innovation

Healthcare RCM automation pricing is genuinely hard. You're selling productivity gains that depend on payer-specific EDI capabilities, EMR integration depth, claim volume distributions, denial rates, and staff efficiency, none of which are standardized across prospects. A standard SaaS per-seat model doesn't capture value in this market. You need pricing that aligns your revenue with the customer's realized benefit.

Over seven months, I developed five distinct pricing architectures and built an automation estimation engine to support them.

### Five Pricing Models

**Transaction-based pricing** ties revenue directly to automation volume: a per-claim or per-verification fee that scales linearly with throughput. This works well for high-volume, single-product deployments where value is straightforward to measure.

**FTE-based cost reduction** anchors pricing to the customer's current staffing cost. Our fee is structured as a percentage of demonstrated savings, which requires establishing a baseline and building ongoing reporting into the engagement. It's more work to set up, but it's compelling in a CFO meeting because the math is direct.

**Fixed plus variable hybrid** combines a platform fee for infrastructure and integration with variable per-transaction fees for automation throughput. This balances revenue predictability for us with value alignment for the customer: they pay for what they use once the base is covered.

**Volume discount tiers** graduate pricing to reward scale, designed for multi-location deployments where per-unit cost decreases as clinics are added. The model keeps customers incentivized to expand rather than capping their deployment to avoid pricing tier cliffs.

**Risk-sharing and contingency models** are reserved for design partnerships and strategic accounts where proving value is the priority over initial revenue. Smarter Technologies absorbs downside risk in exchange for upside participation. These require the most negotiation but produce the strongest customer alignment.

Each model was developed in collaboration with commercial leadership and applied to specific deal contexts. Pricing data for 30+ prospects is tracked in structured markdown files with full negotiation history.

### Automation Estimation Engine

The estimation engine produces month-by-month automation percentage projections for each use case in a deal. These numbers show up in every pricing conversation, so they need to be defensible.

The engine runs in two modes depending on the use case:

**Deterministic mode** (eligibility verification and prior authorization) grounds projections in actual platform capabilities. The engine pulls payer-specific EDI coverage data from Stedi, RPA availability from our internal portal matrix, and 278 API testing results from Availity. Automation percentage = payer volume share multiplied by channel automation ceiling multiplied by a build timeline factor. These are auditable numbers, not guesses.

**Historical/heuristic mode** (payment posting, accounts receivable, denials) uses exponential ramp curves calibrated against historical deployments. The formula: `Base% + (Full% - Base%) × exponential_progress`, where Base is automation at value start and Full is steady-state maximum. Full Auto is set conservatively below the sub-task blended rate to account for edge cases and ramp variability.

Output is a professionally formatted Google Sheet with monthly automation ramps, implementation team assignments, delivery cost projections, and volume breakdowns. The sheet is created directly in Google Drive via API with native Sheets formatting, not a CSV upload.

### Results

Five pricing architectures deployed across active deals. 30+ pricing analyses documented in Git with full negotiation history. Automation estimates used in $31.8M of pipeline proposals. A cost-takeout consulting pathway created for 22 deals where the traditional product sale wasn't the right fit. Estimation engine accuracy validated post-deployment on the first closed-won multi-region deal.

### Tech Stack

Python (Google Sheets API, payer capability mapping, exponential ramp calculations), Google Sheets (formatted output), Google Drive API (automated file creation), Stedi EDI data, Notion (pricing history tracking), Claude Code (estimation orchestration)
