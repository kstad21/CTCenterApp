/* routers/appointments.js */

const express = require('express');
const Appointment = require('../models/Appointment');
const router = express.Router();

// get all appointments
router.get('/', async (req, res) => {
    console.log("inside '/' endpoint ** ");
    try {
        const appointments = await Appointment.find();
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve appointments" });
    }
});

// add an appt
router.post('/add', async (req, res) => {
    console.log("INSIDE ADD ENDPOINT");

    const formObj = req.body;
    console.log(req.body)

    try {
        console.log("inside try inside addappointments");
        const { tutor, subject, date, startTime, endTime, mode, scholarAthlete, capacity } = req.body;

        const existingAppt = await Appointment.findOne( {tutor: new RegExp(`^${tutor}$`, 'i'), date: date, startTime: startTime });
        if (existingAppt) {
            console.log("Appointment already exists, returning false success ");
            return res.status(400).json({ success: false, message: `Appt already exists.`});
        }

        console.log("Creating new appointment.");
        const newAppt = new Appointment({
            tutor: tutor, 
            subject: subject,
            date: date,
            startTime: startTime, 
            endTime: endTime,
            mode: mode,
            scholarAthlete: scholarAthlete,
            capacity: capacity
        });

        const savedAppt = await newAppt.save();
        return res.status(201).json({ success: true, message: "Appointment added successfully!" });
    } catch (error) {
        console.error("Error in add appt route:", error);
        res.status(500).json({ error: "Failed to add appt" });
    }   
});

// remove an appt
router.delete('/remove', async (req, res) => {
    const { id, tutor } = req.body;
    try {
        const result = await Appointment.deleteOne( {_id: id});
        if (result.deletedCount > 0) {
            res.status(200).json({ message: `Appointment for ${ tutor } successfully deleted.`});
        } else {
            res.status(404).json({ error: 'no tutor found!'});
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to remove appointment" });
    }
});

module.exports = router;

