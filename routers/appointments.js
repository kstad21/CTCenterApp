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

    const formObj = req.body; // Assuming body-parser middleware is used
    console.log(req.body)
    const errors = await validateForm(formObj);

    if (errors.length > 0) {
        // Return validation errors to the client
        return res.status(400).json({ success: false, errors });
    }

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

async function validateForm(formObj) {
    console.log("INSIDE VALIDATE FORM");
    const errors = [];

    //if (tutors not in our list)
    //if subject not in our list
    //if date is invalid
    const dateParts = formObj.date.split("/");
    if (dateParts.length != 3) {
        errors.push("Date must be in the form MM/DD/YYYY");
        console.log('inside date not being right, errors: ', errors);
    }
    if (isNaN(parseInt(dateParts[0]))) {
        errors.push("Please put month in number format (ex: November should be 11)");
    } else {
        if (parseInt(dateParts[0] > 12)) {
            errors.push("There are no months > 12.")
        } else if (parseInt(dateParts[0] <= 0)) {
            errors.push("There are no months <= 0.");
        }
    }
    if (isNaN(parseInt(dateParts[1]))) {
        errors.push("Please put day in number format (ex: 28 or 03)");
    } else {
        if (parseInt(dateParts[1] > 31)) {
            errors.push("There are no days > 31.")
        } else if (parseInt(dateParts[1] <= 0)) {
            errors.push("There are no days <= 0.");
        }
    }
    if (isNaN(parseInt(dateParts[2]))) {
        errors.push("Please put year in number format (ex: 2024 or 2003)");
    } 
    
    //if startTime is in operating hours
    const startTimeParts = formObj.startTime.split(":");
    if (startTimeParts.length != 2) {
        errors.push("Start time must be in the form HH:MM (ex: 12:45).");
    }
    if (isNaN(parseInt(startTimeParts[0]) || isNaN(parseInt(startTimeParts[1])))) {
        errors.push("Start time should be in number format, separated by a colon (ex: 12:45 or 13:30)");
    } else if (parseInt(startTimeParts[0]) > 21) {
        errors.push("No appointments past 9PM or 21:00.");
    }
    //if time is in operating hours, and is after start
    let validMode = true;
    if ((formObj.mode).toLowerCase() !== "ip" && (formObj.mode).toLowerCase() !== "ol") {
        if ((formObj.mode).toLowerCase().includes("i")) {
            formObj.mode = "IP";
        } else if ((formObj.mode).toLowerCase().includes("o")) {
            formObj.mode = "OL";
        } else {
            validMode = false;
        }
    }
    if (!validMode) {
        errors.push("Mode must be either IP or OL.");
    }

    let validScholarAthlete = true;
    if ((formObj.scholarAthlete.toLowerCase() !== "y" && formObj.scholarAthlete.toLowerCase() !== "n")) {
        if (formObj.scholarAthlete.toLowerCase() == "yes") {
            formObj.scholarAthlete = "y";
        } else if (formObj.scholarAthlete.toLowerCase() == "no") {
            formObj.scholarAthlete = "n";
        } else {
            validScholarAthlete = false;
        }
    }
    if (!validScholarAthlete) {
        errors.push("Scholar athlete must be y or n.");
    }

    console.log('about to return errors: ', errors);
    return errors;
}

module.exports = router;

