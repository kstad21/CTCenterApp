/* routers/courses.js */

const express = require('express');
const Course = require('../models/Course');
const router = express.Router();

// get all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve courses" });
    }
});

// find course(s) by name
router.get('/find', async (req, res) => {
    const { name } = req.query;
    try {
        const courses = await Course.find({ name: new RegExp(`^${name}$`, 'i') });
        if (courses.length > 0) {
            res.json(courses);
        } else {
            res.status(404).json({ error: "No courses found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve course(s)" });
    }
});

// add a course
router.post('/addcourse', async (req, res) => {
    try {
        const { name, subject, code } = req.body;

        const existingCourse = await Course.findOne( {name: new RegExp(`^${name}$`, 'i') });
        if (existingCourse) {
            return res.status(400).json({ success: false, message: `Course named ${name} already exists. Will not add.`});
        }

        const newCourse = new Course({
            name: req.body.name,
            subject: req.body.subject,
            code: req.body.code
        });
        const savedCourse = await newCourse.save();
        return res.status(201).json({ message: "Course added successfully", course: savedCourse });
    } catch (error) {
        console.error("Error in add course route:", error);
        res.status(500).json({ error: "Failed to add course" });
    }
});

// remove a course
router.delete('/remcourse', async (req, res) => {
    const { name } = req.body;
    try {
        const result = await Course.deleteOne( { name: new RegExp(`^${name}$`, "i") });
        if (result.deletedCount > 0) {
            res.status(200).json({ message: `Course named ${name} was successfully deleted!`});
        } else {
            res.status(404).json({ error: `No course found with the name ${name}.`});
        }
    } catch (error) {
        console.error("Error in remove course route:", error);
        res.status(500).json({ error: "Failed to remove course" });
    }
})

module.exports = router;

