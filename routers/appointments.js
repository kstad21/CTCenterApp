/* routers/appointments.js */

const express = require('express');
const Appointment = require('../models/Appointment');
const router = express.Router();

// get all appointments
router.get('/', async (req, res) => {
    console.log("inside '/' endpoint");
    try {
        const appointments = await Appointment.find();
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve appointments" });
    }
});

// add an appt
router.post('/add', async (req, res) => {
    try {
        const { tutor, subject, date, startTime, endTime, mode, scholarAthlete } = req.body;

        const startTimeDate = toDate(date, startTime);
        const endTimeDate = toDate(date, endTime);

        const existingAppt = await Appointment.findOne( {tutor: new RegExp(`^${tutor}$`, 'i'), date: date, startTime: startTimeDate });
        if (existingAppt) {
            return res.status(400).json({ success: false, message: `Appt already exists.`});
        }

        console.log("Creating new appointment.");
        const newAppt = new Appointment({
            tutor: tutor, 
            subject: subject,
            date: date,
            startTime: startTimeDate, 
            endTime: endTimeDate,
            mode: mode,
            scholarAthlete: scholarAthlete
        });

        const savedAppt = await newAppt.save();
        return res.status(201).json({ message: "Appointment added successfully!" });
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

function toDate(date, time) {
    try {
        // const date = new Date(Date.UTC(2024, 10, 26, 13, 0, 0));
        console.log("inside toDate, date: " + date + ", time: " + time);
        const dateParts = date.split("/");
        
        if (dateParts.length !== 3) {
            throw new Error(`Invalid date format: ${date}`);
        }

        const [month, day, year] = dateParts.map((part) => parseInt(part, 10));
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            throw new Error(`Invalid date parts: year=${year}, month=${month}, day=${day}`);
        }

        const timeParts = time.split(":");
        if (timeParts.length != 2) {
            throw new Error(`Invalid time format: ${time}`);
        }

        const [hour, minute] = timeParts.map((part) => parseInt(part, 10));
        if (isNaN(hour) || isNaN(minute)) {
            throw new Error(`Invalid time parts: hour=${hour}, minute=${minute}`);
        }

        const dateObj = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
        if (isNaN(dateObj.getTime())) {
            throw new Error(`Invalid date object: ${dateObj}`);
        }

        return dateObj;
    } catch (error) {
        console.error("Error in toDate:", error.message);
        throw new Error(`Failed to parse date/time. ${error.message}`);
    }
}

module.exports = router;

