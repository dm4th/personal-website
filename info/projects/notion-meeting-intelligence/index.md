---
Title: Notion GTM AI Meeting Intelligence
Start: April, 2026
End: Current
Link: /projects/notion-meeting-intelligence
GitHub: https://github.com/dm4th/personal-website
---

# Notion GTM AI Meeting Intelligence

A live demo that turns a raw sales meeting transcript into a structured multi-agent analysis, with an option to write the results directly into a Notion workspace. The project started as a way to operationalize my GTM sales methodology: instead of manually reviewing calls and filling out CRM notes, six specialized AI agents analyze every angle of the meeting in parallel.

The demo is free to use with any transcript. You can also connect your own Notion workspace and have the results land in the same databases you already use to run your deals.

[Try the live demo](/projects/notion-meeting-intelligence)

### Why I Built This

I built my sales process around Notion. Deal tracking, ICP scoring rubrics, account research, agent coaching notes - it all lives there. The problem is that actually filling those databases after a meeting takes 20-30 minutes of structured thinking. You have to switch mental modes from "listening to the customer" to "evaluating the opportunity across six dimensions."

This project automates that transition. Paste in a transcript (or connect a recording tool that produces one), and within 30-40 seconds you have a scored ICP fit, a sales coaching breakdown, commercial deal sizing, delivery risk, product feedback signals, and an executive summary with a deal verdict. Everything a rep and their manager need to decide what happens next.

### The Six Agents

Each agent represents one lens on the meeting, designed to answer a specific business question:

- **Sales Coach** - How well did the rep execute? Talk time balance, objection handling, overall score 1-10, specific coaching tip
- **Commercial Pricing** - What kind of deal is this? Deal tier (Strategic/Growth/SMB/Unqualified), estimated ACV range, price sensitivity, pricing risk
- **Delivery and Solutioning** - How hard is this to implement? Complexity score, custom requirements, integration needs, delivery risk rating
- **Product Feedback** - What did the product land? Features that resonated, competitive gaps, notable quotes, priority level for the product team
- **ICP Fit** - How well does this company match our ideal customer? Scored against a rubric stored in Notion, with dimension-by-dimension breakdown
- **Executive Summary** - What's the verdict? Deal verdict (Strong Opportunity/Qualified Pipeline/Needs Qualification/Pass), top signals across all agents, recommended next action

The five parallel agents run simultaneously. The summary agent receives all five results and synthesizes across them - it knows which agents were most relevant to this particular call.

### The Notion Agent Library

What makes this more than a generic AI analysis tool is that the agent prompts are pulled from Notion at runtime. My GTM methodology lives in a Notion database called the Agent Library - each row is one agent, with a system prompt body that encodes how I think about that dimension of a deal.

When you run an analysis, the system fetches those prompts from my Notion workspace on the server side before passing them to Claude. The ICP agent even pulls the live ICP Scoring Rubric from a separate Notion database and injects it into the prompt. This means updating my sales methodology is a Notion edit, not a code deploy.

### Two Ways to Use It

**Demo mode** runs the full analysis in the browser and shows results in the UI. Nothing is saved anywhere. This is the default path and requires no setup.

**Own workspace mode** does everything demo mode does, then writes the results into your Notion databases: a meeting notes page, and one agent analysis page per agent. To use it you need the GTM Hub Notion template installed and a Notion integration token configured.

### Pages in This Section

- [Architecture and AWS Lambda Pattern](/info/projects/notion-meeting-intelligence/architecture): How parallel async processing works around the Vercel 10-second timeout
