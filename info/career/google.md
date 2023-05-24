---
Title: Google
Start: January, 2020
End: February, 2021
---


# Onboarding in Office


Upon relocating to the Bay Area, my initial plan was to reside in corporate-sponsored housing near the Google Cloud campus. This proximity offered an ideal onboarding situation, allowing me to immerse myself in the company's culture and learn the ins and outs of working in the tech industry. During the early months, the pace was relatively slow, and I found myself with ample free time to explore my colleagues' queries and dashboards. This period provided me with valuable insights into subscription businesses and the key drivers of performance. Additionally, I took full advantage of the various perks Google had to offer, from the incredible food options to the state-of-the-art gym facilities. However, my time in Sunnyvale was short-lived, as a significant turning point was just around the corner.


# COVID Lockdowns


Soon after I transitioned to San Francisco, the COVID-19 pandemic hit, resulting in widespread lockdowns and a sudden shift to remote work. While the timing was impeccable, allowing me to seamlessly transition from office to remote work without having to commute, adapting to the new normal presented its own set of challenges. Initially, I, along with many others, felt somewhat uncertain and unsure of how to contribute effectively. However, after a month or two, an opportunity arose for me to take on a project related to headcount planning, left by a colleague going on caregiver's leave.

### Contractor Headcount Planning
#### Key Technologies
- Google Sheets
- Google Slides
#### Description
This project marked my first substantial undertaking at Google. It involved extensive research on contractor rates across different countries. As teams grappled with the challenge of managing costs associated with short-term contractors during the early stages of the pandemic, I delved into the cost side of the business, complementing my revenue forecasting role. The model I developed allowed product owners to flexibly adjust headcounts in various regions based on their specific requirements.

### Forecast Cube Automation
#### Key Technologies
- Google Sheets
- Google Apps Script
- SAP
#### Description
As the pandemic persisted and in-person meetings became increasingly impractical, it became evident that we needed better communication channels to articulate the projected effects of COVID-19 on Google Cloud's top and bottom line. To address this, central finance introduced a new platform for forecasting across the company. However, this posed a challenge for our team, as it necessitated aligning our forecasts with the prescribed format. To streamline the process, I built a Google Sheet that transformed our existing forecast formats into the new standard using Google Apps Script and the internal SQL engine at Google. Although relatively straightforward, this project provided the team with more flexibility and alleviated the burden of rebuilding models to accommodate the format change.


# Fall of COVID Lockdowns


As we settled into a routine with remote work, we began to shift our focus to longer-term projects and the realization that our daily tasks required more serious attention. By this point, I had gained confidence in working with the internal GoogleSQL language and its associated plugins. Consequently, I undertook several larger projects.

### Product PL Statements
#### Key Technologies
- SQL
- GoogleSQL
- Google Sheets
- Google Slides
- Internal Google Tooling
#### Description
During the financial system migration, our backend P&L reporting infrastructure encountered issues. While we had access to actual performance data on some dimensions and forecast data on others, integrating the two in a meaningful way for business owners proved challenging, necessitating numerous caveats. Leveraging my SQL skills acquired at FanDuel, I collaborated with the financial data engineering team to address this issue. The project was demanding, and conveying the solution proved difficult, but the end result received positive feedback. The majority of the work involved GoogleSQL, including the development of macros and functions to ensure consistent definitions not only in my queries but also among my teammates. The "front end" of the project resided in Google Sheets, which allowed for data import and presentation.

### GSuite Product Revenue Forecasting
#### Key Technologies
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
#### Description
During this period, I assumed responsibility for forecasting GSuite revenue. While the existing forecasting system was robust and required minimal modifications, I decided to build a machine learning model in parallel to validate and enhance the accuracy of the numbers. Although occasional challenges emerged, explaining the discrepancies to central finance provided valuable experience in conveying information effectively. The model I developed utilized internal Google tooling, leveraging time series data and key performance factors identified through a PCA exercise. These components were seamlessly integrated into the SQL pipeline, which ran automatically alongside other data processes. This project was intellectually stimulating, and while the majority of the tools used were specific to Google, the PCA methodology holds broader applicability.

### Google Apps Script Teaching
#### Key Technologies
- Google Apps Script
- Google Slides
- Google Sheets
#### Description
While my team excelled in Google Sheets and financial modeling, scripting skills were lacking. Google Apps Script provided a convenient means to run asynchronous jobs within a Google Sheet, transforming it into a dynamic web dashboard. After successfully automating various tasks, such as the forecast cube and P&L work, team members expressed interest in learning more about how to leverage this tool in their own models. In response, I developed a concise training course to teach them the process behind my creations. The familiarity of the Google Sheets environment enabled the team to grasp the concepts easily and appreciate the potential of scripting. This teaching experience served as a foundation for future instances where I shared my knowledge and skills with colleagues.


# Leaving Google


After working at Google for approximately a year, including nine months of remote work during the COVID-19 pandemic, I realized that Google was not the long-term destination for my career that I had initially envisioned. I yearned for the startup atmosphere and the opportunity to take ownership, make mistakes, and be recognized for going above and beyond. While Google did not afford me that chance, I don't regret my decision to join or leave the company. My time at Google taught me invaluable lessons about my preferences and dislikes. I would recommend anyone in the tech industry to spend a year or two at a tech giant to gain insights into large-scale processes and witness world-class programs in action.