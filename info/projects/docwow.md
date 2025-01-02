---
Title: DocWoW
Start: June, 2023
End: September, 2023
Link: https://doc-iug984t8j-dm4th.vercel.app/
GitHub: https://github.com/dm4th/DocWow
---


# Idea Phase


A good friend of mine from college, Cam, has always had a passion for emerging technology and start ups. He worked in jobs ranging from business development to product management and now consulting for various industries. In each of these roles he has picked my brain about how I view technologies like spatial computing, blockchain, and generative AI. In a fit of frustration working in his consulting job one day he asked me how difficult it would be to create an AI assistant for back-office revenue cycle management workers in the healthcare insurance industry. For the first time in a long time I responded that I could actually build him the prototype he was looking for given I had the time to finally spend on it. I started work in early June, 2023 and have been working on it pretty diligently ever since.


# Version 1 - Scanned PDF Chatbot


The first prototype we needed to show to Cam's contacts was that we could build a system that could actually ingest medical information and make it useful to a user. There are a lot of walkthroughs online in how to create a "Chat with my PDF" bot, but these solutions often have many issues when it comes to applying these techniques to medical records.

1. Medical records are dozens of pages long, and typical chat with my PDF examples are only a few pages long. There are exceptions to this (there are quite a few walkthroughs that allow you to chat with company 10-K reports for instance).
2. We needed to be able to not only cite the information, but actually highlight where information came from in the document. Back-office workers can't paraphrase in their work, rather they need to have information directly from documents as it appears in the document itself.
3. The vast majority of medical records and documents are faxed for security purposes. This means that medical records are often scanned PDFs and don't have any actual text that you can scrape from them. This makes any typical ingestion process a much more difficult process, as you might as well be working with dozens of images rather than one large PDF.

There was one solution we found that elegantly solved all of these issues. From that point most of the work was just around the UI and making everything work seamlessly together. I added so newer features later on to make the system more responsive to users who aren't in the healthcare industry later, but we will get there in a moment.

### OCR and Textract
#### Key Technologies
- Python
- JavaScript
- AWS S3
- AWS Lambda
- AWS API Gateway
- AWS Step Functions
- AWS Textract
- AWS Amplify
- React
- NextJS
- OpenAI API
#### Description
The elegant solution we found to our problem of scanned PDFs was using OCR technology provided by Amazon. We went with Textract primarily due to their support for different data types that the algorithm can look for (text, tables, and key-value pairs) as well as flexible pricing for each data type. Initially a user has to upload their document to S3 as any docuemnt larger than a very small limit needs to be in S3 for Textract to work. Automatically the app then kicks off the Textract processing job on the document using an AWS Step Function made available thorugh an API Gateway. The step function loops over a lambda function in a state machine. 

The first invocation of that lambda function kicks off the Textract processing job on the file that was uploaded to S3. Subsequent calls to the lambda are checking whether or not the Textract job has finished processing. Finally once the job has finished, the step function state machine calls the lambda function to stream the results of the job back to the client for further processing. Results are streamed back as a long array of block objects with various refence points to each other. Blocks not only contain the text that are present in the block, but also coordinates for the page they were found on and confidence levels for how confident the algorithm is that the text it found is accurate.

In a future iteration, I'd probably create a new lambda function or EC2 instance to send the Textract results to rather than sending them to the client. Sending them to the client holds the client up from doing other things in the application while processing is happening. This isn't a big deal for documents of 10 pages or less, but a document of 50 pages or so takes 20 minutes to process.

### Generating Document Citations
#### Key Technologies
- Python
- JavaScript
- NextJS
- React
- Deno
- Supabase PostgreSQL
- Supabase Edge Functions
- Supabase Storage
- OpenAI API
- OpenAI Embeddings API
- OpenAI Text Completion API
- LangChain
- Prompt Engineering - Role, Objective, Task, Output
- Prompt Engineering - Markdown Tables
#### Description
Once the document has been OCR'd and the blocks of information have been sent back to the client, it's time to create citable pieces of text for a chat interface. To complete this, I set up 3 separate Supabase Edge functions, one for each Textract processing algorithm (text, tables, and key-value pairs). Each of these edge functions took blocks as input, and generated a large markdown table in text that described the information found on the page. This created a structured dataset out of the unstructured dataset that could be fed to a Large Language Model through the OpenAI API for summarization. I picked markdown as the format for the structured data describing the OCR output because of [this blog post](https://github.com/brexhq/prompt-engineering/blob/main/README.md#markdown-tables) that believes OpenAI's models read a lot of GitHub readme files. 

After feeding the structured data to the LLM through the OpenAI API, I had it create a title and summary for the information it was seeing in the page. Having the model create a title was an effective way to have it come up with a concise description before moving on to sumamrizing. Without the title, the model was prone to various hallucinations like making up information and ignoring other key pieces despite my best efforts to prompt it to only use information it could explicitly cite.

I then embedded the title and summary together using the OpenAI API embeddings model to improve the chances that keywords found in titles later match user prompts. I stored the title, summary, embedding, coordinates of the information on each page, and other metadata like page numbers and document information in the Supabase PostgreSQL database for later retrieval.

### Building the Chat and Citation Interface
#### Key Technologies
- Python
- JavaScript
- NextJS
- React
- React-PDF
- Deno
- Supabase PostgreSQL
- Supabase Edge Functions
- Supabase Storage
- OpenAI API
- OpenAI Embeddings API
- OpenAI Text Completion API
- LangChain
- Prompt Engineering - Parsing Citations
#### Description
Having the parsed information ready for retrieval in a PostgreSQL database made the chat interface rather simple. All I had to do at this point ws send the user prompt to an edge function, embed it, and check it's similarity against the document embeddings. Once I knew which citations were most similar to the prompt, I simply injected the text (title and summary) into a prompt to OpenAI's text completion API and had it respond to the user prompt. The most similar citations were also added to a new entry in a database for chat history for later retrieval. I streamed the LLM response back usign the streaming option on the OpenAI API to the client so that the user saw in real time how the LLM was responding with factual information about the scanned document.

From here the rest of the work was all on the UI. Based on the initial specifications for the prototype, I needed a way to actually show where in the document the information was coming from. I used the coordinates provided by Textract and stored in the processing steps above to also return the coordinates for cited areas fo teh document back to the client. These coordinates as well as a link to the stored PDF file are then sent to the React-PDF worker librrary with the highlighter plug-in enabled to take users to actual cited parts of the document. The user can select which citation they would like to see from the chat UI and it will appear in the PDF UI.

### Adding User-Defined Roles and Goals
#### Key Technologies
- Python
- JavaScript
- NextJS
- React
- Supabase PostgreSQL
#### Description
Up until this point I had been building for a specific use case - namely back-office revenue cycle management for healthcare. Just before we showed the prototype though, I figured a good value-add to the project would be to let the user define what the goal of their analysis is. When a user selects to upload a new document, they are now faced with a pop-up that asks them to define a role for the LLM when it reads the information from the document as well as the overall goal of their analysis. 

The benefits of this added approach are actually two-fold. First, this is a much improved UX as now the user feels much more control in how the document will be parsed. The second, and more important, outcome is that those inputs can be fed into the LLM at the time of document ingestion rather than as a chat prompt. This means that the citations the assistant creates during processing are much more relevant to the user's desired outcomes, and later on chat similarity is much higher as a result.


# Version 2 - Generating Output


The current phase of the project is a much higher step up from the previous version. Adding roles and goals to the input step was a very large improvement to overall UX for the product, but it doesn't go quite far enough. The next phase is to add output examples and allow the LLM to generate a similar example given certain inputs. For example, if the overall goal of the back-office worker is to generate an appeal letter to a medical insurance claim denial, shouldn't the LLM be able to achieve that task as well? 

Currently I'm working on this in a siloed input, i.e. I'm only thinking of one potential use case as a proof-of-concept. If you think you have a good use case for this technology, please feel free to reach out!