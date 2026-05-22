---
Title: "Notion GTM: Architecture and AWS Lambda Pattern"
Start: April, 2026
End: Current
Link: /projects/notion-meeting-intelligence
GitHub: https://github.com/dm4th/personal-website
---

# Notion GTM: Architecture and Async Lambda Pattern

The Notion Meeting Intelligence demo runs six Claude API calls per analysis. Each call takes 5-20 seconds on a real transcript. Vercel's Hobby plan caps serverless function execution at 10 seconds. Getting all six agents to complete and return their results required moving the compute off Vercel entirely, into a dedicated AWS Lambda function with no timeout.

### The Vercel Timeout Problem

The original implementation was a single Next.js API route that called six Claude API calls - five in parallel, one sequential summary. On short transcripts it sometimes squeaked under the limit. On anything realistic it failed with `FUNCTION_INVOCATION_TIMEOUT` before any results came back.

The first fix attempt was splitting into six individual routes, one Claude call each. In theory each would be fast enough. In practice, Claude Sonnet on a real transcript with 1024 output tokens often takes 10-20 seconds - right at or above the Vercel cap. Two or three agents would succeed; the rest would timeout and the UI would show an error.

The correct fix was moving all Claude calls out of Vercel's execution environment entirely.

### The Initiate/Poll Pattern

The architecture splits the work across three API calls:

**1. `/analyze-start` (Next.js, synchronous):**
Receives the transcript and meeting type. Fetches agent prompts from the Notion Agent Library on the server side - including the live ICP Scoring Rubric. Generates a session ID, saves the session to DynamoDB with all agent prompts embedded, then fires an async Lambda invocation (`InvocationType: 'Event'`). That invocation returns in under 200ms. The route returns `{ sessionId }` to the browser.

**2. Lambda `/analyze/execute` (async, fire-and-forget):**
Runs with no Vercel timeout - Lambda's default is 15 minutes. Runs the five parallel agent calls with `Promise.allSettled`. As each agent completes, it immediately writes its own status to DynamoDB (`agentStatuses.sales = 'ready'`). This lets the polling UI show real progress rather than a static spinner. After all five succeed, it marks the summary agent as `processing`, runs the summary call, then writes the full results and flips the session status to `ready`.

**3. `/analyze-status` + `/analyze-results` (Next.js, polled every 3 seconds):**
Status polls return `{ status, agentStatuses }` - lightweight, no results payload. When status becomes `ready`, the browser makes one final call to `/analyze-results` to fetch the full JSON. Separating status from results keeps every poll response small regardless of how large the six agent outputs are.

The polling loop runs up to 40 times (a 2-minute cap) before surfacing a timeout error.

### Per-Agent Live Status

A key UX detail: each of the five parallel agents updates its own DynamoDB attribute as it finishes, rather than writing everything at once when all five complete. DynamoDB's `UpdateExpression` supports nested attribute writes (`SET agentStatuses.#agent = :status`) so each Lambda execution can update a single field without touching the others.

The browser receives these intermediate statuses on every poll tick and updates the loading UI in real time. Users see individual agents flip from spinning to a green checkmark as they complete, then watch the summary row light up only after all five are done.

### Service Isolation

The Notion Meeting Intelligence Lambda is a completely separate service from DocWow's Lambda. Both follow the same pattern (TypeScript compiled to CommonJS, zipped with node_modules, deployed to Lambda, DynamoDB for state, `DYNAMO_TABLE` and a shared-secret env var for auth), but they have distinct:

- Lambda functions (`notion-meeting-intelligence` vs `docwow`)
- DynamoDB tables (`notion-meeting-sessions` vs `docwow-sessions`)
- IAM roles and invoker users
- Vercel env var prefixes (`NOTION_MEETING_AWS_*` vs `DOCWOW_AWS_*`)

Keeping them independent means either can be updated, redeployed, or scaled without touching the other.

### Notion as the Prompt Store

The agent prompts are not hardcoded. They live in the Agent Library database inside the AI-Native GTM Hub Notion template, fetched at analysis time by the `analyze-start` Next.js route using a server-side `NOTION_API_KEY`. The ICP agent prompt includes a `{{ICP_RUBRIC}}` placeholder that gets replaced with the live content of a separate ICP Scoring Rubric database before the prompts are stored in DynamoDB.

This separation matters: the AI methodology is owned in Notion, where it is easy to edit and version. The code is infrastructure. Updating how the Sales Coach evaluates a call, or adding a new ICP scoring dimension, is a Notion edit that takes effect on the next analysis without any code change or redeploy.

Users who connect their own workspace get this same behavior with their own copy of the Agent Library. They can edit the prompt bodies directly in Notion and the changes apply immediately to their next run.

### Infrastructure Summary

- **Frontend:** Next.js 15 on Vercel (App Router, TypeScript)
- **Async compute:** AWS Lambda (Node.js 20, CommonJS, TypeScript compiled)
- **State:** DynamoDB with 2-hour TTL on sessions
- **AI:** Anthropic Claude Sonnet - six calls per analysis
- **Prompt source:** Notion API, fetched server-side at runtime
- **Auth:** Shared secret header between Next.js and Lambda; Clerk for Notion workspace auth
- **Notion writes:** Notion API via server-side routes, guarded by Clerk session

Built with: Next.js 15, TypeScript, AWS Lambda, DynamoDB, Anthropic SDK, Notion API, Clerk, CSS Modules
