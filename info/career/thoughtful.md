---
Title: Thoughtful
Start: September, 2023
End: Current
---
# Discovering Thoughtful

After a couple of months interviewing at different types of companies, I started to realize rat I was spending too much time working on a product with a friend of mine. Rather then research more problems to fall in love with, I felt like I had already found quite a good candidate. [DocWow](https://www.danielmathieson.com/info/projects/docwow) was getting a bit of traction as an appeals letter generator for health insurance denials for providers. Once I finished the MVP, I decided to search for competition in the AI - enabled RCM space. The first hit on my first google search was a company called Thoughtful AI. They had a solutions architect role open that I immediately applied for just to check it out. Chris at Thoughtful was the only hiring manager at the time that actually used my chat interface on this website to learn more about me. That spoke volumes for what he and Thoughtful were looking for, I had found my next step.

At the time, Thoughtful was still an RPA shop for any customer willing to pay. There was no vertical specialty play yet, we were still looking for product market fit. The role I was being hired for in particular sounded like a very general role, with an emphasis on problem solving and systems design. I was eager to get into a vary lucrative industry with problems to solve, and I turned out to be correct in my assumption. 


# Solutions Architect

My first role at Thoughtful was as a solutions architect. I would sit with our customers for hours on end, learning the ins and outs of their systems and processes. I'd then so into excruciating detail to outline a process for a team of offshore developers to automate. The documents we would create to specify those details were called a Master Automation Plan, or MAP for short. These documents were essentially pseudo-code complete with data structures and assembly-like instruction sets and syntax. We could automate anything either on-prem or in the cloud. 

As we built more automations, it became rather clear that healthcare, specifically revenue-cycle-management, would be our fastest and best path to growth. Healthcare billing is ripe for automation because of the incentives and volume of health insurance. Payers are incentivized to do whatever they can to not pay out claims. This is their top priority, providers prioritize patient care. For this reason, the whole system is built to service payers and healthcare costs rice as a result of needing to cover up for sky high denial rates. This pivot created a slew of new problems for a systems-thinker like myself to solve.

### Hybrid-RAG
#### Key Technologies
- Python
- Jupyter Notebook
- Cursor
- OpenAI GPT3.5
- OpenAI Text Embedding Small
- Microsoft Excel
- Sharepoint API
- pgvector
- AWS RDS

#### Description
Dental eligibility is one of the more difficult tasks to perform in all of RCM. Specific services have different coverage levels, exclusions, and limitations depending on the patient's plan. Patient demographic information and dental history play a huge role in determining eligibility for dozens of services, and offices like to check eligibility for dozens of the patient isn't even being for in advance in case the dentist wants to add services to an appointment after an initial examination.

 Additionally, coverage is also explained in a set of free text fields. For instance, a code like D0140 car have a limitation like "2x per year" or "2x" or "twice per year" all across different payer sites and UI's. The text will also include information regarding age limits for services, maximums based on other codes, and even which teeth limitations applied to. The unstructured nature of the text made edge cases very unpredictable, especially considering payers that don't went to make it easy on you. The tell tale sign of a hard automation problem is when you ask the customer for a set of rules and their response is "I don't know, I just do 

Luckily, we had a good set of deterministic data to learn from based on the work we did with another agent for this customer. I was able to retrieve that data and match in to the correct eligibility outcome for the patients with those code-level limitations. Next, I took those inputs ad concatenated them into strings as if I was injecting the data into a prompt. I mapped these strings to the outputs they generated as well, and created an input → output string for prompt injection. I saved all of the individual inputs, outputs, and related prompt strings to an excel file, and had the customer verify its accuracy.

I took all of the verified spreadsheet data, and dumped it into an RDS database. I used the OpenAI small embedding model to embed the input string for the record, saved the embeddings in the database, and built a small pipeline to take the spreadsheet data and import it with the embeddings on a daily basis with new records. I then had the engineers on the eligibility project retrofit the agent to collect the unstructured data and add it to the spreadsheet as well with what we were currently thinking the correct answer was. Over 80% of the time we here unsure and gave no answer, opting to alert the customer that our automation hit a point that we could not solve for them. The customer would write in the correct answer, and we would get a new labeled example.

The innovation was using cosine similarity on the previously seen examples to inject similar eligibility examples into a prompt to GPT 3.5. I we see an excel that is already in our database, we can skip the embedding and LLM steps and return the pre-approved result. For new situations we write our inferred answer to the spreadsheet for customer. Once approved, we can now use it as a new example, and we get the signal for what our accuracy was. We were over 95% within 2 days, and 100% after that using just 5 similar examples for in-context learning.

Following this rollout, we implemented similar systems in 3 mode automations within a month, and I was presenting the feature to our board within 2 months at being at Thoughtful.
