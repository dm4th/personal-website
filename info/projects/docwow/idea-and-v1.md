---
Title: DocWoW — Idea and Version 1
Start: June, 2023
End: August, 2023
Link: https://doc-iug984t8j-dm4th.vercel.app/
GitHub: https://github.com/dm4th/DocWow
---

# Idea Phase

A good college friend of mine, Cam, has always been drawn to emerging technology. He'd worked across business development, product management, and consulting—and in each role he'd pick my brain about technology trends. In the summer of 2023, he reached out with a specific challenge: how difficult would it be to build an AI assistant for back-office revenue cycle management workers in healthcare?

For the first time in a while, my honest answer was: not that difficult, given a focused effort. I started work in early June 2023.

The core problem was that medical records are almost exclusively transmitted as faxed PDFs—scanned documents with no extractable text, dozens of pages long, requiring precise citation rather than paraphrase. You can't just use a generic "chat with my PDF" approach. Back-office workers need to see exactly where information came from in the original document.

# Version 1 — Scanned PDF Chatbot

The first version needed to prove three things: that we could ingest faxed scanned PDFs, create citable chunks from them, and build a chat interface that returned answers with document-level citations.

### OCR with AWS Textract

The elegant solution for scanned PDFs was AWS Textract. We chose it for its multi-datatype support (text, tables, and key-value pairs) and its flexible per-datatype pricing.

The ingestion workflow: user uploads their document to S3, the app kicks off a Textract processing job via an AWS Step Function exposed through API Gateway, and a state machine loops over a Lambda function that first starts the job and then polls for completion. Once finished, the Lambda streams Textract's results back to the client—an array of block objects containing extracted text, page coordinates, and confidence scores.

Each block carries the coordinates of where on the page it appears, which becomes critical for the citation interface later.

Built with: Python, JavaScript, AWS S3, AWS Lambda, AWS API Gateway, AWS Step Functions, AWS Textract, React, NextJS, OpenAI API

### Generating Document Citations

With blocks extracted, the next step was generating citable summaries. I built three separate Supabase edge functions—one for each Textract data type (text, tables, key-value pairs). Each took blocks as input and generated a structured markdown table describing the page's information. I chose markdown tables specifically because [research suggested](https://github.com/brexhq/prompt-engineering/blob/main/README.md#markdown-tables) OpenAI models had extensive training exposure to GitHub README markdown formatting.

Each edge function then sent its structured data to the OpenAI API for summarization. Having the model generate a title before the summary was the key prompt engineering insight—without the title step, the model hallucinated and dropped information. With it, summaries were consistently accurate and comprehensive.

I embedded the title + summary together using OpenAI's embeddings model, and stored the embedding alongside page coordinates, document metadata, and page numbers in Supabase/pgvector for similarity search.

Built with: Python, JavaScript, NextJS, React, Deno, Supabase Edge Functions, OpenAI API, LangChain, pgvector

### Chat and Citation Interface

With citable chunks in the database, the chat interface was conceptually straightforward: embed the user's prompt, find the most similar document chunks, inject the top matches into a GPT completion prompt, stream the response back.

The interesting part was the citation UX. Textract gives you page coordinates for every block, so when the model cites a chunk, I could also return the coordinates—and use the React-PDF library with the highlighter plugin to navigate the user directly to the cited location in the rendered PDF. Select a citation in the chat interface, see it highlighted in the document viewer.

Built with: Python, JavaScript, NextJS, React, React-PDF, Supabase, OpenAI API, LangChain, pgvector

### User-Defined Roles and Goals

Just before the first prototype demo, I added a feature that turned out to be more valuable than expected: letting users define their analysis goal and the LLM's role before document ingestion. When uploading a document, users now define both the context ("you are a back-office RCM worker") and the goal ("identify all procedure codes and their coverage determinations").

The improvement was twofold: users felt more control over the process, and—more importantly—those inputs were incorporated during chunk generation rather than just at query time. Citations created with goal-specific context were far more semantically relevant to later user queries.
