---
Title: FanDuel
Start: August, 2016
End: December, 2019
---


## The First Year


My time at FanDuel was very transformative in terms of how I work to this day. From the very beginning, even when I was living in NJ, I was the first one into the office and often one of the last to leave. A lot of time it wasn't because I was the most busy at the company (I definitely wasn't and I'll explain why in a bit), but because I realized I had a ton to learn and maximizing my time in the office was the best way to do that. I would frequently work for and hour or so before most other people showed up, trying to get a s much work done as possible, which would free me up to just sit in our open-floor office and listen. To this day I still think that being in office is superior to a remote environment, specifically for onboarding.

My initial projects when I first started at FanDuel were all geared towards daily operational reporting. Think early morning emails & updates to management to let them know how we're pacing towards goals. I had a great first manager (Michael) that set me up for success early on - he gave me an email template and process to update all the numbers that was easy to understand, and gave me the freedom to mess up without too many consequences. That daily process typically took about 2 hours to complete and involved checking over contest prizes that were awarded the previoud day, making sure we were getting a correct accounting of how much value we were awarding in prizes to correctly calculate our revenue from the previous day (entry fees - prizes awarded = revenue). This process involved running a SQL query to look for contests that needed manual intervention, updating a CSV, and uploading that CSV to another excel sheet that held the "source of truth" for revenue. Each contest was checked line-by-line, and mistakes were in-frequent, but they happened. I quickly grew tired of this process, and kicked off a series of projects that defined my first year at FanDuel.

#### Automated Prize Pools Script
###### Key Technologies
- SQL
- Redshift
- Python
- SQLAlchemy
- Pandas
- Excel
- APIs (Dropbox)
###### Description
So automate the Query --> CSV --> Excel pipeline I built a small python script that prompted me to add in prize pool information where needed. The added benefit was that I could now have a bit more control over the flow of information instead of usign a static process that was handed off to me, something I loved. I used SQLAlchemy in Python to create a pandas dataframe of contests that needed extra attention every morning. After I completed that manual part, the script would output a CSV for my records, write to the Excel file that lived in dropbox that finance needed as a source of truth, and also a SQL table I created to be able to start keeping track of the corrected prize pools in a database.

#### Target Tracking
###### Key Technologies
- SQL
- Redshift
- Python
- SQLAlchemy
- Pandas
- Chartio
- Looker
###### Description
After creating a SQL version of the corrected prize pools, I realized I had all the information I needed to not only calculate reveneue with a SQL query, but also create additional tables that tracked performance against a litany of targets. Having all of this inormation in our Redshift DB meant I could create dashboards in Chartio & Looker to let business stakeholders more easily view data than downloading an excel file every day. I created a pipeline of Queries & data pulls to upload our daily, weekly, and monthly targets into additional source tables to make sure we had the most up to date data every morning. The processes were all run through python on my local machine at this point still, but adding the ability to house the manual information in Redshift was a game changer for our operational efficiency.


#### Daily Scorecard
###### Key Technologies
- SQL
- Redshift
- Python
- SQLAlchemy
- Pandas
- Excel
###### Description
As stakeholders became more used to using the dashboards I created, I also got them more comfortable with different graphs that better helped people understand what was happening with the Daily Fantasy Sports ecosystem. There are a lot of moving parts that go into analyzing the health of the ecosystem considering that if specific user archetypes start to lose too much, the whole system falls apart for a variety of reasons. The Daily Scorecard was an email my boss started to help business stakeholders better understand their impact on the business bottom-line. I added different graphs to this report to drill further down into key aspects of the ecosystem beyond simply reporting metrics.


## Year Two


After a year at FanDuel I had established myself as a go-to person for business analysis from my counterparts in finance to the COO of FanDuel at the time. I had been through two rounds of layoffs, including a change of top-level leadership, and came out the other end stronger. At this time though my boss left the company and I was reporting to the VP of FP&A for a few months. I definitely learned a good amount working for this new boss (Dave), but maybe most importantly I learned that I could be of great use not jsut to operational teams, but especially for finance people in charge of financial forecasting. Under Dave I learned a great deal about modeling in Excel & Google Sheets, and my background in programming helped me to pick up advanced modeling concepts quite easily. Some projects I worked on during my second year (prior to working more with operations) included:

#### Weekly Ops Meeting
###### Key Technologies
- SQL
- Redshift
- Python
- SQLAlchemy
- Pandas
- Google Sheets
- Google Slides
###### Description
On Wednesday mornings we'd have a meeting full of senior leaders recapping how the previous week went, and how we'd improve on the upcoming weeks. It was a super iportant meeting where ideas were debated, but only with the backing of real data. Being the foremost authority in business analytics at this time this bacame my time to shine on a weekly basis. I'd send out a weekly report every week an hour or two before the meeting highlighting key things I thought we should discuss with data to back it up. I still believe every recurring meeting should always have an agenda/report associated with it and sent out prior to the call so everyone can be up to speed before it starts.

#### Monthly Account Reporting
###### Key Technologies
- SQL
- Redshift
- Python
- SQLAlchemy
- Pandas
- Excel
###### Description
I spent a good portion of time building out an accounting pipeline at this time as well. Because of the nature of accountants, this was really the first time where mistakes in my SQL or other mistakes would actually have serious consequences without anyone else looking over my work. I didn't do anything really ground-breaking here, but I did have to deal with very particular stakeholders while building a system from scratch for the first time.


## The Revenue Team


The rest of my time at FanDuel was spent working for Chris, the best boss I've ever had. He was the perfect mix of extremely intelligent, knowing exactly what he wanted and how he wanted it, and letting me solve problems and deliver solutions how I saw fit. He built a very strong team that drove perforamne for the company for a long time (and still do for the sportsbook to this day I'd imagine). This role was the perfect blend of freedom and requirements for me. I spent most of my days hacking away on making operations and analysis as easy as possible for business leaders. I did a lot of projects during this time, but ehre are some of the highlights. Overall I mostly learned that while delivering analysis is great for business leaders, some people really just want tools that make analysis super simple for themselves.

#### Scorecard Slackbot
###### Key Technologies
- SQL
- Redshift
- AWS
- Python
- SQLAlchemy
- Pandas
- APIs (Slack)
- Webhooks (Slack)
- Chartio
###### Description
By this time I was creating so many python scripts for business stakeholders that weren't technical enough to run them on their own that I needed some way to let them update data on their own timelines. I was always fascinated with chat bots & NPCs from my early days loving video games, and I thought it'd be fun to build a slackbot that could run queries & scripts against our data. I didn't realize how important it would become though... I started to run everything through my bot, to the point where I was completing tasks that used to take me hours in a couple minutes while I walked to work in the morning. I automated daily reporting in a slack channel that started conversations between stakeholders in an easy to find place for everyone to see. I also built wasy for people to check their specific performance to their targets in a chat interace private to everyone else. I used Python to build all of the scripts that ran queries against our Redshift database, and used but the Slack API and Webhooks to ingest user input to determine what they wanted the bot to do. This is probably the project I'm most proud of in my career, until my bootcamps starting in 2022.

#### Shadow Tracker
###### Key Technologies
- SQL
- Redshift
- AWS
- Python
- SQLAlchemy
- Pandas
- APIs (Slack)
- Webhooks (Slack)
- Chartio
###### Description
We started to want to increase internal company interaction wiht our products, but recent legal considerations made it very difficult for our employees to enter contests against our users (read: it was super illegal). So we created Shadow Contests: contests that mirrored our real contests and paid out winnings based on where our employee would have finished in a given contest (without our users being impacted at all). I automated discovery, reporting, and payouts of these contests using a combination of the slackbot and Chartio.

#### SQL Courses
###### Key Technologies
- SQL
- Redshift
- Google Slides
###### Description 
Even with all the work I did to make it easy for stakeholders to analyze performance without the need for a technical background, we still had people on our operations team that had an itch to do some deeper analyses. I don't think I'm doing the ops team justice when I say they were super sharp... They were incredibly smart and knew the product better than I could imagine someone knowing anything. Their boss, Zack, basically hired people who loved fantasy sports and let them chase their desires to the highest degree possible and it worked brilliantly. Unfortunately the one thing he couldn;t help them with was how to query past performance in our database... So I built a series of courses teaching his team and eventaully others how to work in our database from relational database first principles. This wasn't the last time I'd try to teach my coworkers new skills, but this was when I fell in love with it.

#### Markov-Chain Monte Carlo Simulation
###### Key Technologies
- SQL
- Redshift
- AWS
- Python
- SQLAlchemy
- Pandas
- Flask
- APIs (Slack)
- Webhooks (Slack)
- Chartio
###### Description
I built this project along with a really good friend of mine at FanDuel, Devin. Devin worked for Shane, probably the smartest person I worked with in my career so far, and his genius definitely rubbed off on myself and Devin and we needed it for this project. Going in to the 2019 NFL season we needed to nail our forecasting. Pervious years we either way overshot or way undershot our offical forecasts (off by ~6-8% or so) and we wanted a more scientific way to understand where we would potentially be missing if we did miss forecasts. To do this we looked at historical activation rates for upwards of 20 different types of users based on their spend levels and which sports they tended to play. Based on these profiles and their subsequent NFL spend we used spend and retention rates to predict how users would move between dozens of different user-types and how they'd eventually spend money on the platform. I was responsible for building the Markov Chain part of the model, understanding the user-state-machine and how to present the information in a way that could be used by Devin. Devin built the Monte-Carlo sinulation that gave upper and lower bounds for what to expect based on historical trends and spend on user reactivation, retention, and acquisition. The result was a model that was significantly more accurate and incredibly more diagnostic than anything we had used before. I used a ton of SQL to build the markov chain, and used the Slackbot to allow my team to update the information in the chain when needed. We used a combination of Chartio and a custom Flask frontend to display and make the forecasts actionable to business partners.


## Leaving FanDuel


To this point in my career I had been a very faithful soldier. Always working hard, delivering for higher-ups, and creating value where I could. I had very little impact on the company as a whole though, and I wanted to flex some leadership muscle as well. To Chris' credit he did get me the ability to have someone work for me to start my managerial career and tried to get me looking into different places in teh business I could work in, but Michael from earlier had a better idea. He referred me to a role at Google that I ended up getting, and I thought it was an opportunity I couldn't pass up. 
I don't think I'll ever quite find a team like the one I was on at FanDuel. We had so much fun and really drove the company at times. We were given the latitude to make mistakes and we had great successses. I think I'll always look for a team environment like I had t FanDuel.