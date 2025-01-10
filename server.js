/* server.js */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const tutorRoutes = require('./routers/tutors');
const courseRoutes = require('./routers/courses');
const appointmentRoutes = require('./routers/appointments');

const app = express();
app.use(express.static('public'));
app.use(express.json());

app.use('/api/tutors', tutorRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/appointments', appointmentRoutes);

const port = 5038;
const uri = process.env.MONGODB_URI;

mongoose.connect(uri).then(() => console.log("Connected to MongoDB"))
  .catch(error => console.error("Failed to connect to MongoDB:", error));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

/*
Notes: 
- x**x make the list of tutors clickable (instead of just searching) and then JUST show that
  one tutor's info x**X
- x**x make sure overlay doesn't come up when the delete btn is clicked. x**x
- x**x MODIFY a tutor; and what if i try to add a tutor that's already there? x**x same w/ courses.
- x**x make course attribute --> course model for tutor addition x**x
- x**x implement add appts page x**x
- x**x implement add appts endpoint x**x
- x**x decide how to display appts on frontpage -- change the date stuff x**x
- x**x add batches of appointments via 'add shift' functionality' x**x
- x**x validation for shift entry -- currently alert won't show up x**x
- ***BUG*** -- add tutor add form, front page display tutors 
- add a search/display option for appts -- dropdown for tutor, course, time, appt status (blocked, cancelled, scheduled, etc)
- debateably add a check that appts have a valid tutor, course, etc 
- display <today's> appts on the front page, add appt, search appt, appt schema, appt endpoint
- ^ in this vein, make sure that tutors can have arrays of the appt schemas? and the course 
  ones too maybe? 
- do i keep track of students or is that too sensitive (like there's hr stuff)? could i just
  keep track of id's or smth? bc when u make an appt we wanna be able to mark/id a student down
*/