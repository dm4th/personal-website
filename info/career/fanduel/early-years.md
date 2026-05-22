---
Title: "FanDuel: Early Years"
Start: August, 2016
End: August, 2018
---

# The First Year

My FanDuel journey started in August 2016, straight out of college. From day one, I made a point to be present: consistently first into the office, often last to leave, absorbing everything I could about the business. I genuinely believe in-person onboarding is irreplaceable for building the foundation you need to be effective, and I treated my first year as an immersive learning experience.

My initial focus was daily operational reporting: early morning updates tracking progress against organizational goals, accurate accounting of contest prizes, and the underlying SQL and data pipelines that made it all work. Under the guidance of my manager Michael, I built a solid foundation, and quickly found myself wanting to automate everything that didn't need to be manual.

### Automated Prize Pools Script

The manual prize pools workflow was: run SQL queries, update CSV files, upload to Excel in Dropbox. Straightforward, but entirely manual and error-prone. I built a Python script that automated the full pipeline: it identified contests requiring attention each morning via a SQLAlchemy/Pandas query, walked through any manual decisions interactively, then generated a CSV record, updated the Excel file in Dropbox, and stored corrected prize pool data in a dedicated SQL table.

This was my first real automation at work, and it established a pattern I'd follow for the next several years: find the manual process, understand it deeply, then make it automatic.

Built with: SQL, Redshift, Python, SQLAlchemy, Pandas, Dropbox API

### Target Tracking

With accurate prize pool data now in Redshift, I built supplementary tables for tracking performance against company targets: revenue targets, contest entry targets, user acquisition goals. Centralizing everything in Redshift enabled real-time dashboards in Chartio and Looker that stakeholders could access directly, replacing the need for daily Excel downloads. This was my first experience building something that genuinely changed how non-technical colleagues worked with data.

Built with: SQL, Redshift, Python, Chartio, Looker

### Daily Scorecard

As stakeholders grew comfortable with the dashboards, I expanded the Daily Scorecard to include deeper ecosystem metrics. The Daily Fantasy Sports ecosystem is complex. User archetypes interact with each other in ways that significantly affect overall health. I added graphs that helped business leaders understand those second-order effects, not just the headline numbers.

Built with: SQL, Redshift, Python, SQLAlchemy, Pandas

# Year Two

Having established myself as the go-to resource for business analysis, I became a trusted partner for finance and for our COO. The company navigated two rounds of layoffs and a leadership change during this period, and I emerged stronger from both. When my original manager left, I started reporting to the VP of FP&A, Dave, which exposed me to advanced modeling in Excel and Google Sheets that I wouldn't have encountered otherwise.

### Weekly Ops Meeting

Every Wednesday, senior leaders gathered to review the prior week's performance and plan the weeks ahead. I owned this meeting from an analytics standpoint: preparing and distributing a comprehensive weekly report beforehand, with key discussion points supported by data. I became a strong believer in the practice: every recurring meeting should have a shared agenda or report that participants can review in advance. It changes the quality of the conversation completely.

Built with: SQL, Redshift, Python, Google Sheets, Google Slides

### Monthly Account Reporting

This project involved building an accounting pipeline from scratch, my first time doing that kind of work. Accounting demands a different kind of discipline than business analytics: the margin for error is essentially zero, there's no one reviewing your SQL output for reasonableness, and the stakeholders have very specific format requirements. I built the pipeline carefully and learned to appreciate the value of meticulous process documentation when the consequences of mistakes are concrete and immediate.

Built with: SQL, Redshift, Python, SQLAlchemy, Pandas

### Revenue Cadence and C-Suite Reporting

By Year Two I owned the revenue reporting cadence end-to-end. This meant automated daily email reports going directly to C-suite with performance against targets: contest entries, revenue, retention indicators, and early signals for the week ahead. It also meant owning the weekly revenue sync with senior leadership: preparing the report in advance, running the meeting, and presenting the reporting-versus-forecast delta with clear explanations for any variance.

Owning the cadence also meant owning the underlying data structures that made it possible. I built and maintained the supplementary Redshift tables my team used as the foundation for their own forecasting work: standardized schemas for user segments, revenue attribution, and period-over-period comparisons. When someone on the team needed to build a new model, they started from the tables I owned and maintained. That infrastructure-first approach meant the whole team's output was consistent and reconcilable.

Built with: SQL, Redshift, Python, SQLAlchemy, Chartio, Google Slides

### Player Retention and Cohort Analytics

FanDuel's revenue model meant retention was everything. A user who entered one contest per week was worth an order of magnitude less than a power user, and churn within high-value cohorts had outsized revenue impact. I built a full retention analytics layer: week-over-week retention metrics segmented by user type, and a cohort framework that cut the user base into 6 play-style cohorts across 3 contest-entry-fee bands, for 18 distinct user segments in total.

That segmentation became the foundation for the bottoms-up revenue forecast: rather than forecasting a single aggregate revenue number, we forecast each cohort's expected entry volume and spend separately, then rolled up. It was also the input to the CRM team's engagement strategy: I surfaced which specific cohorts were showing early churn signals and built the analytics infrastructure they used to target lapsed players with re-engagement offers. Retention was not just a metric. It was an operational input.

Built with: SQL, Redshift, Python, Pandas, Chartio, Looker
