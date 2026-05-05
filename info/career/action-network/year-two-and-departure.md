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

### Content Performance Benchmarks

With the content team poised for a strong football season, we needed a framework for setting meaningful KPI targets. I analyzed divergent user behavior between web and app platforms. Web users showed high bounce rates and low conversion (one-off content seekers), while app users were more likely to subscribe or activate on a sportsbook proportional to their usage. This led to distinct KPIs: "daily unique readers" for web, "daily reads per reader" for app, both strongly correlated with Value Clicks.

I built a Google Sheets tool for the team to set reasonable monthly KPI targets by sport, aligned with company revenue objectives. The team (Chad, Katie, Steve, Andrew, and Korey) set individual targets across each month and sport for the September-December 2022 period. Korey took the lead on operationalizing the targets in Tableau.

Built with: SQL, Python, Redshift, AWS, Airflow, Google Analytics, Twitter/YouTube/Instagram Reporting APIs, Tableau

### Affiliate Reporting Pipelines

As we pursued closer integration with Better Collective US, our affiliate reporting needed to scale across multiple websites, distinct deal types, and dozens of partners. We migrated from CRON jobs to Apache Airflow for better monitoring and error handling. When Billy, April, and Amanda left, the responsibility fell to me and a junior analyst, Grant. We wrote thousands of lines of custom scripts for numerous partners, ensuring alignment with revenue reporting schemas, all under pressure and with limited Python depth at the time.

We built a working model covering most partners and hired replacements quickly. It wasn't elegant, but it worked.

Built with: SQL, Redshift, AWS, Airflow, Python, Google Sheets, Google Data Studio, Tableau

# Football Season 2022 and Deciding to Leave

As the 2022 football season started, underperformance against outdated revenue targets forced a complete reforecast of our 3-5 year plan during our busiest period. I spent four weeks of 80-hour weeks building a state-by-state long-term revenue model through 2026. The model integrated three sub-models: state legalization to MAU, MAU to affiliate activations, and activations to LTV and revenue.

The finance team ultimately adjusted my projections upward without much reasoning, to my genuine frustration. But the exercise taught me a great deal about defending analytical conclusions to skeptical executives and about the limits of data in organizations where the political narrative sometimes overpowers the numbers.

A week after completing the forecast, I was asked to lay off a recently hired analyst. Given our previous struggles with headcount reduction and the already extended hours the team was working, I found the demand unjustifiable. I resigned the next day.

Despite everything, I value my time at Action Network and Better Collective. The complexity of what we built (the data infrastructure, the financial models, the affiliate pipelines) was real. The leadership lessons from the hardest parts were real too. I left with a much clearer sense of what I need in a team environment and what I'm willing to fight for.

Built with: SQL, Redshift, Google Sheets, Python, SciKit Learn, Pandas, NumPy, Google Analytics Reporting API, Airflow
