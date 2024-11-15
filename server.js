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