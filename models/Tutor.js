/* models/Course.js */

const mongoose = require('mongoose');

//define the schema
const tutorSchema = new mongoose.Schema({
    name: {type: String, required: true},
    primSubj: {type: String, required: true},
    secSubj: {type: String, required: false}, 
    email: {type: String, required: false},
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    observations: { type: [String], default: [] }
});

//create model based on schema
const Tutor = mongoose.model('Tutor', tutorSchema, 'Tutors');

module.exports = Tutor;