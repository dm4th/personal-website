——-
Title: Action Network
Start: February, 2021
End: October, 2022
——-


## Making the Leap


Leaving Google, even though it felt like the right time to go, was still not an easy decision. I had told myself I wanted to give this new chapter at least 2 years before deciding to go elsewhere. I would have done that if I didn't think I was landing in the perfect spot for me. But along came Ari, who was my boss' boss for years at FanDuel and one of the brightest, most driven people I worked with while I was there. He sold me on a pitch to join a sports betting media startup in dire need of analytics support as his right hand man, leading a team of a few analysts to build up reporting infrastructure across their media and affiliate portions of the business. It sounded like another dream job opportunity for me and I jumped at it. Before I had really even been around long enough to feel as productive as I was used to being, I managed to get some small projects off the ground to at least demonstarate some competency.

#### Analytics Daily/Weekly Recaps
###### Key Technologies
- SQL
- Redshift
- Google Sheets
- Google Apps Script
- Google Analytics
- Google Analytics API
###### Description
Ari used to love the write ups I had done at FanDuel, so my first task I gave to myself was to build a daily & weekly report series to help business leaders better understand core metrics in the business. I leveraged existing work done by other analysts to get this off the ground more quickly, and made sure to ask as many questions as possible when I was stuck on definitions for key metrics. This was a great first onboarding task, something I will definitely look to do in the future as an early onboarding task. The reason is that to truly understand core metrics in a business, I believe that you should be able to report not just the metrics to others, but also the causality of those metrics and where they come from. Without going that extra layer deeper you're missing key elements of what drive those metrics in the first place. Having to create highly visible, frequent reports will shine a magnifying glass on inconsistencies and gaps in your understanding and provide a very quick timeline to rectify those mistakes. 


## Sale to Better Collective and Immediate Afttermath


Within a month of joining the Action Network I knew something was a bit off. I was invited into senior leadership meetings after a few short weeks to help build strategy around our quickly growing affiliate business, but it was always difficult to understand who was really in charge. Without my knowing, there were talks of selling to a major European sports betting affiliate platform, Better Collective, to capitalize on the growing revenues in that part of the business while getting a nice return for previous investors. That deal ultimately went through successfully, and in the aftermath Ari left the company to join Fanatics. I was stuck without a person in my corner and no one knew who I should report to or what I should prioritize my efoorts on. It was a very tough period to get through, but I learned a lot about advocating for myself and taking initiative wherever I could to help the company grow as a whole. I managed to get a few small projects off the ground at this time, but my real work was about to get started as we worked on integrating into the Better Collective family of companies.

#### Daily KPI Dashboard
###### Key Technologies
- SQL
- Redshift
- Google Sheets
- Google Apps Script
- Google Analytics
- Google Analytics API
- Google Data Studio
###### Description
Many of the core business metrics prior to my joining the company were housed in a few tableau dashboards connected through legacy software to our redshift instance. Unfortunately we had a major mismatch between our top of funnel KPI reporting (Google Analytics) and our product / revenue reporting (Redshift), and Tableau wasn't getting the job done entirely. In the previous project I ahd done I built it all using Google Sheets because I had experience working with the Redshift <--> Google Sheets connection during my time at FanDuel, and Google Analytics data plugged in very nicely with this soultion as well. This created a new source of truth... a massive google sheet. It was so slow and cumbersome, but with a new leadership structure on top of us we needed to get something out the door quickly. Google Data Studio turned into the perfect solution for this problem, a simple GUI for working with data actually living in a Google Sheet. I have to give credit to April on my team for building most of that infrastructure (she'll get more kudos later on as well). 

#### Audience Tracking
###### Key Technologies
- SQL
- Redshift
- SEM Rush (SEO Tracking)
- Google Analytics
- Google Analytics API
- Tableau
###### Description
Audience, particularly MAU, was the core KPI for the company since it's inception. Being able to show not just a growing audience on web/app, but also taht the sports betting audince in the USA as a whole was growing, was key to the company's ability to raise future funding and drive what at the time was the core business model, subscriptions. As we were preparing to sell to Better Collective, a comapny specializing in affiliate conversion, we needed a better way to track audience that better aligned with our new business model. To combat this I introduced the concept of DAU/MAU ratio and splitting platform perforamnce between desktop, mobile web, and app. To be fair, there were metrics the company was already tracking, I just made sure to give it more prominence in terms of the reporting myself and the team did across the company. Affiliate business models at their core are much more dependent on  high-value, high-intent sessions rather than repeat users, so understanding why users were comoing to our platforms and what they were using them for was much more important.


## The First Year Post-Ari


After a few months of getting to feel each other out, it was time to start collaborating much more effectively with our European counterparts. This meant doing a lot of translation, understanding what both parties were saying from a business perforamnce perspective and making sure metrics across both entities meant the same thing. Better Collective also wanted much more visibility into what we were doing. Unfortunately we were given a little too much space to work independent of them early on, and with our leadership struggling to convey optimism about the merger effectively there were a lot of easy wins that fell through the cracks at this time. I learned a lot here about how important strong, collaborative leadership is for businesses to succeed. I had previously thought that management was all about finding star individual contributors and doing everything in your power to make them as successful as possible. First you need management that is aligned on what our top priorities are though, and we never had that.
This time period also saw us change our organizational north-star from an audience focus to a revenue focus. I know this sounds a bit at odds with what I just said int eh previous paragraph, that leadership wasn't totally aligned with what we should be focusing on. This switch felt harmless for most people in leadership, but I think it had a negative effect on the team as a whole actually based on when this shift happened and how it was communicated though. When we were acquired by Better Collective, we went from a venture backed, growth-at-all-costs company to a company with financials that will have material impact on a public company's bottom line. We weren't in a postiion from a cost structure perspective to handle that change internally (we had far too many people in roles that weren't really driving all that much revenue despite driving a ton of audience), and leadership never made the neessary changes to fix that. 
All in all this period set up a lot of frustrating experiences later on. I could have done much better keeping my team engaged (more on that later) and helping to deliver the message around the changes we were going through. I could have also pushed harder for the changes I thought we needed at the company (at this time I was reporting to the CEO directly). Despite this though it wasn't all doom and gloom, as a lot of work did go in to how were focused the company.

#### Value Clicks Project
###### Key Technologies
- SQL
- Redshift
- Google Sheets
- Google Apps Script
- Google Analytics
- Google Analytics API
- Segment
- Python
- SciKit Learn
- Pandas
- Numpy
###### Description
In a new world where revenue was now the company's main priority shifting from audience, we had nearly 40% of the company move from the main driver of our core KPI to taking a major back seat role. This was our content team, and they are led by Chad, a genuis in the sports media space and someone who knew how to lead a large team. He was totally on board about shifting our focuse from driving MAUs to driving revenue, but he didn't know how to motivate his team now. They used to have a direct line-of-sight to how they were impacting our core perforamnce (how many people are reading my articles each month), but now that we were focusing further down the conversion funnel it was hard to tell how their efforts were being realized on our bottom line. Together with Chad and some of his leaders on his team (Katie, Steve, Andrew) we came up with the idea of a "Value Click" - for each read on an article what was the next action the user took and was it predictive of eventually making a subscription purchase or, better yet, clicking a promotional offer for a sportsbook. At this stage in the process for this project we needed something that we could point to for motivational purposes only, it wasn't directly tied to revenue yet, but they were split by platforms and sessions on each platform which was a major win for the team.
I had created custom metrics before, but this was the first time I really ideated and led a project of this caliber. I learned a lot about myself in terms of my technical abilites - I had to write custom queries that tracked each session on each platform to understand how value clicks maniffested themselves in the data in the first place, but more importantly I had to listen to the needs of a large team and deliver something to help them perform to their greatest capabilities. We found correclated metrics that had significant impacts on our bottom line like articles read / reader and cross-sport readers in this project as well.

#### Better Collective Data Sharing
###### Key Technologies
- SQL
- Redshift
- AWS
- Google Sheets
- Google Apps Script
- Google Analytics
###### Description
As the director of Analytics, I was an obvious person for the teams at Better Collective in Denmark to reach out to right away to start getting their hands on the data we had. We didn't have a plan to actually productionalize this sharing for a while, but early on I did do some work to automate some daily reporting for their financial stack. This was my first taste of working with teh folks over at Better Collective, which taught me how tough it can be to switch from a startup "move fast and break things" mentality to a "get this report on my desk by tomorrow morning in exactly this format" mentality within a single day.

#### Affiliate Performance Reporting
###### Key Technologies
- SQL
- Redshift
- Python
- CRON
- Google Sheets
- Google Apps Script
- Google Data Studio
###### Description
The reason we were acquired in the first place by Better Collective was due to very strong growth in affiliate driven revenue over the previous 12 months (almost all of which I was not there for). That growth continued through the next fall, and it became readily apparent that the systems we had in place to track performance across all of our Affiliate partners was not going to scale well if we continued to grow at this pace. April pushed very hard to hire Amanda, and thank god she did becuase they were both great at this time in building most of this infrastructure out. I also have to shout out Billy as well for his work with the two A's in building teh infrastructure for this automation (which at this time was through CRON jobs). We had nearly two dozen partners at this time, each with their own ways of reporting the traffic we were sending them. Billy, April, and Amanda worked together to automate much of the scraping and cleaning of this data, and presenting it in a way that solved a lot of issues for both Better Collective and Action managment at the time. I learned a lot about how to deal with stressful leadership situations during this project - and how to truly trust people working for me to deliver high-quality products and deliverables. This was still my first time managing anyone, much less a whole team, and I ahve to say April and Amanda made this first experience almost too easy for me.


## Year 2 Post-Merger


As part of the merger agreement in early 2021, Action agreed to specific revenue targets to deliver for Better Collective to amke the deal make sense to both parties. We continued to make our own internal revenue forecasts as the first year post merger went on, but we always did try to tie performance back to that deal to see how were were delivering on our promises. Well by February 2022 things were looking very bleak, and they only got more bleak as the summer of 2022 went on from there. To combat missing our targets by over 50%, we started to push harder and harder on our revenue goals, signing more affiliate partnership deals and pushing as much content inventory as we could. It had been a very tough year form a burnout perspective, and right when everyon thought we'd have some breathing room to relax a bit, Better Collective decided to get more involved to try to fix our lackluster performance. The clash of Action leadership trying to set their teams up for a bit of a breather and Better Collective wanting to push ahrder to meet goals really crushed morale for a while, and we started to lose high performing team members as a result. Early in the football season we lost Kristin, our head of people. Losing her started a cascade of other people feeling like Action / Better Collective may not be the place for them, and we lost both Billy and April as a result in the following spring. Shortly after April left we tried to restructure our team to better serve both Better Collective and Action, but Amanda also decided to move on from the team and we were left with a skeleton of the capabilities we had just 5 months prior. Times were definitely quite tough in analytics. After a year of thinking I as doing a pretty good job in my first go at being a manager of people, my confidence was pretty shattered, but I learned that people ahve their own views on situations. April leaving in particular still feels like my greatest mistake in my career to date, even though there were certainly a host of factors out of my control that led to that outcome. I'd love to be a manager again someday, I the experiences I had losing team members and convincing others to stay will be core to how I lead teams in teh future. I learned above all else you need to really listen to your people, and do everything in your ability to empower your top performers and motivate your weaker ones. That's the first and most important job of a manager, individual work needs to come second always, and I think I learned that lesson much too late.
Despite the turmoil in the team, we needed to start delivering on high impact deliverables over teh summer of 2022 to get ready for a new football season. We were undergoing another shift in our core business model at this time as well, shifting from a per/user CPA based affiliate model to a revenue share model with some of our key partners, which was a key factor in the ong-term profitablity of the company as a whle and required a great deal of analytical oversight. I was working 70-80 hours a week and while I wasn't loving all of the work I was doing, I loved being a part of a mission and working tirelessly to achieve our goals in the face of adversity. Our team was re-shuffled to be a part of Better Colelctive at this time rather than reporting in to Action leadership, and I started personally reporting to Melissa, our CFO of all of Better Collective in teh US. I learned a lot of resilience in this time, and how important it was to work with people you enjoy speding time with. I don;t think I could have made it through that summer without the team I still had around me.

#### Affiliate Deal Forecasting
###### Key Technologies
- SQL
- Redshift
- Google Sheets
- Python
- SciKit Learn
- Pandas
- Numpy
###### Description
As the affiliate side of our business started to dwarf the rest of our revenue sources, it became readily apparent that we needed to fix some core issues with the affiliate business model we were running. Before this time period we recognized all of our payment for referring a paying user to a sportsbook entirely up front, normally at the time that user made their first paid wager. Ths was great as we were getting the flywheel started with out partners, as sports gambling was just getting started in states like New York, Michigan, and Colorado and sportsbooks were just trying to get as many customers in the door as possible. As the market started to mature though, we realized we would eventually run out of users to refer to sportsbooks, and that we had no way to leverage our existing customer base to generate more affiliate revenue. We also started to run into some serious incentive mismatches with some of our core partners, because we were only paid on acquisition we had no incentive to help sportsbooks retain their users, while sportsbooks were quickly drowning and going out of business becuase they were acquiring tons of low value customers that wouldn't even pay back the fees they were paying us.
The solution that both sides agreed would work better in the long term was a revenue share agreement. We'd earn some smaller up-front payment for acquiring the user, and we'd earn a percentage of the losses that user incurred on that sportsbook over a 3-5 year timeline. Now given our short-term revenue woes that we were dealing with at this time, we were very hesitant to pull this switch given that it would negatively impact our short-term revenue even more. My role in this project was simple then: make a case for moving off of our current cost-per-acquisition revenue model to a revenue-share model.
The core argument hinged upon how much more money we'd make over the lifetime of our users in a revenue-share scenario than a cost-per-acquisition scenario. To accurately model the LTV of a revenue-share customer I needed actual play data from one of our partners, as well as a range of deal parameters to map against the user behavior after they activated on teh sportsbook. Luckily we had one of our biggest partners share all of the user-play data for customers we had sent to them over a 1.5 year time period, anonymized and on a monthly basis. Using this I could create user cohorts and their resulting play based on the users' state and month of first activation, and then map their monthly play based on retention rates and loss rates into future months. Based on these user-level forecasts, I created filters for deal parameters the deal team could use (revenue-share term length, deal percentage, up-front payment t us for acquisition) split by the state the user was in (taxes have a massive impact on user LTV so some deal terms just don't make sense in some states). Finally I used state-level user acquisition forecests I was also creating at the time to predict how many users we would acquire and therefore how much revenue we'd generate from either a cost-per-acquisition deal or a revenue-share deal.
The end result was a successful presentiation to the executive leadership team, convincing them to take a high 7-figure revenue haircut in the second half of 2022 to get an 8-figure revenue upside from 2023-2025 with one of our largest partner. My role in the presentation was explaining how I modeled user-level retention and losses forecasts, and why I made the decisions I did. I also put together the charts/graphs to help illustrate the revenue potential in the clearest terms possible.

#### Written Content and Social Content Target Setting
###### Key Technologies
- SQL
- Python
- Redshift
- AWS
- Airflow
- Google Sheets
- Google Analytics
- Google Analytics API
- Twitter Reporting API
- YouTube Reporting API
- Instagram Reporting API
- Tableau
###### Description
The content organization liked the work I had done with them the previous football season, but they were trying to really scale up their operations and needed more in-depth targets to make arguments for more headcount and hold their creators to a certain standard. Previous analyses I had done showed that value-clicks correlated strongly with increase in revenue generating events, but the content team was struggling with how to map metrics they felt were in their control (monthly-active-users, daily-active-users, sessions) to these value-clicks. 
I started with another analysis that showed that web and app had very different user archetypes on them - web users were looking for one off content, had a high bounce rate, and typically didn't convert super well. App users on the other hand had a higher propensity to convert to a subscription purchase or activate on a sportsbook the more time they spend in the app. While both of these realizations are quite obvious on the surface, it was nice for the team to be able to see this borne out in numbers. The core realization was that for web, daily unique readers, and for app, daily reads per reader, were the highest correlated metrics to value clicks and to downstream revenue generating events, so these became our key tentpole KPIs for the upcoming football season.
Then I built the team a simple tool in Google Sheets to come up with what they thought were reasonable targets on a by-month-by-sport basis for their KPI targets. They mapped back to our revenue targets as a company, and because of how strongly correlated the aforementioned audience KPIs were to downstream revenue, I felt confident that using a simple linear regression against what the target we came up with would be fair targets to hold the team to. For example, if we thought we could drive 25% more college football reads this year than last in October, but we needed a 28% increase in value clicks driven by content overall, another sport would ahve to increase by a proportional amount to make up the difference.
Each member of the team we assembled to discuss these targets (Chad, Katie, Steve, Andrew, and Korey) each came up with reads and reader YoY improvement targets for each month in each sport we offered for September 2022 thru December 2022 individually. Then we had three meetings over the next two weeks or so combining our targets, explaining why we made the decisions we did, and came to a consensus. Then Korey, a recenetly hired analyst on my team, did a lot of legwork operationalizing reporting against these targets in tableau. 
The result was a more more clear picture for the content team as a whole as to what we needed from them to hit our revenue goals as a company. We provided them with clear goals, and a great interface to sheck how their individual contributions were helping towards our overall goals.

#### Affiliate Reporting Pipelines
###### Key Technologies
- SQL
- Redshift
- AWS
- Airflow
- Python
- Google Sheets
- Google Apps Script
- Google Data Studio
- Tableau
###### Description
Combining our affilaite reporting with the rest of Better Collective US became a top priority as we further integrated the two teams. they were very impressed with the work April and Amanda had done over the past 8 months and wanted to expand that work to teh rest of the US operations. Unfortunately this meant adding two-to-three added layers of complexity regarding which sites were driving teh affiliate revenue, what deal types partners were on, and dozens of new partners. As a result we starting building a data engineering team internally to help migrate our processes from CRON jobs to an Apache Airflow system to better monitor our data scrapes and deal with the added complexity.
Right as this project was getting off the ground, Billy then April and then Amanda left the company. There were various factors that led to them leaving that I discussed earlier. But without them on the project, the only person still remaining with prior understanding of the systems was myself and a junior analyst named Grant. We inherited a solid foundation for this product, but it was still painstaking work to write thousands of lines of custom scripts for dozens of partners, and making sure it all aligned with set schemas we had for revenue reporting, all without anyone else on the team with any Python experience. We built a working model that worked for most of our partners, and quickly hired backfill to help with the project.
The end result was a working pipeline of scripts that accurately reported revenue for most of our partners. The biggest issues we had once football came around int he fall of 2022 was actually with our partners not being able to accurately report on their end, which was a much better problem to have than where we were in the spring of 2022.


## Football Season 2022 and Deciding to Leave


By the time football season rolled around we were hiring more team members in analytics to help scale up operations. We had high level targets and goals set for our key teams, and we were getting by o our ad hoc requests as they came in. I was planning on spending the football season really helping out on an ad hoc basis as needed, but mostly just trying to direct the team and help them grow to avoid the situations we had 6-8 months prior.
As most best-laid plans go though, I never had the time to do any of that. The first few weeks of the football season were woefully underperforming vs. our revenue targets that we still hadn't re-forecasted since the deal in April 2021, missing targets to the tune of -70% on most days. Better Collective upper-management called for a full re-forecast of our 3-5 year revenue plan during our busiest time of year and there was no one we could really blame but ourselves.
I'll get into how I built the forecast in a little bit here, but the results weren't pretty for our short term outlook. Even with finance bumping my forecasts up tremendously we still needed to make cuts to not go underwater due to the changes to our business model and just general underperformance, including headcount reduction. A week or so after the forecast for 2023-2026 was finished I was asked to cut an analyst that I had hired just two weeks prior. Given the difficulty we had with headcount reductions earlier in the spring/summer and the ong hours the team was already working I knew that this wasn't something I could do, so I quit the next day. I realize I could have helped in planning given the position I had and made sure we could ahve avoided the hurt that was going to hit over the next few months. I didn't have anymore faith that the leadership team we had could navigate these issues intelligently and I felt it was time for me to pursue other interests.
I don't regret my time at Action Network and Better Collective. I learned a ton of lessons in leadership, managing a team during difficult times, and how to really bear down and get stuff done when it's called for. I wish I had pushed harder for what my team needed at times, and spoke up more to leadership. I worked on some really interesting data projects and learned a lot about the best ways to expalin complicated machine learning concepts to business stakeholders.

#### Engagement Reporting for Other Better Collective Sites
###### Key Technologies
- SQL
- Python
- Redshift
- Google Sheets
- Google Analytics
- Google Analytics Reporting API
###### Description
Before diving in to forecasting revenue for all of Better Collective I needed a much better understanding of our other properties' audience patterns. We had about a dozen other properties that were also driving affiliate revenue at the time, and I had very little visibility into how these sites performed. So when I was asked to forecast their revenue I was a bit shocked but I managed.
I started by building out custom airflow pipelines to ingest daily user reporting into a singular reshift instance. These piplines would ahve later steps that aggregated all of the information into one master level redshift view, and was reported out to a google sheet for the time being.
This most difficult part of this project was working with  bunch of property owners who all had their own agendas. They all wanted to be protrayed in the best light possible to Better Colelctive management, so when I built these views they all wanted to see growth. Unfortunately that wasn't always the case, so I needed to have some tough converstaions with the business owners.


#### Long-Term Revenue Forecasting
###### Key Technologies
- SQL
- Redshift
- Google Sheets
- Python
- SciKit Learn
- Pandas
- Numpy
###### Description
After my work on revenue-share deal modeling, it was time to implement that analysis into our long-term revenue vision. The outputs of the model needed to be monthly revenue through 2026 on a state-by-state basis. The state level granularity proved to be incredibly important becuase our revenue in a particular geography heavily depended on when a state legalized online gambling. So while I thought the core input to the model would be a combination of when a state would legalize and the audience for each site/platform, some initial exploratory data analysis revealed that state-level audience was highly correlated with when a state legalized for most sites and platforms. This meant that audience (monthly-active-users) actually needed to be downstream from legalization and became an intermediary output to the overall model.
The model turned into a combination of three models at this point. The first was a model that took state legalization month as an input and had monthly active users as an outut. That output was fed into a model that predicted affiliate activations by operator by state based on monthly active users and how long the state had been legal. The third took forecasts of activations by month, state, and operator and predicted the LTV of each user to generate a running revenue total over the next 4 years (thru 2026). For each model I used a combination of Redshift queries and Google Analytics data, as well as data I scraped online to guess when a state would go legal, to generate the input data. I fed that data into various jupyter notebooks using Pyton, Pandas, NumPy, and SciKit Learn to do exploratory data analysis and pull out key factors to look out for in the modeling steps. This was very useful when I had to explain the model to stakeholders. For instance, explaining why one sites audience actually dropped when a state when legal (that site offered adivce for fantasy sports which were legal everywhere) while all the others would spike was a much easier conversation when I had data to back it up. Then I codified the model formulas into a large Google Sheet with filters to allow stakeholders to agree on assumptions that made sense to them.
The full modeling process took about 4 weeks of about 80 hours a week to build, and while i was very proud of the resulting output the rest of the business was not too happy with my conclusions. I learned a lot about how to convey information to executives that they simply didn,t want to hear, and how important hard data is to those conversations. I also learned a lot about how to trust brand new teammates to quickly pick up the slack on other projects that had begun to fall through the cracks while I focused on this project. Overall finance took my projections and bumped them up multiple percentage points without very much reasoning much to my chagrin, but I am proud of the effort I put in.