# Research Challenge 1: FCQ

## Overall Plan
* Answer warm up questions by implementing specialized solutions
* Generalize solutions into APIs
* Expand the example questions
* Build predictive models
* Demo to interested parties
* Next: Generalize to another dataset

##Data
[Download link](http://www.colorado.edu/pba/course/gradesintro.htm)

#Warm up Questions

* Which course(s) failed the most number of students?
* Which department had the most significant improvement in instructor ratings in year 2013 (compared to 2012)?
* Which year saw the largest drop (from the previous year) in total students taught among all the CS courses? 
* Which department had seen the biggest reduction in the number of courses taught since 2010 (i.e., the majors are shrinking)?
* How does the university’s average GPA change over the years, rise, steady, or fall?
* Who (instructors) had the largest change in instructor rating between any two years?
* Who (instructors) had taught the most number of courses?
* Who (instructors) had taught the most number of students?
* Who (instructors), with at least 100 students taught, are most generous in giving out good grades (most students receiving A’s)?
* Who (instructors) had the highest instructor ratings when teaching a large couse (n>100) for the first time?
* Who (instructors) had shown the most consistent pattern in making a course (previously taught by someone else) better in terms of course rating?
* Which department is more aggressive in failing students?
* Which department relies on lecturers the most (highest ratio of students taught across instructor types)?
* Is teaching generally worse or better in Spring compared to Fall semesters, in terms of instructor rating and in terms of course rating?
* What is the relationship between class size and course rating, positive or negative correlation? Is this correlation becoming stronger or weaker over the years?
* Are there more or fewer “grad part-time instructors” over the years?
* Does the average teaching load (# of students taught) for a typical lecturer increase or decrease over the years?
* Which course saw the largest increase in workload in any given year?
* What is the average change in instructor rating pre and post tenure (assistant professor → associate professor)?
* What is the average change in course size  pre and post tenure?

Ian contributes 5 more
Michael contributes 5 more

* Which classes have the largest number of students withdraw throughout the semester?
* Which classes show strong signs of “weed out” behaviour? ((TotalDropped+TotalIncomplete+Total C- or below)/total enrolled) 
* Which instructors with class size n>30 have the best rating across all classes taught?
* Which classes with a size n>30 were most impacted by the instructor? (diff between InsturctorAvg and CourseAvg)
* Which classes had the highest loyalty (low drop and withdrawal rates). 


##Specialized Solutions

### Goal:
* Establish our baseline solutions to these “diff” problems.
* Purposely limit ourselves to basic technologies to understand their capabilities and limitations

### Requirements:
* Solutions should be implemented in Javascript (let’s get really good at it).
* Use any Node.js library you like.
* If a database is used, only MongoDB is allowed (don’t get too fancy here yet).
* Output should be in JSON.

### Generalization into APIs
* Identify commonalities across solutions to extract reusable logics and utility components
* Design reusable, decomposable, and expressive APIs
* Expansion of Questions
* Demonstrate a much richer set of questions that can be answered by the APIs

### Predictive Models
* Come up with interesting predictive questions in the form of “how does X predict changes in Y?” (e.g., how does this year’s class size predict a department’s increase or decrease in the number of lecturers employed?)

Mike Skirpan will come up with more questions here 

