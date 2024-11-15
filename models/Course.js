/* models/Course.js */

const mongoose = require('mongoose');

//define the schema
const courseSchema = new mongoose.Schema({
    name: {type: String, required: true},
    subject: {type: String, required: true},
    code: {type: String, required:true}
});

//create model based on schema
const Course = mongoose.model('Course', courseSchema, 'Courses');

module.exports = Course;