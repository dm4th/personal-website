---
Title: Google
Start: January, 2020
End: February, 2021
---


## Onboarding in Office


My initial plan after moving to the Bay Area was to live in corporate sponsored housing for as long as they'd let me before moving up to SF and commuting down to the office daily. This meant for the first few months I'd be biking distance from the google cloud campus, the perfect onboarding situation. I was super excited to work at such an important, large company, and really learn how things are done in tech.

The first few months were quite slow. There really wasn't a whole lot of work for me to do in the beginning, so I just spent my time digging through my coworkers' queries and dashboards, getting a sense for how subscription businesses work and what the key driving factors for performance were. I loved having the free time in the office though... who wouldn't at a campus like Google's?? I took advatnage of all the food, the gym, even the proximity to Sunnyvale was super nice. After 3 months my time in Sunnyvale was ending though, and not a moment too soon as I was getting kind of bored in a sleepier suburb and something else major was just around the corner...


## COVID Lockdowns


Right as I moved up to San Francisco, COVID locked down everything. The timing was so perfect that I cleaned out my desk on Friday, cleaned out my apartment the next day, and never once had to commute down to the south bay for my time at Google. The transition was difficult though, and I missed the perks and easy access to coworkers' knowledge of the office. In fact I felt rather useless for the first month or two - although that may have been a more widespread thought across more than just new people. I got my first chance to take over a projet about a month in to COVID though, as I took over some headcount planning work that was left by a coworker going on carer's leave.

#### Contractor Headcount Planning
###### Key Technologies
- Google Sheets
- Google Slides
###### Description
This was my first real project at Google, and it involved doing a lot of deep digging on different contractor rates for work in various countries. A big problem teams were having early on in COVID was making sure they weren't spending too much money on short-term contractors to fill in gaps that were left by full-time employees needing to take time off. Even though I was brought in for a revenue forecasting role, I enjoyed learning about the cost side of a large business. The model was quite simple, but it allowed flexibility for product owners to comprise their team of different numbers of headcounts in different regions around the globe depending on what they needed.

#### Forecast Cube Automation
###### Key Technologies
- Google Sheets
- Google Apps Script
- SAP
###### Description
During COVID while we were all separated and couldn;t meet in person, it became increasingly clear that we needed better ways to communicate what effects we expected COVID to have on the google cloud top and botto line. During this time central finance rolled out a new platform to load forecasts into for the whole company, making it difficult for our team to stay complaint with formats for what the rest of Google needed for our forecasts. I took the time to build a google sheet that could take our current formats for forecasts and put them into the new format using Google Apps Script and the internal SQL engine at Google. It was a relatively simple project, but gave the rest of the team some breathing room for not needing to re-build their models just for a format change.


## Fall of COVID Lockdowns


After months of working from home for COVID reasons, we fell into a rhythm on daily tasks, and people started to accept the fact that we needed to really start working on our longer term projects more seriously. I was also starting to feel much more confident in my abilities working with teh internal GoogleSQL language and the additional plugins it came with, so I took on a few larger projects at this point. 

#### Product P&L Statements
###### Key Technologies
- SQL
- GoogleSQL
- Google Sheets
- Google Slides
- Internal Google Tooling
###### Description
One issue we had with the financial system migration is that it broke a lot of our backend P&L reporting infrastructure. We knew what our actual performance was on some dimensions, and what forecasts were on another dimension, but we couldn't really connect the two in an intelligent way and display it to business owners without a ton of caveats. Well I flexed a bit of the SQL muscle I learned at FanDuel and worked to fix that alongside some of the financial data engineering team. It was a very tough project and it was quite dfficult to explain once I did fix it all together, but the end result was actually quite useful from what people said. Most of the work was in GoogleSQL, building macros and functions to make sure definitions were the same not just for when I queried the data, but also my teammates as well. Google also had tools to import a view of teh data into google sheets, so that's where the "front end" lived.

#### GSuite Product Revenue Forecasting
###### Key Technologies
- SQL
- GoogleSQL
- Python
- Pandas
- Numpy
- SciKit Learn
- ARIMA Time Series Modeling
- Principle Component Analysis (PCA)
- Google Sheets
- Google Slides
- Internal Google Tooling
###### Description
At this time I also took over forecasting for GSuite revenue. The system what was in place already was pretty solid and I didn't deviate from it much at the end of the day, but I did build a quick machine learning model alongside the old model just to validate and make sure of the numbers. There were definitely some hiccups from time to time, and having to explain those to central finance was a great learning experience in relaying information, but for the most part I was within reasonable limits for all of the months I forecasted. The model I built was using internal Google tooling again, where all you needed was a time series and some key factors for performance I found using a PCA exercise. It was embedded right in the SQL and ran automatically along with the other pipelines we had going. It was a really cool project to work on, but the tooling made it so easy that I don;t really even think anything other than the PCA is supar applicable to other projects I've done.

#### Google Apps Script Teaching
###### Key Technologies
- Google Apps Script
- Google Slides
- Google Sheets
###### DescriptionThe rest of the team was very skilled at google sheets and financanial modeling, and some people were also extremely skilled at SQL and dashboard building, but no one knew how to script. Google Apps Script is a super convenient way to fun asynchronous jobs within a google sheet and can make a sheet feel like a web dashboard. After building some cool automations like the forecast cube and some work ont eh P&L's, the team wanted to learn a bit more about how they could use it in their models. I put together a short course to teach them how I built some of the stuff I built. It was a gerat way to teach someone already familiar with Excel/Sheets how to script because its an environment native to them and they understand what the end goal is and how the process should look. I have definitely used similar concepts later on to teach other team members how to script.


## Leaving Google


After a year or so working at Google, and 9 months working from home, I know Google was not going to be the long-term stop for my career that I hoped it would be when I first joined. I missed the start-up feel FanDuel had. I love the ability to own something, amke mistakes, and be recognized for going above and beyond. Google never gave me that opportunity, granted I probably wasn't there long enough to let them give me taht chance. I also thought I was ready to lead a team myself, and when an opportunity presented itself to go back to sports betting in a leadership role, I took it full-steam ahead. I don;t regret going to or leaving Google when I did. I learned a good bit there about what I like, and a lot more about what I don't like. I would recommend people working in tech take a year or two to work at a big tech giant to see what processes look like at scale and what world-class programs looke like.