/* routers/appointments.js */

const express = require('express');
const Appointment = require('../models/Appointment');
const router = express.Router();

// get all appointments
router.get('/', async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve appointments" });
    }
});

module.exports = router;

