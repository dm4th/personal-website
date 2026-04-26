---
Title: FanDuel — Revenue Team
Start: August, 2018
End: December, 2019
---

# The Revenue Team

The final stretch of my FanDuel tenure was spent working with Chris, the best boss I've had in my career. Chris had exceptional intelligence, precise vision, and an ability to trust his team to solve problems without micromanaging. We formed a tight team focused on sportsbook revenue performance, and the work we did together raised the bar for what I expected from subsequent roles.

My daily focus was simplifying operations and analysis—making it effortless for business leaders to access the information they needed. Several projects from this period stand out.

### The Scorecard Slackbot

I had built a significant library of Python scripts that non-technical stakeholders couldn't run themselves. That dependency on me became a bottleneck. The solution was a Slackbot that let anyone trigger those scripts through a chat interface, on their own timeline.

What started as a convenience tool became something I relied on constantly. I automated daily reporting into a designated Slack channel, which turned performance data into something people talked about naturally rather than buried in email. I also built a private chat interface for checking individual performance against targets—something that previously required asking me or running a query directly.

The Slackbot is still one of the most satisfying things I've built professionally. The feedback loop was immediate and human in a way that dashboards aren't: you send a message, you get a response. People actually used it.

Built with: SQL, Redshift, AWS, Python, SQLAlchemy, Slack API/Webhooks, Chartio

### Shadow Tracker

FanDuel employees couldn't participate in actual contests alongside users due to regulatory restrictions. We introduced Shadow Contests—mirroring real competitions but paying out based on hypothetical employee placements without affecting users. I automated the discovery, reporting, and payout workflows for these contests, combining Slackbot functionality with Chartio for seamless end-to-end operations.

Built with: SQL, Redshift, AWS, Python, Slack API/Webhooks, Chartio

### SQL Courses

Despite building tools to make data accessible without SQL, members of our operations team wanted to go deeper. They wanted to run their own queries, understand the database structure, and do analysis without asking me. I designed and taught a series of SQL courses tailored to the specific tables and schemas we used at FanDuel. This was the beginning of my genuine love for teaching technical skills—watching someone go from intimidated to capable is its own reward.

Built with: SQL, Redshift, Google Slides

### Markov-Chain Monte Carlo Simulation

In collaboration with Devin and with guidance from Shane—the most technically brilliant person I've worked with—I built a forecasting model for the 2019 NFL season. Previous years had seen forecast errors averaging 6–8%. We wanted to understand where those errors came from and whether we could do better.

The approach: use historical activation rates for different user types (segmented by spending level and sport preference), combined with spend and retention rates, to model how users would transition between segments over time and what they'd spend in each state. I built the Markov Chain portion—the user-state machine describing transition probabilities. Devin built the Monte Carlo simulation layered on top, providing confidence bounds for forecast expectations based on historical patterns.

The resulting model was meaningfully more accurate and produced better diagnostic insights than anything we'd used before. I built the SQL for the state transitions and used the Slackbot to keep the model's input data current. Chartio and a custom Flask frontend gave business partners an interactive interface to explore the forecasts.

Built with: SQL, Redshift, AWS, Python, Flask, Slack API/Webhooks, Chartio

# Leaving FanDuel

Throughout my time at FanDuel, I was a committed, high-performing team member. But I wanted to grow into leadership and found that path uncertain. When Michael referred me to a role at Google—an opportunity I couldn't turn down—it was the right moment to move.

The team at FanDuel holds a permanent place in my professional memory. We did remarkable work together, and we had genuine fun doing it. That combination is rarer than it should be. I've tried to recreate it at every job since.
