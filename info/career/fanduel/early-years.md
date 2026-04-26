---
Title: FanDuel — Early Years
Start: August, 2016
End: August, 2018
---

# The First Year

My FanDuel journey started in August 2016, straight out of college. From day one, I made a point to be present—consistently first into the office, often last to leave, absorbing everything I could about the business. I genuinely believe in-person onboarding is irreplaceable for building the foundation you need to be effective, and I treated my first year as an immersive learning experience.

My initial focus was daily operational reporting: early morning updates tracking progress against organizational goals, accurate accounting of contest prizes, and the underlying SQL and data pipelines that made it all work. Under the guidance of my manager Michael, I built a solid foundation—and quickly found myself wanting to automate everything that didn't need to be manual.

### Automated Prize Pools Script

The manual prize pools workflow was: run SQL queries, update CSV files, upload to Excel in Dropbox. Straightforward, but entirely manual and error-prone. I built a Python script that automated the full pipeline—identifying contests requiring attention each morning via a SQLAlchemy/Pandas query, walking through any manual decisions interactively, then generating a CSV record, updating the Excel file in Dropbox, and storing corrected prize pool data in a dedicated SQL table.

This was my first real automation at work, and it established a pattern I'd follow for the next several years: find the manual process, understand it deeply, then make it automatic.

Built with: SQL, Redshift, Python, SQLAlchemy, Pandas, Dropbox API

### Target Tracking

With accurate prize pool data now in Redshift, I built supplementary tables for tracking performance against company targets—revenue targets, contest entry targets, user acquisition goals. Centralizing everything in Redshift enabled real-time dashboards in Chartio and Looker that stakeholders could access directly, replacing the need for daily Excel downloads. This was my first experience building something that genuinely changed how non-technical colleagues worked with data.

Built with: SQL, Redshift, Python, Chartio, Looker

### Daily Scorecard

As stakeholders grew comfortable with the dashboards, I expanded the Daily Scorecard to include deeper ecosystem metrics. The Daily Fantasy Sports ecosystem is complex—user archetypes interact with each other in ways that significantly affect overall health. I added graphs that helped business leaders understand those second-order effects, not just the headline numbers.

Built with: SQL, Redshift, Python, SQLAlchemy, Pandas

# Year Two

Having established myself as the go-to resource for business analysis, I became a trusted partner for finance and for our COO. The company navigated two rounds of layoffs and a leadership change during this period, and I emerged stronger from both. When my original manager left, I started reporting to the VP of FP&A, Dave—which exposed me to advanced modeling in Excel and Google Sheets that I wouldn't have encountered otherwise.

### Weekly Ops Meeting

Every Wednesday, senior leaders gathered to review the prior week's performance and plan the weeks ahead. I owned this meeting from an analytics standpoint: preparing and distributing a comprehensive weekly report beforehand, with key discussion points supported by data. I became a strong believer in the practice—every recurring meeting should have a shared agenda or report that participants can review in advance. It changes the quality of the conversation completely.

Built with: SQL, Redshift, Python, Google Sheets, Google Slides

### Monthly Account Reporting

This project involved building an accounting pipeline from scratch—my first time doing that kind of work. Accounting demands a different kind of discipline than business analytics: the margin for error is essentially zero, there's no one reviewing your SQL output for reasonableness, and the stakeholders have very specific format requirements. I built the pipeline carefully and learned to appreciate the value of meticulous process documentation when the consequences of mistakes are concrete and immediate.

Built with: SQL, Redshift, Python, SQLAlchemy, Pandas
