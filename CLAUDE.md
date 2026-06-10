# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands
- `npm run dev` - Start development server (Next.js)
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run typecheck` - Type-check the project (`tsc --noEmit`)
- `npx eslint [file]` - Lint a specific file
- `npm run db:generate` - Generate a Drizzle migration from schema changes in `lib/db/schema.ts`
- `npm run db:migrate` - Apply pending Drizzle migrations to the Neon database
- `npm run db:studio` - Open Drizzle Studio against the database
- `npm run jobs:process` - Run the job-opportunity batch processor (`scripts/process_opportunities.ts`); `jobs:dry-run`, `jobs:reprocess`, `jobs:clean` are variants

**Note:** No unit-test framework is configured (no test runner, no test scripts in package.json). Playwright is available as a dev dependency for browser automation / smoke checks, but there is no formal test suite.

## Architecture Overview

This is a personal website built as an **agent-first application**: the centerpiece is a Claude-powered assistant that visitors converse with, grounded in Dan's content under `/info`, with a set of first-class tools (job-fit analysis, email drafting, meeting scheduling, application-material generation). The site is **Next.js 15 (App Router)** with **React 18**, written in **TypeScript**, deployed on **Vercel**.

> Historical note: an earlier version of this site was a Pages-Router RAG chat over Supabase + pgvector with multiple LLM backends and a "guess the model" game. That stack has been fully replaced by the agent-first App Router design described below. There are no Supabase edge functions or LangChain dependencies anymore.

### The agent loop
- **`lib/agent/runAgent.ts`** - the core multi-turn tool loop. Calls the Anthropic Messages API (`@anthropic-ai/sdk`), model from the `AGENT_MODEL` env var (default `claude-sonnet-4-6`), up to `MAX_TURNS` (10) turns. The Anthropic call is non-streaming; the resulting text is re-chunked into ~16-char `text_delta` events so it feels live on the client.
- **`lib/agent/streamProtocol.ts`** - the SSE event protocol (`message_start`, `text_delta`, `tool_use_start`, `tool_result`, `dimension_score`, `auth_required`, `message_stop`, etc.) shared by server and client.
- **`lib/agent/systemPrompt.ts`** - `buildSystemPrompt()`, the single system prompt for the assistant.
- **`lib/agent/tools/`** - the tool implementations: `searchContent` (retrieval over `/info`), `analyzeJdFit`, `composeEmail`, `generateApplicationMaterials`, `scheduleMeeting`, `submitJobLead`, registered via `index.ts` (`TOOL_DEFINITIONS` + `runTool`). Some tools are auth-gated (e.g. `send_email_to_danny`, `confirm_meeting`, `generate_application_materials`) and require a signed-in `userId`.
- **`app/api/agent/stream/route.ts`** - the SSE endpoint that drives `runAgent`. Related routes under `app/api/agent/` handle session, message history, and tool confirmations (`tools/confirm-meeting`, `tools/send-email`).
- **`stores/agent.ts`** - the client Zustand store that POSTs to the stream route, reads the SSE body, parses events, and updates chat state. Agent UI lives in `components/agent/*`.

### Routing (App Router)
- `app/layout.tsx`, `app/page.tsx` - root layout and homepage.
- `app/(marketing)/` - public content: `info/` (markdown/PDF content pages), `projects/` (interactive project demos + listing), `prompting/` (Contentful-sourced blog posts), `refer/` (password-gated referral / job-application pages).
- `app/(app)/` - authenticated app surface (e.g. `account/`).
- `app/api/` - route handlers: `agent/`, `projects/`, `refer/`, `memos/`, `user/`, `voice-memo/`, `webhooks/`.
- `app/sign-in/`, `app/sign-up/` - Clerk auth pages.

### Database (Neon Postgres + Drizzle ORM)
- Client in `lib/db/client.ts` (`@neondatabase/serverless`, `NEON_DATABASE_URL`); schema in `lib/db/schema.ts`; migrations in `drizzle/migrations/` (generate/apply with `npm run db:generate` / `db:migrate`).
- Tables: `users` (Clerk-linked), `sessions` (guest + authenticated), `messages` (jsonb content parts), `tool_calls`, `drafted_emails`, `meetings`, `memos`, `google_oauth_tokens` (app-layer AES-256-GCM encrypted), `notion_configs` (encrypted integration tokens + DB ids).

### Auth & integrations
- **Clerk** (`@clerk/nextjs`) for authentication; webhooks under `app/api/webhooks/`.
- **Resend** for transactional email (drafted-email send flow).
- **Google APIs** (`googleapis`) for calendar/meeting scheduling; OAuth tokens stored encrypted.
- **Notion** (`@notionhq/client`) for the meeting-intelligence / job-tracking integrations.
- **Contentful** for the `prompting/` blog posts.

### Interactive project demos
Project demos under `app/(marketing)/projects/<slug>/` follow a consistent shape: a server `page.tsx` (metadata + sample data) renders a client `<Demo>` orchestrator; UI components live in `components/projects/<Name>/`; backend handlers in `app/api/projects/<slug>/`; types in `lib/projects/<slug>/`; sample fixtures in `data/`. Demos are registered in the `DEMOS` array in `app/(marketing)/projects/page.tsx` and the `PROJECTS` array in `app/page.tsx` (homepage carousel). See `docwow` for a representative example.

### Deployment
- Hosted on **Vercel** (Next.js App Router defaults).
- Database is **Neon Postgres**; migrations are applied via Drizzle, not through the deploy pipeline automatically.

## Content Writing Guidelines (`/info`)
- Store content in the `/info` directory with proper subdirectory organization (e.g. `about-me/`, `career/`, `projects/`, `ai-ml/`).
- Include YAML front matter at the top of each Markdown file with `---` delimiters.
- Use `# Heading` for main sections (H1) and `### Subheading` for subsections (H3).
- Keep sections focused and reasonably sized so retrieval surfaces clean, self-contained chunks.
- Use descriptive section titles that clearly indicate the content's topic.

## Environment Variables
- `ANTHROPIC_API_KEY` - Claude API (the agent loop)
- `AGENT_MODEL` - overrides the default agent model (`claude-sonnet-4-6`)
- `NEON_DATABASE_URL` - Neon Postgres connection string (Drizzle)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` - Clerk auth
- `RESEND_API_KEY` - Resend email
- `TOKEN_ENC_KEY` - AES-256-GCM key for encrypting stored OAuth / Notion tokens
- Google OAuth + Contentful + Notion credentials as required by their respective integrations
- `OPENAI_API_KEY` - present for any OpenAI-backed utilities still in use

## Tone and Communication Guidelines
- **Voice**: Friendly and conversational while maintaining professionalism
- **Personal**: Use first-person perspective and include relevant personal anecdotes
- **Technical Content**: Balance technical depth with clarity for all readers
- **Anecdotes**: Include specific examples and stories that illustrate points
- **Length**: Be concise and focused, prioritizing quality over quantity

## AI Chat Behavior
- **Personality**: Professional yet personable, with occasional humor
- **Knowledge Boundaries**: Transparent about limitations and uncertainties
- **Response Style**: Concise, clear answers; adjust depth based on user's apparent expertise
- **Consistency**: Ensure responses align with Dan's actual views and communication style

## Code Style Guidelines
- **Imports**: Group by type (React, Next.js, libraries, components, styles)
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for variables/functions
- **CSS**: CSS Modules with `componentName.module.css` naming convention
- **Error Handling**: try/catch for async operations, especially database and external-API calls
- **State Management**: React hooks + Zustand stores (e.g. `stores/agent.ts`)
- **Path Aliases**: Use `@/` prefix for absolute imports from project root
