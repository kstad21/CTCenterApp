require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Tutor = require('./models/Tutor');

const app = express();
app.use(express.static('public'));
const port = 5038;

const uri = process.env.MONGODB_URI;

mongoose.connect(uri).then(() => console.log("Connected to MongoDB"))
  .catch(error => console.error("Failed to connect to MongoDB:", error));

//API endpoint to get all tutors
app.get('/api/tutors', async (req, res) => {
    try {
        const tutors = await Tutor.find(); //fetch all docs in Tutor collection
        res.json(tutors);
    } catch (error) {
        res.status(500).json({error: "Failed to retrieve tutors"});
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})