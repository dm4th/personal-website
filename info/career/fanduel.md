---
Title: FanDuel
Start: August, 2016
End: December, 2019
---


# The First Year


My tenure at [FanDuel](#https://www.fanduel.com/) from August 2016 to December 2019 had a profound impact on my work ethic and professional growth. From the outset, I demonstrated a strong commitment to learning by consistently being the first one to arrive at the office and often one of the last to leave. Despite not being the busiest individual at the company, I recognized the immense value of immersing myself in the work environment. Emphasizing the significance of in-person onboarding, I firmly believe that being present in the office fosters a superior learning experience.

During the initial phase of my FanDuel journey, I primarily focused on daily operational reporting. This involved providing early morning updates and email communications to management, effectively tracking our progress towards organizational goals. Under the guidance of my excellent manager, Michael, I gained a solid foundation for success. He equipped me with an easily comprehensible email template and process for updating crucial numbers. With the freedom to learn from my mistakes without severe consequences, I ensured accurate accounting of contest prizes, enabling precise revenue calculations. This intricate process entailed running SQL queries to identify contests requiring manual intervention, updating CSV files, and uploading them to an Excel sheet serving as the "source of truth" for revenue. Although mistakes were infrequent, I found myself yearning for a more efficient workflow, leading to a series of projects that shaped my first year at FanDuel.

### Automated Prize Pools Script
#### Key Technologies
- SQL
- Redshift
- Python
- SQLAlchemy
- Pandas
- Excel
- Dropbox API
#### Description
To automate the Query → CSV → Excel pipeline, I developed a small Python script. This script prompted me to input prize pool information as necessary, granting me greater control over the flow of information. I embraced the flexibility of this dynamic approach, in contrast to the static processes that were initially handed to me. By utilizing SQLAlchemy in Python, I created a pandas dataframe to identify contests requiring additional attention each morning. Upon completing the manual phase, the script generated a CSV file for my records, updated the Excel file in Dropbox (the designated source of truth for finance), and stored the corrected prize pool information in a dedicated SQL table.

### Target Tracking
#### Key Technologies
- SQL
- Redshift
- Python
- SQLAlchemy
- Pandas
- Chartio
- Looker
#### Description
Having developed a SQL version of the corrected prize pools, I discovered an opportunity to not only calculate revenue through SQL queries but also create supplementary tables for tracking performance against numerous targets. Centralizing this wealth of information within our Redshift database facilitated the creation of intuitive dashboards using Chartio and Looker. These dashboards empowered business stakeholders to effortlessly access data, surpassing the need for daily Excel downloads. To ensure real-time data availability, I established a pipeline of queries and data pulls, uploading our daily, weekly, and monthly targets into additional source tables. At this stage, the processes were executed locally using Python, and the incorporation of manual information into Redshift revolutionized our operational efficiency.


### Daily Scorecard
#### Key Technologies
- SQL
- Redshift
- Python
- SQLAlchemy
- Pandas
- Excel
#### Description
As stakeholders became more comfortable with the dashboards I created, I sought to enhance their understanding of the Daily Fantasy Sports ecosystem. This complex ecosystem involves numerous interconnected factors, where the performance of specific user archetypes can significantly impact the system's overall health. To provide a comprehensive picture beyond conventional metrics, I introduced different graphs into the Daily Scorecard report. These graphs delved deeper into key aspects of the ecosystem, empowering business stakeholders to gain valuable insights into their impact on the bottom line.


# Year Two


Having firmly established myself as a go-to person for business analysis during my first year at FanDuel, I became a trusted resource for counterparts in finance, as well as the Chief Operating Officer. Despite navigating through two rounds of layoffs and a change in top-level leadership, I emerged from these challenges even stronger. During this period, my boss left the company, and I subsequently reported to the Vice President of Financial Planning and Analysis (FP&A), Dave. Working under Dave's guidance proved invaluable as it exposed me to advanced modeling techniques in Excel and Google Sheets. My programming background enabled me to quickly grasp these advanced modeling concepts. Notable projects I undertook during my second year, prior to focusing more on operations, include:

### Weekly Ops Meeting
#### Key Technologies
- SQL
- Redshift
- Python
- SQLAlchemy
- Pandas
- Google Sheets
- Google Slides
#### Description
Every Wednesday morning, we conducted a vital meeting with senior leaders to review the previous week's performance and discuss strategies for improvement in the weeks ahead. As the foremost authority in business analytics, this became my time to shine on a weekly basis. Prior to the meeting, I diligently prepared and distributed a comprehensive weekly report, highlighting key discussion points supported by relevant data. I firmly believe that every recurring meeting should have an associated agenda or report shared beforehand, allowing participants to come prepared and up to speed.

### Monthly Account Reporting
#### Key Technologies
- SQL
- Redshift
- Python
- SQLAlchemy
- Pandas
- Excel
#### Description
During this period, a significant portion of my efforts revolved around building an accounting pipeline. The inherent nature of accounting necessitated meticulous attention to detail, as mistakes in my SQL queries or other aspects could have substantial consequences without any oversight. Although the work itself did not entail groundbreaking innovations, it presented unique challenges due to the involvement of highly specific stakeholders. I undertook the task of building an accounting system from scratch, marking my first foray into such a project.


# The Revenue Team


The remainder of my time at FanDuel was dedicated to working with Chris, the best boss I have ever had. Chris epitomized a perfect blend of exceptional intelligence, precise vision, and trust in his team's problem-solving abilities. Under his leadership, we formed a formidable team that consistently drove performance and achieved remarkable results for the company, particularly within the sportsbook domain. My role within the revenue team offered a harmonious balance between autonomy and meeting specific requirements. My daily activities primarily focused on simplifying operations and analysis, ensuring that business leaders could easily access crucial information. While numerous projects consumed my time, here are a few notable highlights that underscored the importance of providing business leaders with user-friendly analysis tools:

### Scorecard Slackbot
#### Key Technologies
- SQL
- Redshift
- AWS
- Python
- SQLAlchemy
- Pandas
- APIs (Slack)
- Webhooks (Slack)
- Chartio
#### Description
Given the volume of Python scripts I developed for non-technical stakeholders who lacked the expertise to execute them independently, I recognized the need for a system that allowed them to update data on their own timelines. Drawing inspiration from my fascination with chat bots and non-playable characters (NPCs) in video games, I embarked on an exciting project to build a Slackbot capable of executing queries and scripts against our data. However, the significance of this endeavor surpassed my initial expectations. Over time, I relied extensively on the Slackbot, streamlining tasks that used to take hours into mere minutes, even as I commuted to work in the morning. Leveraging the Slackbot, I automated daily reporting in a designated Slack channel, stimulating conversations among stakeholders in a central location. Moreover, I created a private chat interface that enabled individuals to assess their performance against specific targets. Employing Python, I built scripts to run queries against our Redshift database, while utilizing the Slack API and Webhooks to capture user input and determine the desired actions of the bot. This project remains one of the most gratifying achievements of my career, prior to my involvement in bootcamps starting in 2022.

### Shadow Tracker
#### Key Technologies
- SQL
- Redshift
- AWS
- Python
- SQLAlchemy
- Pandas
- APIs (Slack)
- Webhooks (Slack)
- Chartio
#### Description
As part of our initiative to increase internal company interaction with our products, we encountered legal restrictions preventing employees from participating in contests alongside our users due to regulatory considerations. To overcome this challenge, we introduced Shadow Contests—contests that mirrored our actual competitions but paid out winnings based on hypothetical placements of our employees, without impacting our users. I automated the discovery, reporting, and payout processes for these contests, combining the functionality of the Slackbot with Chartio to ensure seamless operations.

### SQL Courses
#### Key Technologies
- SQL
- Redshift
- Google Slides
#### Description 
Despite my efforts to empower stakeholders with non-technical backgrounds to analyze performance effortlessly, members of our operations team still expressed a desire to engage in more in-depth analyses. Acknowledging their exceptional abilities and passion for fantasy sports, I recognized an opportunity to fill the gap by teaching them how to query past performance in our database. Consequently, I developed a series of courses to equip Zack's team and others with the skills to navigate our database using relational database principles. This experience marked the beginning of my love for imparting new skills to my colleagues.

### Markov-Chain Monte Carlo Simulation
#### Key Technologies
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
#### Description
In collaboration with my talented colleague Devin, I embarked on a project that required both technical expertise and the guidance of Shane, the most brilliant individual I had the pleasure of working with. Ahead of the 2019 NFL season, we endeavored to enhance our forecasting accuracy. Previous years had seen significant deviations from our official forecasts, with errors averaging around 6-8%. To address this challenge, we sought a more scientific approach to understand potential areas of forecast inaccuracies. Leveraging historical activation rates for various user types based on their spending levels and preferred sports, we employed spend and retention rates to predict user transitions among different segments and their corresponding expenditure on the platform. My responsibilities included building the Markov Chain portion of the model, comprehending the user-state machine, and presenting information in a manner that facilitated Devin's analysis. Devin, on the other hand, developed the Monte Carlo simulation to provide upper and lower bounds for forecast expectations based on historical trends, user reactivation, retention, and acquisition spending. The resulting model proved significantly more accurate and yielded profound diagnostic insights compared to previous methods. SQL played a pivotal role in constructing the Markov Chain, and the Slackbot enabled seamless updates to the model's information. For visualization and actionable insights, we employed Chartio alongside a customized Flask frontend, empowering our business partners to leverage the forecasts effectively.


# Leaving FanDuel


Throughout my FanDuel journey, I remained a dedicated and committed team member, consistently delivering valuable contributions and creating impact. However, I yearned for an opportunity to exercise my leadership skills and explore new avenues within the company. While Chris endeavored to provide me with growth opportunities, it was Michael who presented an enticing referral for a role at Google, an opportunity I could not pass up. The team at FanDuel will forever hold a special place in my heart. We not only achieved remarkable success, but we also fostered an environment of camaraderie and enjoyment. I will always seek to replicate the team dynamic I experienced at FanDuel in my future endeavors.