---
Title: Smarter Technologies: ICP Scoring
Start: September, 2025
End: Current
---

# ICP Calibration and Prospect Scoring

With 99 deals in the pipeline and two people covering all of them, we needed a rigorous framework for deciding which prospects deserved deep technical engagement. Gut feel doesn't scale when you're triaging 10+ new inbound leads per week across different verticals, EMR platforms, and deal sizes.

I co-developed an Ideal Customer Profile scoring framework with our VP of Delivery, using his pipeline analysis as the baseline. We iterated through four versions over three months, calibrating each one against actual deal outcomes.

### The V4 Framework

The final version scores prospects across six weighted dimensions:

- 25%: Payer Layer Coverage and EDI Readiness
- 20%: SOP Consistency and Process Quality
- 20%: Staffing Model (onshore / dedicated)
- 15%: Centralized Operations and IT Engagement
- 10%: Receptiveness to Human + Tech Model
- 10%: Specialty Focus and Practice Size

Each dimension is scored 1 to 5. The composite weighted score determines tier placement: Tier 1 (score ≥ 4.0) gets full SE engagement with complete technical discovery, custom pricing, and delivery scoping. Tier 2 (3.0 to 3.99) gets standard coverage. Tier 3 (below 3.0) gets a light-touch pathway, often a cost-takeout consulting approach rather than a full product sale.

### Score the Scope

The most important insight from the calibration process came in March 2026: the scoring unit matters. We discovered that scoring criteria against an organization's full footprint produced misleading results. A 2,600-clinic health system would score poorly on SOP Consistency because of size and variation, even if the specific deployment target was a clean, well-run ambulatory division.

The correct unit of analysis is the scoped deployment: the specific EHR, geography, business unit, and use case being implemented. We called this principle "Score the Scope." It resolved both over-scoring (large organizations with deployment complexity getting inflated Tier 1 placements) and under-scoring (focused ambulatory practices with strong fit being deprioritized because of surface-level org-level unknowns).

This was a meaningful change. Several deals that had been languishing in Tier 2 moved to Tier 1 once we scoped them correctly, and a few that felt like easy wins dropped when we looked at the actual deployment unit.

### Technical Implementation

The scoring framework is implemented as a Claude Code skill (`assessing-prospects`) backed by two structured data files: `product-readiness.json` (14 products, 92 mapped pain points, 20 EHR platforms) and `icp-definitions.json` (V4 tier criteria with pipeline examples). A Python-based payer layer scorer integrates actual payer capability data from Stedi EDI coverage databases, our internal RPA matrix, and Availity 278 API testing results.

A batch assessment script can score the entire 99-deal pipeline in a single run, producing a prioritized prospect list for capacity planning discussions with sales and delivery leadership.

Scores are also updated dynamically during meeting analysis. Every time `/analyze-meeting` runs, the agent has access to the ICP scoring framework and can flag if new information warrants a tier reassignment.

### Results

99 deals scored and tiered: 54 high-priority, 27 medium, 18 low. Clear resource allocation guidance that replaced ad-hoc prioritization debates. The framework was also adapted for partner-channel deals, where an ecosystem tier model assessed readiness at the platform level rather than the customer level.

### Tech Stack

Python (scoring engine, payer capability mapping, batch assessment), Notion (ICP scores on Deal Tracker), Claude Code (real-time scoring during meeting analysis), JSON (product readiness data, ICP definitions)
