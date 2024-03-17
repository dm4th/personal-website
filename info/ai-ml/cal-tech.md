---
Title: Cal Tech
Start: October, 2022
End: April, 2023
---



# AI/ML Bootcamp - Cal Tech



Throughout my career to this point I had spent most of my time working with rather large datasets, doing analyses that 90% of other people could not do themselves. There was always a small subset of problems I would come across though that I feel I needed a bit more training to do well. From my understanding I knew I didn't know enough technical algorithms and have the hard skills needed to truly be great at what I was doing before. I also knew AI/ML was what I needed to learn to take that next step,  and it didn't hurt that the field was quite popular at The time too.

I did some research and landed on a bootcamp for quite honestly the worst reasons. I didn't want a long term commitment because I didn't want to be out of the workforce for too long. I also didn't think I have the work ethic required to teach myself through YouTube videos and the online courses. I did some research online and found a great 6-month bootcamp through Cal Tech that seemed like the perfect fit. I should have trusted myself with free courses though. The bootcamp was fine, and it kept me honest, but the projects were too restrictive and there was too much stuff in the beginning of the course that I could have skipped over if I was self-pacing. Also, as I dove deeper into these topics, I know I would ahve found the work ethic to continue to dive deeper. I found I have a natual curiosity for these subjects, and letting my curiousity guide me would have been the correct move for me.


### Credit Loan Underwriting Engine
#### Key Technologies
- Python
- Pandas
- Numpy
- SK Learn
- Jupyter Notebooks
#### Description
This was a rather straightforward intor project to machine learning. I built a small random forest model to predict whether or not a customer would repay their loan or not. This was the first time I realized that data cleaning and exploratory data analysis is greater than 90% of the effort in building a good machine learning system. Of my 34 code cells in the project, only 4 of them had to do with actual model building. the reast were sleaning data and exploratory analysis.


### Book Recommendation Engine
#### Key Technologies
- Python
- Pandas
- Numpy
- SK Learn
- Jupyter Notebooks
#### Description
This was very similar to my Credit Loan project in that I spent most of my time cleaning the data I needed to make predictions. I tried a little too hard on edge cases for this one, and quickly realized that instead of trying to make less than a dozen data points work for my set out of thousands, I'd be better off for this assignemnt just ignoring them. Now in a production system I'm glad I went to the effort to clean those points, but I learned that all data is not created equal.


### Credit Loan Neural Network
#### Key Technologies
- Python
- Pandas
- Numpy
- SK Learn
- Jupyter Notebooks
- Keras
- TensorFlow
#### Description
For this project the dataset was realtively clean. this was more of a test on re-balancing classes and making sure we didn't overfit to a particular class in building a model. My first pass on a small dense network provided a really strong model... But it also predicted that I should hand out loans to anyone who asked. To fix that issue, I added some initial bias to each predicted class and got a horrible model that fit incredibly well to my training set, but gradually had worse loss for each epoch on my validation set. 

I started to have some negative classes predicted, but it seemed random. I tried overwieghting the "did not repay" class after that, and even tried to re-feature engineer my way out of not having as many reason to predict the positive class. The best model I built on the trainign set oversampled the negative class to have a better overall representation of what a normal distribution would look like for this type of problem.


### Credit Loan Neural Network
#### Key Technologies
- Python
- Pandas
- Numpy
- SK Learn
- Jupyter Notebooks
- Keras
- TensorFlow
#### Description
For this project the dataset was realtively clean. this was more of a test on re-balancing classes and making sure we didn't overfit to a particular class in building a model. My first pass on a small dense network provided a really strong model... But it also predicted that I should hand out loans to anyone who asked. To fix that issue, I added some initial bias to each predicted class and got a horrible model that fit incredibly well to my training set, but gradually had worse loss for each epoch on my validation set. 

I started to have some negative classes predicted, but it seemed random. I tried overwieghting the "did not repay" class after that, and even tried to re-feature engineer my way out of not having as many reason to predict the positive class. The best model I built on the trainign set oversampled the negative class to have a better overall representation of what a normal distribution would look like for this type of problem.


### Lung Cancer Detection
#### Key Technologies
- Python
- Pandas
- Numpy
- SK Learn
- Jupyter Notebooks
- Keras
- TensorFlow
- OpenCV
#### Description
Again, I had a great dataset for this project, so it seemed easier than any of the other projects. Even though this was my final project, after all the practice I gained with my previous coursework, this was a breeze. I was also becming much more comfortable using AI to generate boilerplate graphing code for me, so I didn't spend as much time researching how to use matplotlib on stack overflow.

From the beginning I used tensorFlow and Keras to build a simple image classifier. The first iteration was actually not that bad, but even a 1% false positive rate for something like cancer is unacceptable. So we moved on to transfer learning.

I'm still not sure what the difference between fine-tuning and tranfer lerarning are functionally with large models. I know it has a little to do with whether or not you replace the last layer of a model or just add a final layer at the end, but in the end it all feels the same. I fit models to Mobile Net and DenseNet and got much better perforamnce. I learned that I will not be building models myself anytime soon, but that I can be plenty dangerous fine-tuning open-source models myself.