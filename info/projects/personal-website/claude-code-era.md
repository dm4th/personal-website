---
Title: "Personal Website: Claude Code Era"
Start: March, 2025
End: Current
Link: http://www.danielmathieson.com
GitHub: https://github.com/dm4th/personal-website
---

# Using Claude Code and Cursor

In March 2025, Anthropic released Claude Code. It changed how I worked on this project entirely. As a busy Solutions Architect and later Lead TPM at Thoughtful AI, I had very limited time for personal projects. Claude Code made it possible to implement features and documentation that had been sitting on my "someday" list.

The site went through a significant rewrite during this period: from a Supabase-backed RAG system to a direct-SDK agent platform with a completely different architecture. The agent now uses Claude's SDK tool loop directly, communicates through Google Calendar and Gmail integrations, and supports a multi-panel conversation interface rather than a simple chat box.

### LLM Guessing Game

The first major feature I built with Claude Code's assistance: a game that challenges users to identify which AI model generated a particular response. Same prompt sent to GPT-4, Claude, and Llama simultaneously. One is randomly selected as the answer, and users try to guess which model produced which response.

The implementation required coordinating three simultaneous API streams from different model providers, managing complex React state across parallel async operations, and building a UX that let users toggle between guessing mode and direct model exploration. After guessing, users can browse all three models' responses to the same prompt, which turns out to be genuinely educational for understanding stylistic differences between models.

The most technically interesting part was handling the edge cases: what happens when one model is slower than the others, how to cache responses cleanly, and how to display partial streams while waiting for all three to complete.

Built with: Next.js, React, JavaScript, CSS Modules, OpenAI API, Anthropic Claude API, Replicate API (Llama), Server-Sent Events

### Thoughtful AI Documentation

Claude Code also helped me document two years of professional experience at Thoughtful AI, work I'd been doing but hadn't had time to write up properly. Using Claude's ability to ask targeted questions and organize information, I worked through my contributions to Thoughtful's products: the Hybrid-RAG system, agent telemetry dashboards, multi-portal eligibility verification, and the statistical value realization models.

The resulting content significantly improved the quality of the virtual assistant's knowledge base. An AI assistant grounded in rich, specific work history is much more useful than one grounded in vague summaries.

This process also demonstrated something I still find genuinely interesting: AI assistants can bridge the gap between lived professional experience and formal documentation, making it practical to maintain an up-to-date record of career work even during intensely busy periods.

### The Agent-First Rewrite

By early 2026, the site had been fully restructured around a direct Claude SDK integration rather than the Supabase edge function architecture. The virtual assistant became a proper agent with tool use: Google Calendar integration for scheduling, Gmail integration for email, memo storage, and a multi-panel engagement interface that separates the conversation view from tool activity.

The rewrite also moved state management to Zustand stores, replaced the Supabase backend entirely with Drizzle/PostgreSQL, and rebuilt the content serving infrastructure. The `/info` directory structure itself became part of the agent's context. The agent can read, search, and cite content from the site directly.

This site is the primary technical demonstration of what I'm actually building at Smarter Technologies: AI-augmented systems where the tooling, the knowledge base, and the agent work together as an integrated platform rather than separate components bolted together.

### Voice Agent (AssemblyAI Hackathon)

In early 2026, AssemblyAI ran a developer hackathon. I submitted this site.

My first approach wired their Streaming STT into the existing Claude text agent, then used the browser's native speech synthesis to read responses aloud. It technically worked. The problem was that the text agent is designed to produce long, structured answers: markdown headers, tool cards, multi-step reasoning chains. Spoken audio needs two sentences. The tension was fundamental, not fixable.

So I scrapped it and rebuilt around the AssemblyAI Voice Agent API: a single WebSocket that handles the entire voice loop. Speech in, LLM turn detection, tool dispatch, TTS out. One connection, one protocol. The old approach had four moving parts wired together. This one has one.

The agent runs three tools: a background search that reads my career content files for relevant experience, a job fit analyzer that runs a condensed version of the text agent's multi-agent analysis, and a job lead logger that captures opportunities visitors want to flag. The system prompt has a content map telling the agent exactly which category to search for which type of question: career files for work history, projects for tooling questions, about-me for personal background.

The hardest part wasn't the WebSocket or the audio. It was a race condition. AssemblyAI sends `reply.done` when the agent finishes its verbal turn. My tool fetch runs as an async HTTP call to a Next.js route. If `reply.done` fires before the fetch resolves, zero results get sent and the session hangs. The fix: store a `Promise` instead of the resolved result, and have the `reply.done` handler await all pending promises before transitioning state. The session stays in a researching state until the data actually arrives.

The visitor experience: connect, speak, watch the bar shift from "Listening" to "Researching: [search term]" to "Speaking" as the agent works through your question. No blank waiting. The research is visible.

### Lane

The first real conversation I had with the voice agent in production, I asked it what it wanted to call itself. It said Lane: clean, trustworthy, approachable. I liked the reasoning more than the name itself, so Lane stuck.

The agent starts in silence now. No greeting, no introduction. Lane waits for you to speak first. If you ask who you're talking to, it'll tell you. Otherwise it just answers questions.
