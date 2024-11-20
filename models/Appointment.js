/* models/Appointment.js */

const mongoose = require('mongoose');

//define the schema
const appointmentSchema = new mongoose.Schema({
    subject: {type: String, required: true},
    startTime: {type: String, required: true},
    endTime: {type: String, required:true},
    tutor: {type: String, required:true}, 
    mode: {type: String, required:true}
});

//create model based on schema
const Appointment = mongoose.model('Appointment', appointmentSchema, 'Appointments');

module.exports = Appointment;