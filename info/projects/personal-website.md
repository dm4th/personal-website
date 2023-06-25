---
Title: Personal Website
Start: April, 2023
Link: http://www.danielmathieson.com
GitHub: https://github.com/dm4th/personal-website
---


# Project Kickoff


The main impetus for even starting this project was simply as a way to teach myself a modern frontend web framework. Throughout my career prior to my bootcamps I had excelled at data and backend engineering, but any work I needed to do for a "frontend" was handled in Excel or a dashboarding tool. As I got deeper into my bootcamps it became readily apparent to me that I could no longer ignore frontend development. If I was going to ever be able to show my work to anyone, I needed a way to make it available online.

I taught myself React as part of my solidity bootcamp with Metana, and I was looking for a web framework that was easy to publish online and that had an intuitive paging structure. NextJS was an obvious choice because of the pages directory and how easy it is to host with Vercel. My first commit was actually part of the initial walkthrough they have on the NextJS  home page... I really was starting from square 0. I quickly grew accustomed to how NextJS works, and I've used it in every project since.

The purpose of this website has been ever changing. From starting out as just a template to learn a web framework, to building out my own blog using a CMS, testing Supabase features like Auth and Edge Functions, and finally to working with LLM’s, this has been a scratchpad of mine in between projects. I have many directions I think I'd like to take it next, but it I've learned anything in building this, it's that whatever direction it goes I'll figure it out.

### Intro to NextJS
#### Key Technologies
- NextJS
- JavaScript
- React
- Remark Rendering Markdown
- CSS
- HTML
- Server-Side Rendering
#### Description
For the most part I simply followed the [intro tutorial](https://nextjs.org/learn) on the NextJS website. I created the image you see of me on almost every page as well as the header and footer components for the pages. I set up the initial routing scheme have and the ability to render markdown on the server-side.

### Prompting Blog
#### Key Technologies
- NextJS
- JavaScript
- React
- Remark Rendering Markdown
- CSS
- HTML
- Server-Side Rendering
- Headless CMS
- Contentful
#### Description
After building the bare bones of a blogging app, I moved on to finish my boot camps and work on another side project. In both of those cases I was making extensive use of GPT-4 to make development go much faster. I figured it would menu sense to document how I was interacting with LLM’s to improve over time and share my progress and tactics with others. I also thought it would be a good experience to leverage an industry standard CMS system as writing content in pure markdown is not really scalable in the real world.

So I started off by defining what exactly I wanted to capture in my prompting. I created a highlights section where I could emphasize specific communication with the model, but for the most part I wanted my conversations in the blog as-is. I needed a way to style conversations with who was saying which text (background colors) and code blocks as well. I did this by inserting tags into the text in the CMS, and parsing those tags as I rendered the text. The rest was simple API calls and CSS styling.


# Virtual Assistant


I decided that I wanted a serious prompt engineering project after messing with chatGPT and the OpenAI API a bit. To make a serious prompting project though, I felt that I needed to make a fully fledged product to show off all of the skills I had accumulated in my bootcamps and side projects. 

Because I was already looking for jobs, writing resumes, and reaching out to a bunch of loose ties, I figured a great project would be to create a virtual assistant that would tell people more about me. It would use a chat interface and use written content from us work history as a knowledge source to answer questions. I ended up getting a bit carried away and probably over-engineered it a bit, but I also learned a ton, and I'm proud that I could launch a zero to one product like this.

### Supabase - User Accounts & Chat Roles
#### Key Technologies
- NextJS
- JavaScript
- React
- CSS
- HTML
- Supabase Auth
- Supabase Storage
- Supabase Database
- Supabase JavaScript Client
- PostgreSQL 
#### Description
To simulate chats, I knew that I would need a way to store chat history. Supabase was the backend provider I went with for the following reasons:
1. Being a free-to-use platform for a project this size.
2. Its ability to host edge functions in the same JavaScript client.
3. Built in user authentication with email (so I could gather emails) and pre-made react components to drive Auth flow
4. Postgres is the SQL flavor I’m most comfortable with. 
Supabase was a great choice to host my backend services. Getting authenticated sessions to work throughout the app was more challenging them I thought it would be (The secret is creating a new react context). For chat history to work properly you need the concept of a user profile. Because I also want users of my site to be able to customize their chat experience a bit more, I added the concept of chat roles to my site as well.

The concept behind that roles is pretty straight forward. You set up a one-to-many relationship from user profiles to roles that the virtual assistant on act as in conversation. Every user gets the "intro" role on login where they can talk with an assistant that is prompted to try to get you to learn more about me. Users can also and the "employer" role, which changes the prompting of the assistant from an introductory tone to one that is trying to prove to you why I'd be a good fit for your company or project. Chat roles have a multi-levered primary key of role/user-id and have a one-to-many relationship with chat sessions.

I also added usernames and avatar pictures to accounts using supabase storage. It was very easy to set up actually. Overall accounts and chat roles associated with accounts were a nice proof of concept for how I believe LLM chat apps should be structured. They candidly don't provide a whole lot of utility to intended users of the site though, and no one has even signed up outside of the showing people how.

### Generating Content and Storing Embeddings
#### Key Technologies
- JavaScript
- Supabase Database
- Supabase JavaScript Client
- PostgreSQL 
- pgVector
- Markdown
- OpenAI
- OpenAI Embeddings API
- GPT3 Tokenizer
- ChatGPT
- LangChain
#### Description
The really powerful part about LLMs in my opinion is that they deal with text. For hundred, even thousands of years text has been the primary interface for people to share information more broadly than a conversation. With great power comes great responsibility though, and without a ton of written text to prompt and pull into an LLM the tool can become unwieldy quite quickly. So I spent a good 50% of the week and half I took to focus on and build this project just writing text about myself to pull from. I naturally used GPT4 to generate longer versions of what I wrote to include as much context as possible.

After finally writing a sufficient amount of text, the next step was building a script that would read my text and split it up into logical chunks to to referenced later. For instance, the current chunk you're reading starts at the header text “Generating Content and Storing Embeddings" and will end at the next section header. The script loops over every markdown file in the gray drop downs in the header above, chunks it, and embeds the words using the OpenAI ada-002 embedding algorithm. I then write that section of text along with the embedding and some extra metadata about the text (like how to link to it in later prompts) to my Supabase backend. We'll get into why I have to embed the text in a later section. 
If you're curious about what embeddings are, [here is a great overview](https://towardsdatascience.com/neural-network-embeddings-explained-4d028e6f0526)
.

Once all of the text was written, chunked, and embedded, all that was left was using NextJS dynamic routing to allow users to navigate directly to the source text is they chose to. I used a similar set up to my prompting blogs to achieve that, but without the need for the headless CMS.
 
### Client Side Chat - Chat UX
#### Key Technologies
- JavaScript
- React
- NextJS
- Supabase Database 
- Supabase JavaScript Client
- Supabase Edge Functions
- Fetch Event Streams
- PostgreSQL 
- pgVector
- OpenAI
- OpenAI Embeddings API
#### Description
The way I think about chat UX is that you want the chat input to be the center of focus, and everything should span out from there. This being a relatively simple interface, I broke the main UX into 3 components: a control interface above the chat input, and the chat history below the input. The control allows a logged in user to switch chat roles (explained above) and switch that instances as well. The history starts with the most recent message on top (closest to the chat input) and then scrolls down for older messages.

I also think that streaming tokens from the server back to the client on a chat request is much faster and appealing for the user then waiting for all of the tokens to finish. To enable text streaming as part of the response from the server, I used Microsoft's fetch event source JavaScript package that allows for the server to write tokens to a text buffer that can be read by the client.

Chat history is stored in the Supabase database as well, and I actually also embed each chat using OpenAI's ada-002 model as well. It's important to ensure that the correct historical chat context is added to the prompt for the LLM, and embedding chats is the best way to do that.

### Server Side Chat - Prompt Engineering
#### Key Technologies
- JavaScript
- TypeScript
- Deno Runtime
- Supabase Database 
- Supabase Edge Functions
- pgVector
- OpenAI
- GPT3 Tokenizer
- ChatGPT
- LangChain
#### Description
Once the user submits a prompt, that prompt is immediately sent to a Supabase Edge Function (using Deno runtime and written in typescript) and the rest is done on the server. Upon receiving the prompt the first thing the server does is embed the prompt. This is important so that we can retrieve the most semantically similar chunks of both written text by me and chat history from the user. By first embedding the prompt, we can actually run the database similarity searches asynchronously while we begin to build the prompt that we will send to GPT 3.5 turbo.

The prompt starts with a system message that provides context for the role the assistant is to play in the conversation. This role maps to the [chat roles](#supabase-user-accounts-&-chat-roles) discussed earlier. The rest of the system message is mostly filler for making sure the assistant doesn't hallucinate or say anything negative.

Next is injecting relevant context into the prompt. The dot product between the embedded initial prompt from the user and each of the embeddings of text I generated is calculated. The highest value (already normalized between one and zero based on the ada-002 algorithm) is the "most relevant text". I also added that it text scores above a 0.82 it is "highly relevant" and the assistant will cite the place it got the information from. If nothing scores above a 0.75, a generic passage of text is injected in its place. Typically I'll include about 4 chunks of relevant text per prompt, but it depends on how much fits in 2000 tokens (the amount I allotted for relevant text).

Next, I retrieve both the 5 most recent chat messages in this chat (or up to 1000 tokens) and the most relevant chat in the chat history (minimum score of 0.75). Those are also injected as that memory. I couldn't use the LangChain memory buffer for conversations because each time the edge function is called I'd technically be creating a new chat.

Between role, relevant text, recent chat history, and relevant chat history, the prompt that goes to the OpenAI LLM is much more nuanced than what the user entered. There is a significant amount of record keeping between the edge function and the database that happens to keep context, but overall LangChain makes it rather easy to work with LLM’s in this way.


# Future Work


The next thing I want to do is to allow the assistant to pull context from my personal Airtable trackers for specific roles. This would require some agent programming as I'd quickly run out of context window is I tried to inject Airtable records into prompts with relevant text chunks, but I should have probably used agents already anyway.

I'd also like to add a Hot Takes feature where I could write out some personal opinions of mine (pretty much all sports related) and have a bit more personality added to users' conversations.










