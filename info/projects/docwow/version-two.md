---
Title: DocWoW: Version 2
Start: August, 2023
End: September, 2023
Link: https://doc-iug984t8j-dm4th.vercel.app/
GitHub: https://github.com/dm4th/DocWow
---

# Version 2: Generating Output

The first version proved the core technology: ingest scanned PDFs, create citable chunks, chat with them. The second version was about going further: from answering questions about a document to generating real work product from it.

The insight was straightforward but significant: if a back-office worker's job is to generate appeal letters for insurance claim denials, why should the assistant only retrieve information? It should be able to take that information, understand the goal, and produce a first draft of the actual output.

I built a proof-of-concept for one use case: given a scanned denial document and a goal of generating an appeal letter, the system would extract the relevant denial information, understand the denial reason, and draft an appeal letter grounded in the document's specific content.

### What It Taught Me

DocWow was the project that connected several threads that had been building through my bootcamps. The OCR work introduced me to healthcare's document infrastructure and why it's so different from other industries. The citation interface forced me to think carefully about trust in AI-generated content. Back-office workers can't paraphrase; they need to be able to verify every claim. And the role/goal input showed me how much UX context matters in AI applications: the same underlying model produces dramatically different results depending on how clearly you specify the task at the beginning.

It also introduced me to healthcare RCM as a domain. Cam's network included people who worked in this space, and as I understood the problem better, I found it genuinely compelling: a massive industry with misaligned incentives, complex workflows, and a lot of repetitive manual work that software should be able to handle.

When I found Thoughtful AI while researching competition in this space a few months later, DocWow was the project I pointed to. It's what got me in the door.

### Where It Connects

The core ideas in DocWow (RAG over domain-specific documents, citation-grounded responses, role-aware generation) show up in almost everything I've built since. The Hybrid-RAG system I built at Thoughtful was a more sophisticated version of the same pattern. The multi-agent meeting analysis pipeline at Smarter Technologies is a much more sophisticated version still.

The right way to use AI in high-stakes professional contexts isn't to ask it to answer questions and trust the output. It's to ground it in specific, verified sources, show users exactly where information came from, and let the human decide what to do with it. DocWow was where I worked that out.
