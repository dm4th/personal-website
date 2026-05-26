---
Title: "Action Network: Year Two and Departure"
Start: January, 2022
End: October, 2022
---

# Year 2 Post-Merger

In the wake of the Better Collective merger, our team faced the challenge of meeting acquisition revenue targets set during a more optimistic market moment. By February 2022, a sobering reality had set in: we weren't hitting them. The stress from underperformance added pressure to daily operations, and we aggressively pursued additional affiliate partnerships to close the gap.

The strain showed across the organization. Morale dropped. When our Head of People left, it triggered an exodus. We lost a significant portion of the team over five months. Working 70-80 hour weeks became the norm. I was reporting directly to our CFO at Better Collective US.

Looking back, the most lasting lessons from this period weren't about the missed targets or the lost deals. They were about the relationships, the trust, and the morale we burned through, and the recognition that empowering a team has to take priority over any individual deliverable, no matter how urgent it feels.

### Affiliate Deal Forecasting

As sports gambling legalized in major states, our affiliate model was starting to show structural strain. We had been compensating partners on a cost-per-acquisition basis: payment when a referred user made their first wager. As the market matured, the pool of new users shrank, and the incentive misalignment with sportsbooks became clear: we had no reason to care about user retention after acquisition.

I built the case for transitioning to a revenue-share model, where we'd receive a smaller upfront payment plus a percentage of user losses over a three to five-year period. The financial modeling required actual user play data from our partners, cohort analysis, and state-level retention projections. One major partner shared comprehensive anonymized user data from customers we'd referred over 18 months.

Using that data, I built a model projecting user LTV under the new structure: cohort-based retention rates, loss rates, deal parameter filters (term length, revenue-share percentage, upfront payment), and state-level tax adjustments. Combined with state-level acquisition forecasts, I could project cumulative revenue under both models.

The presentation to executive leadership showed we could trade a high seven-figure revenue reduction in H2 2022 for a potential eight-figure upside from 2023 to 2025 with one major partner. That was a compelling trade, and a genuinely complex piece of financial modeling work.

Built with: SQL, Redshift, Google Sheets, Python, SciKit Learn, Pandas, NumPy

### Value Clicks: Content Revenue Attribution Model

The core analytics problem at Action Network was that standard content metrics (pageviews, time on page, bounce rate) told us nothing about whether a piece of content was actually making the company money. A user who read a betting odds explainer and then signed up for a sportsbook through our affiliate link was worth real revenue. A user who bounced after ten seconds was worth nothing. But nothing in our existing reporting connected those two events.

I built Value Clicks to close that gap. The model assigned a score to every on-page user action based on its empirical likelihood of leading to a downstream revenue-generating event: an affiliate sportsbook registration, a subscription conversion, or a high-value return visit. The inputs were a combination of behavioral signals (scroll depth, click type, referral source, session recency) and contextual signals (sport, content type, state of the reader, device). The score wasn't a single number - it was a probability-weighted composite across multiple conversion paths, calibrated against historical affiliate activation and subscription data in Redshift.

Once we had the metric, we started gearing content strategy toward optimizing for it rather than raw traffic. The result was a 270% revenue increase in the following 12 months, driven primarily by the affiliate business. Content that scored high on Value Clicks got prioritized for distribution, promoted on social, and used as templates for future pieces. Content that scored low got deprioritized or restructured.

I also modeled reader value as a segmentation dimension: by sport (NFL/NBA/MLB readers had meaningfully different conversion rates and LTVs), by content type (predictions vs. odds breakdowns vs. injury reports), and by the state the reader was in (states where sports gambling was newly legal had dramatically higher activation rates and different monetization timelines than mature markets). These segments fed directly into the company-wide revenue model I built during the 2022 football season reforecast.

Built with: SQL, Redshift, Python, SciKit Learn, Pandas, Google Analytics, Airflow, Tableau

### Content Performance Benchmarks and Engagement Analytics

With the Value Clicks model providing a shared revenue-anchored metric, I built the tooling and dashboards the content team needed to actually use it day-to-day.

For KPI target-setting, I analyzed divergent user behavior between web and app platforms. Web users showed high bounce rates and low conversion (one-off content seekers), while app users were more likely to subscribe or activate on a sportsbook proportional to their usage. This led to distinct KPIs: "daily unique readers" for web, "daily reads per reader" for app, both calibrated against Value Click thresholds. I built a Google Sheets planning tool so the team could set monthly targets by sport and content type, aligned to company revenue objectives, for the September-December 2022 season.

Beyond the primary dashboards, I ran A/B testing on content formats and distribution strategies, measuring click-through rates, engagement depth, and downstream conversion lift. I built and maintained subscriber analytics pipelines tracking acquisition, activation, and churn by cohort and content category. Web and app engagement funnels were instrumented end-to-end: acquisition source, landing content, in-session behavior, conversion event, and multi-session retention curves. These funnels were the foundation of the bottoms-up revenue model and also fed back into editorial decisions about which sports and content formats deserved more investment.

Built with: SQL, Python, Redshift, AWS, Airflow, Google Analytics, Twitter/YouTube/Instagram Reporting APIs, Tableau, Google Data Studio

### Content Strategy Collaboration and SEO

The analytics work only mattered if the content team could act on it. So beyond building the models, I became an embedded partner to the editorial org.

I met weekly with Chad, our Chief Content Officer, to review traffic performance, diagnose what was and wasn't working across verticals, and help him make prioritization calls about where to direct the team's effort. Those weren't reporting meetings where I handed him a dashboard. They were working sessions where we made actual decisions together: which sports to lean into, which content formats were driving Value Click rates up, and where we were leaking audience we should be capturing.

Below the CCO level, I worked directly with editors across each vertical. Football, basketball, baseball, and gambling-adjacent content all had different audience behaviors and different conversion profiles, and editors needed to understand those differences in order to plan their coverage calendars. I ran regular sessions with each editor group, walking them through the metrics behind their vertical and helping them translate data signals into concrete decisions about story selection, headline strategy, and publication timing.

I also worked with individual writers, particularly those whose content was underperforming despite strong editorial instincts. The intervention was almost never "write better." It was usually a combination of: understanding what the algorithm rewarded, what readers in their vertical actually wanted to read, and how to structure content to hold engagement long enough to generate a Value Click. I helped writers understand SEO fundamentals, including how to structure articles for discoverability, how to target the right keywords for the sports gambling audience, and how to optimize metadata and internal linking.

This work was unglamorous compared to the financial modeling, but it probably had the most direct impact on revenue. The content team was the top of the funnel. Making them more effective at producing high-converting content compounded faster than any other lever we had.

Built with: Google Analytics, Tableau, Google Data Studio, Redshift SQL, custom reporting pipelines

### Affiliate Reporting Pipelines

As we pursued closer integration with Better Collective US, our affiliate reporting needed to scale across multiple websites, distinct deal types, and dozens of partners. We migrated from CRON jobs to Apache Airflow for better monitoring and error handling. When Billy, April, and Amanda left, the responsibility fell to me and a junior analyst, Grant. We wrote thousands of lines of custom scripts for numerous partners, ensuring alignment with revenue reporting schemas, all under pressure and with limited Python depth at the time.

We built a working model covering most partners and hired replacements quickly. It wasn't elegant, but it worked.

Built with: SQL, Redshift, AWS, Airflow, Python, Google Sheets, Google Data Studio, Tableau

# Football Season 2022 and Deciding to Leave

As the 2022 football season started, underperformance against outdated revenue targets forced a complete reforecast of our 3-5 year plan during our busiest period. I spent four weeks of 80-hour weeks building the full business forecast through 2026: both a tops-down model (starting from total addressable market by state and working down to our projected share) and a bottoms-up model (building from individual partner relationships, content verticals, and user cohorts up to total revenue). Running both in parallel was the right call: the tops-down gave leadership a market-sizing anchor, the bottoms-up gave the operations team something they could actually manage against. The model integrated three sub-models: state legalization to MAU, MAU to affiliate activations, and activations to LTV and revenue.

The finance team ultimately adjusted my projections upward without much reasoning, to my genuine frustration. But the exercise taught me a great deal about defending analytical conclusions to skeptical executives and about the limits of data in organizations where the political narrative sometimes overpowers the numbers.

A week after completing the forecast, I was asked to lay off a recently hired analyst. Given our previous struggles with headcount reduction and the already extended hours the team was working, I found the demand unjustifiable. I resigned the next day.

Despite everything, I value my time at Action Network and Better Collective. The complexity of what we built (the data infrastructure, the financial models, the affiliate pipelines) was real. The leadership lessons from the hardest parts were real too. I left with a much clearer sense of what I need in a team environment and what I'm willing to fight for.

Built with: SQL, Redshift, Google Sheets, Python, SciKit Learn, Pandas, NumPy, Google Analytics Reporting API, Airflow
