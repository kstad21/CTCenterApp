/* routers/tutors.js */

const express = require('express');
const Tutor = require('../models/Tutor');
const router = express.Router();

//api endpoint to get all tutors
router.get('/', async (req, res) => {
    try {
        const tutors = await Tutor.find();
        res.json(tutors);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve tutors" });
    }
});

// find tutor(s) by name
router.get('/find', async (req, res) => {
    const { name } = req.query;
    try {
        const tutors = await Tutor.find({ name: new RegExp(`^${name}$`, 'i') });
        if (tutors.length > 0) {
            res.json(tutors);
        } else {
            res.status(404).json({ error: "No tutors found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve tutor(s)" });
    }
});

// add a tutor
router.post('/addtutor', async (req, res) => {
    try {
        const { name, primSubj, secSubj, email, courses } = req.body;

        const existingTutor = await Tutor.findOne({ name: new RegExp(`^${name}$`, 'i') });

        if (existingTutor) {
            // update existing tutor
            existingTutor.primSubj = primSubj;
            existingTutor.secSubj = secSubj;
            existingTutor.email = email;
            existingTutor.courses = courses || [];
            const updatedTutor = await existingTutor.save();
            return res.status(200).json({ message: "Tutor updated successfully", tutor: updatedTutor });
        } else {
            const newTutor = new Tutor({
                name,
                primSubj,
                secSubj,
                email,
                courses: courses || []
            });
            const savedTutor = await newTutor.save();
            return res.status(201).json({ message: "Tutor added successfully", tutor: savedTutor });
        }
    } catch (error) {
        console.error("Error in add tutor route:", error);
        res.status(500).json({ error: "Failed to add tutor" });
    }
});

// remove a tutor
router.delete('/remtutor', async (req, res) => {
    const { name } = req.body;
    try {
        const result = await Tutor.deleteOne({ name: new RegExp(`^${name}$`, "i") });
        if (result.deletedCount > 0) {
            res.status(200).json({ message: `Tutor named ${name} has been removed.` });
        } else {
            res.status(404).json({ error: `No tutor found with the name ${name}.` });
        }
    } catch (error) {
        console.error("Error in remove tutor route:", error);
        res.status(500).json({ error: "Failed to remove tutor" });
    }
});

router.put('/update', async (req, res) => {
    const updatedTutor = req.body;
    console.log("inside api, ", req.body);

    try {
        await Tutor.updateOne({_id: updatedTutor._id}, updatedTutor);
        res.status(200).json({ message: 'Tutor updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update tutor' });
    }
}); 

module.exports = router;