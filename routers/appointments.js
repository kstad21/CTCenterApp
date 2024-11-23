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

