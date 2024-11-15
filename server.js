/* server.js */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const tutorRoutes = require('./routers/tutors');
const courseRoutes = require('./routers/courses');

const app = express();
app.use(express.static('public'));
app.use(express.json());

app.use('/api/tutors', tutorRoutes);
app.use('/api/courses', courseRoutes);

const port = 5038;
const uri = process.env.MONGODB_URI;

mongoose.connect(uri).then(() => console.log("Connected to MongoDB"))
  .catch(error => console.error("Failed to connect to MongoDB:", error));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

/*
Notes: 
- make the list of tutors clickable (instead of just searching) and then JUST show that
  one tutor's info 
- x**x MODIFY a tutor; and what if i try to add a tutor that's already there? x**x same w/ courses.
- display <today's> appts on the front page, add appt, search appt, appt schema, appt endpoint
- ^ in this vein, make sure that tutors can have arrays of the appt schemas? and the course 
  ones too maybe? 
- do i keep track of students or is that too sensitive (like there's hr stuff)? could i just
  keep track of id's or smth? bc when u make an appt we wanna be able to mark/id a student down
*/