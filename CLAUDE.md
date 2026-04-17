# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npx eslint [file]` - Lint specific file
- `node scripts/generate_embeddings.mjs` - Generate embeddings from Markdown files
- `node scripts/generate_embeddings.mjs --refresh` - Refresh all embeddings (clears and regenerates all)
- `python scripts/convert_pdf_to_md.py` - Convert PDFs in `/pdfs` to Markdown
- `npx supabase start` - Start local Supabase stack (requires Docker)
- `npx supabase functions serve` - Serve edge functions locally
- `npx supabase db diff -f <migration_name>` - Generate a new migration from local schema changes
- `npx supabase functions deploy <function_name>` - Deploy a single edge function

**Note:** No test framework is configured. There are no test files, no test runner, and no test scripts in package.json.

## Architecture Overview

This is a personal website with an AI-powered RAG chat system. Users can chat with a virtual assistant grounded in content from the `/info` directory. The site supports multiple LLM backends (GPT-4, Claude, Llama) and includes a "guess the model" game mode.

### Data Flow: Content → Embeddings → Chat
1. **Content authoring**: Markdown files in `/info` (organized by topic: `about-me/`, `career/`, `projects/`, `ai-ml/`, `blockchain/`)
2. **Embedding generation**: `scripts/generate_embeddings.mjs` reads markdown, chunks by H1/H3 sections (max 1500 words), generates OpenAI `text-embedding-3-small` embeddings, stores in Supabase with SHA-256 checksums for change detection
3. **Chat query**: User prompt is embedded, searched against `page_embedding` table via `document_similarity` RPC (cosine similarity, threshold 0.4, top 10 results), context assembled with chat history and role-specific system prompt
4. **LLM response**: Streamed back via Server-Sent Events

### Two Chat Tiers

**Supabase Edge Functions** (`/supabase/functions/`) — Full RAG pipeline with database storage:
- `chat-intro/` and `chat-employer/` — Role-specific endpoints with moderation, history, embedding search, and chat persistence
- `chat-claude/`, `chat-gpt4/`, `chat-llama/` — Model-specific variants
- Shared logic in `_shared/`: `promptTemplates.ts` (system prompts per role), `chatHelpers.ts` (history summarization), `supabaseClient.ts`
- Uses LangChain (`langchain@0.0.171`) on Deno runtime — imports use `esm.sh` URLs, not npm
- Shared imports mapped via `supabase/functions/import_map.json`

**Next.js API Route Proxies** (`/pages/api/chat-*/`) — SSE proxy layer:
- `chat-claude/`, `chat-gpt4/`, `chat-llama/` — Forward client requests to Supabase edge functions and relay SSE streams back
- Exist so the frontend calls same-origin endpoints instead of cross-origin Supabase URLs

**Next.js API Routes** (`/pages/api/`) — Lightweight, no database:
- `claude.js` — Direct Anthropic API streaming (10-char chunks)
- `llama.js` — Replicate polling (60s timeout)
- Used for game mode parallel requests (bypass Supabase edge functions entirely)

### Key Components
- `ChatInterface.js` — Main orchestrator. Handles single-model and game mode, manages streaming via `@microsoft/fetch-event-source`, parallel LLM calls in game mode
- `LlmGuessGame.js` / `GuessHistory.js` — Game mode UI where users guess which model produced a response
- `SourceReferences.js` — Displays RAG source citations with similarity scores
- `SupaContextProvider.js` (`/lib`) — React Context for auth state, user profiles, chat roles (intro/employer), chat session management

### Database (Supabase + pgvector)
- `page` / `page_embedding` — Content storage and vector embeddings (service role access only)
- `chats` / `chat_history` / `chat_roles` — Conversation persistence with RLS per user
- `profiles` — User accounts (public read, self-write)
- `document_similarity` — RPC function for vector similarity search
- Migrations in `/supabase/migrations/`

### Content Pages
- `pages/index.js` — Homepage with ChatInterface
- `pages/info/[...filePath].js` — Dynamic route rendering markdown/PDF content from `/info`
- `pages/prompting/[id].js` — Blog posts (sourced from Contentful via `lib/promptingBlogs.js`)

### Deployment
- Hosted on **Vercel** with default Next.js settings (no `vercel.json`)
- Supabase edge functions deployed separately via `npx supabase functions deploy`
- Next.js 15 with React 18, uses Pages Router (not App Router)

## Content Writing Guidelines for Embeddings
- Store content in `/info` directory with proper subdirectory organization
- Include YAML front matter at the top of each Markdown file with `---` delimiters
- Use `# Heading` for main sections (H1) and `### Subheading` for subsections (H3)
- **Do not use H2 (`##`) or H4 (`####`)** — the embedding script only splits on H1 and H3
- Keep sections under 1500 words for optimal embedding chunking
- Use descriptive section titles that clearly indicate the content's topic

## Environment Variables
- `OPENAI_API_KEY`, `OPENAI_ORG_KEY` — OpenAI (embeddings + GPT models)
- `ANTHROPIC_API_KEY` — Claude API
- `REPLICATE_API_KEY` — Llama via Replicate
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase client
- `SERVICE_ROLE_KEY` — Supabase server-side (full access, used in embedding script)
- `NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL` — Edge functions endpoint

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
- **Error Handling**: try/catch for async operations, especially Supabase calls
- **State Management**: React hooks + SupaContextProvider context
- **Path Aliases**: Use `@/` prefix for absolute imports from project root
