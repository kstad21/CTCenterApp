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
        const newCourse = new Course({
            name: req.body.name,
            subject: req.body.subject,
            code: req.body.code
        });
        const savedCourse = await newCourse.save();
        res.json({ success: true });
    } catch (error) {
        console.error("Error in add course route:", error);
        res.status(500).json({ error: "Failed to add course" });
    }
});

module.exports = router;

