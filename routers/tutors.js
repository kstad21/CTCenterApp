/* routers/tutors.js */

const express = require('express');
const Tutor = require('../models/Tutor');
const router = express.Router();
const Course = require('../models/Course');

//api endpoint to get all tutors
router.get('/', async (req, res) => {
    try {
        const tutors = await Tutor.find().populate('courses');
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

        console.log("courses received: " + courses);
        let courseInput = courses.split(", ").map((name => name.trim()));

        const courseIds = [];

        if (Array.isArray(courseInput)) {
            console.log("inside Array.isArray (43)");
            for (const courseName of courseInput) {
                console.log("current courseName: " + courseName);
                console.log("inside for loop for courses");
                let course = await Course.findOne({ name: new RegExp(`^${courseName}$`, 'i') });

                if (!course) {
                    console.log("inside tutors.js, inside !course, should be creating one.");
                    //create course if it doesnt exist
                    course = new Course({ name: courseName, subject: courseName.split(" ")[0], code: courseName.split(" ")[1] });
                    await course.save();
                }

                courseIds.push(course._id);
            }
        }

        const existingTutor = await Tutor.findOne({ name: new RegExp(`^${name}$`, 'i') });

        if (existingTutor) {
            // update existing tutor
            existingTutor.primSubj = primSubj;
            existingTutor.secSubj = secSubj;
            existingTutor.email = email;
            existingTutor.courses = courseIds;
            const updatedTutor = await existingTutor.save();
            return res.status(200).json({ message: "Tutor updated successfully", tutor: updatedTutor });
        } else {
            const newTutor = new Tutor({
                name,
                primSubj,
                secSubj,
                email,
                courses: courseIds
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
    const { _id, name, primSubj, secSubj, email, courses, observations } = req.body;

    console.log("inside update tutor, req.body:, ", req.body);

    try {
        console.log("inside try");
        console.log("courses: ", courses);
        
        let courseNamesArray = [];

        if (typeof courses === 'string') {
            courseNamesArray = courses
                .split(',')
                .map(name => name.trim())
                .filter(name => name !== "");
        } else {
            courseNamesArray = courses.map(course => course.name);
        }
        
        console.log('past coursenamesarray');
        
        const courseIds = [];

        console.log('right before for loop');
        for (const courseName of courseNamesArray) {
            console.log('cur coursename: ', courseName);
            let course = await Course.findOne( {name: courseName });

            if (!course) {
                console.log('creating new course');
                course = new Course({ name: courseName, subject: courseName.split(' ')[0], code: courseName.split(' ')[1] });
                console.log('trying to save course');

                try {
                    await course.save();
                    console.log('saved course');
                } catch (error) {
                    confirm("There was an error adding course with name: " + course.name);
                }  
            }

            courseIds.push(course._id);
        }

        await Tutor.updateOne(
            { _id }, // Filter by tutor ID
            {
                $set: {
                    name: name,
                    primSubj: primSubj,
                    secSubj: secSubj,
                    email: email,
                    courses: courseIds,
                    observations: observations
                }
            }
        );

        res.status(200).json({ message: 'Tutor updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update tutor' });
    }
}); 

module.exports = router;