/* models/Appointment.js */

const mongoose = require('mongoose');

//define the schema
const appointmentSchema = new mongoose.Schema({
    subject: {type: String, required: true},
    date: {type: String, required: true},
    startTime: {type: Date, required: true},
    endTime: {type: Date, required:true},
    tutor: {type: String, required:true}, 
    mode: {type: String, required:true}
});

//create model based on schema
const Appointment = mongoose.model('Appointment', appointmentSchema, 'Appointments');

module.exports = Appointment;