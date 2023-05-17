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
- Google Data Studio
###### Description
Many of the core business metrics prior to my joining the company were housed in a few tableau dashboards connected through legacy software to our redshift instance. Unfortunately we had a major mismatch between our top of funnel KPI reporting (Google Analytics) and our product / revenue reporting (Redshift), and Tableau wasn't getting the job done entirely. In the previous project I ahd done I built it all using Google Sheets because I had experience working with the Redshift <--> Google Sheets connection during my time at FanDuel, and Google Analytics data plugged in very nicely with this soultion as well. This created a new source of truth... a massive google sheet. It was so slow and cumbersome, but with a new leadership structure on top of us we needed to get something out the door quickly. Google Data Studio turned into the perfect solution for this problem, a simple GUI for working with data actually living in a Google Sheet. I have to give credit to April on my team for building most of that infrastructure (she'll get more kudos later on as well). 

#### Audience Tracking
###### Key Technologies
- SQL
- Redshift
- SEM Rush (SEO Tracking)
- Google Analytics
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
