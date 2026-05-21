---
Title: "DocWow: Live on the Personal Website"
Start: May, 2026
End: Current
Link: /projects/docwow
GitHub: https://github.com/dm4th/personal-website
---

# Bringing DocWow to the Personal Website

Three years after the original prototype, DocWow became a live interactive demo on this site. The rewrite kept the core insight (pixel-precise Textract citations, role-aware analysis profiles) but replaced the entire backend stack and made the demo publicly accessible without any account creation.

### What Changed

The original DocWow ran on Supabase edge functions, OpenAI embeddings, and a pgvector similarity search pipeline. The new version simplifies the architecture significantly: upload a PDF, let AWS Textract extract blocks, then chat with Claude directly using a dynamically generated skill file. No vector database, no embedding step, no stored session history beyond the active browser tab.

The result is a faster demo loop. A typical document is ready to chat in under 60 seconds, and every citation links back to a pixel-precise bounding box on the rendered PDF page.

### Technical Architecture

The demo runs as a split-service system: a Next.js frontend on Vercel and an AWS Lambda function for the compute-intensive work.

**Frontend (Vercel):**
- Direct S3 upload via presigned PUT URL (no file passes through Vercel)
- `/api/projects/docwow/start` kicks off the Textract job and returns a session ID immediately
- `/api/projects/docwow/status` is polled every 3 seconds until processing completes
- Both routes invoke Lambda via AWS `InvokeCommand` with IAM credentials (no public Lambda endpoint)

**Lambda:**
- Receives the S3 key, submits `StartDocumentAnalysis` to Textract with `TABLES` and `FORMS` feature types
- On each status poll, checks `GetDocumentAnalysis` until `SUCCEEDED`
- Parses all blocks into typed `ExtractedBlock` objects with bounding boxes and confidence scores
- Runs a Claude Haiku call on the first 60 text blocks to generate 3 suggested questions tailored to the document
- Stores session state in DynamoDB with a 24-hour TTL

**Chat pipeline:**
- The user's analysis profile (role + goal + optional custom questions) generates a system prompt at chat time
- User messages and conversation history are sent to Claude Opus with the full block list embedded in the system context
- Claude returns structured JSON: `{ answer, citations: [{ blockId, pageNumber, quote, type }] }`
- Each citation is enriched server-side with the bounding box and Textract confidence score from the block index
- Confidence scores below 99% are shown on citation pills; scores below 90% get a warning flag

**PDF rendering:**
- `pdfjs-dist` renders each page to a canvas element
- A positioned overlay div maps Textract bounding boxes (0-1 float coordinates) to pixel coordinates on the canvas
- Citation clicks scroll to the correct page, flash the highlight overlay, and show the source quote

Built with: Next.js 15, TypeScript, AWS Lambda, AWS Textract, AWS S3, DynamoDB, Anthropic Claude Opus, Anthropic Claude Haiku, pdfjs-dist, CSS Modules

### Analysis Profiles

One of the original DocWow features that carried forward almost unchanged: users define their role and goal before the document is processed. The system uses that context when generating suggested questions and when prompting Claude for answers.

Four built-in templates cover the most common medical document use cases:
- **Patient** - plain language, explain terminology, focus on diagnoses, costs, and follow-up instructions
- **Healthcare Provider** - clinical context, procedure codes, relevant history
- **Insurance Reviewer** - coverage determinations, denial reasons, appeal grounds, billing codes
- **Custom** - free text role and goal input

Users can also pre-populate questions in the profile setup. Auto-generated questions from the document are merged with any user-supplied ones, capped at five, in the chat panel's suggested questions bar.

### The Vercel Hobby Plan Constraint

Vercel's Hobby plan caps serverless function execution at 10 seconds. AWS Textract takes 20-60 seconds to process a multi-page document. The solution was the same one the original DocWow used: split the work across two API calls.

`/start` submits the Textract job and creates the DynamoDB session record. It returns in under 2 seconds. The frontend then polls `/status` every 3 seconds. Each poll is a fast Lambda invocation that either checks Textract progress or, on completion, parses the blocks and generates suggested questions. The polling loop runs up to 40 times (a 2-minute cap) before surfacing a timeout error.

This architecture also means the Lambda function handles retries naturally: if a poll call fails, the frontend just retries on the next tick.

### Where It Connects

DocWow started as a prototype for a very specific problem: helping healthcare back-office workers navigate faxed PDFs. The personal website version generalizes that to any PDF, but the core design insight is the same. Trust in AI-generated answers requires knowing exactly where those answers came from in the source document. Pixel-precise citations are not a nice-to-have; they are the entire point.

The Anthropic SDK integration here is more direct than the original. Instead of RAG over pre-embedded chunks, the entire document block list lives in the system prompt. For short to medium-length documents, this works better: Claude has access to every block simultaneously, can reason across the full document, and doesn't need to retrieve the right chunks. The tradeoff is context window size for very long documents, which is why the original embedding approach is still the right choice for production systems at scale.
