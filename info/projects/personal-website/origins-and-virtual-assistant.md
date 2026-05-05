---
Title: Personal Website: Origins and Virtual Assistant
Start: April, 2023
End: March, 2025
Link: http://www.danielmathieson.com
GitHub: https://github.com/dm4th/personal-website
---

# Project Kickoff

The main impetus for starting this project was simply to teach myself a modern frontend framework. Throughout my pre-bootcamp career I'd excelled at data and backend engineering, but any "frontend" work happened in Excel or a dashboarding tool. As I went deeper into my bootcamps, it became clear I couldn't ignore frontend development any longer. If I was going to show my work to anyone, I needed a way to publish it.

I taught myself React as part of my Solidity bootcamp with Metana, and NextJS was the obvious choice for a framework: intuitive routing, easy Vercel deployment, and a great learning tutorial to start from. My first commit was literally the NextJS getting-started walkthrough. Starting from zero.

The purpose has been ever-changing since. What began as a template for learning became a prompting blog, then a full RAG-powered virtual assistant, then an LLM guessing game, and now an agent-first platform. I've learned that whatever direction it goes, I'll figure it out along the way.

### Intro to NextJS

The foundation: React components, NextJS routing, server-side rendering, and the ability to render markdown as HTML. I built the header and footer components, set up the initial routing structure, and got comfortable with how NextJS handles page generation. The [NextJS tutorial](https://nextjs.org/learn) was genuinely excellent for this.

Built with: NextJS, JavaScript, React, Remark, CSS, server-side rendering

### Prompting Blog

As I completed my bootcamps, I was using GPT-4 extensively to accelerate development and making real progress in how I prompted it effectively. I wanted to document those techniques and share them. I also wanted experience with an industry-standard CMS rather than writing everything in raw markdown.

I integrated Contentful as a headless CMS, defined a schema for prompting blog posts that could capture highlighted model interactions with appropriate styling (speaker backgrounds, code blocks), and built the rendering layer that parsed custom tags I'd insert in the CMS. The result was a clean prompting blog that let me write in a real content management system while rendering custom conversation formatting.

Built with: NextJS, JavaScript, React, Contentful, server-side rendering

# Virtual Assistant

After spending time with the OpenAI API, I decided to build something serious: a virtual assistant that could answer questions about me, grounded in written content from my work history. It would use chat history and vector similarity to provide relevant, cited responses.

I over-engineered it somewhat, but I also learned a tremendous amount, and I'm proud of having shipped it as a zero-to-one product.

### User Accounts and Chat Roles (Supabase)

To persist chat history, I needed a backend. I chose Supabase for its free tier, edge function support, built-in auth, and Postgres foundation. Getting authenticated sessions working throughout a Next.js app was more complex than I expected; the key was creating a React context for the session state.

I added chat roles to customize the assistant's behavior: an "intro" role (general, get-to-know-me tone) and an "employer" role (prove-my-fit-for-your-company tone). Roles have a composite primary key of role/user-id and a one-to-many relationship with chat sessions.

Built with: NextJS, JavaScript, React, Supabase Auth, Supabase Database, PostgreSQL

### Generating Content and Storing Embeddings

The knowledge base is only as good as its content. I spent about half the total project time writing about myself, then built a script to chunk that text by H1/H3 headers, embed each chunk using OpenAI's ada-002 model, and store the chunks with embeddings in Supabase's pgvector extension for later retrieval.

The embedding script reads every markdown file in the info directory, chunks it, generates embeddings, and stores them with metadata like the source path and section title. Change detection via SHA-256 checksums means incremental updates don't re-embed unchanged sections.

Built with: JavaScript, Supabase Database, pgVector, OpenAI Embeddings API, LangChain

### Client-Side Chat

The chat UX centers the input field, with controls above and history below. Streaming tokens from the server produces a much better experience than waiting for a complete response. I used Microsoft's fetch-event-source package to handle SSE streaming from the Supabase edge functions back to the React frontend.

Chat history is stored in the database. Each message is also embedded for later retrieval. When building the prompt, I include both recent messages and the most semantically relevant message from older history.

Built with: JavaScript, React, NextJS, Supabase, OpenAI API, fetch-event-source

### Server-Side Chat and Prompt Engineering

When a user submits a prompt, a Supabase edge function handles everything: embed the prompt, run vector similarity searches against both the written content and chat history, assemble a prompt with role context plus top-3 most relevant text chunks, and stream the GPT-3.5 response back.

Similarity thresholds determined behavior: above 0.82 similarity → the assistant cites the source; below 0.70 → a generic fallback passage is injected. Cap at 3 context chunks; more than that made responses too general. The result was a grounded, citation-aware virtual assistant running on a Deno edge function.

Built with: TypeScript, Deno, Supabase Edge Functions, pgVector, OpenAI API, LangChain
