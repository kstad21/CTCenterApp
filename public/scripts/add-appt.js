/* public/scripts/add-appt.js */

document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('add-appt-form-container');
    formContainer.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = e.target;
        const forms = formContainer.children;
        const formData = new FormData(form);

        const submitter = e.submitter;
        const buttonId = submitter?.id;

        const formObj = {};
        formData.forEach((value, key) => {
            formObj[key] = value;
        });

        const errors = validateForm(formObj);
        if (errors.length > 0) {
            alert("Please correct the following errors: \n" + errors.join("\n"));
            return;
        }

        if (buttonId === "add-appt") {
            try {
                const response = await fetch("/api/appointments/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formObj)
                });
    
                if (response.ok) {
                    alert("Appointment added/updated successfully!");
    
                    if (forms.length > 1) {
                        formContainer.removeChild(form);
                    } else {
                        form.reset();
                    }
                } else {
                    alert("Failed to add/update appointment.");
                }
            } catch (error) {
                console.error("Error in appt add", error);
                alert("An error occured while adding/updating the appointment.");
            }
        } else if (buttonId === "add-shift") {
            const appointmentInfo = [];
            let duration = calcDurationNum(formObj.startTime, formObj.endTime);
            let lastStart = formObj.startTime;

            // push the constant info
            appointmentInfo.push(formObj.tutor, formObj.subject, formObj.date, formObj.mode, formObj.scholarAthlete, formObj.startTime);

            console.log("DURATION: " + duration);

            // get the start:end
            while (duration > 0.5) {
                let currDur;
                if (duration >= 1.25 || duration == 0.75) {
                    currDur = 0.75;
                } else {
                    currDur = 0.5;
                }

                const currStart = getNextStart(lastStart, currDur);
                console.log("Pushing: " + currStart);
                appointmentInfo.push(currStart);

                duration = duration - currDur;
                console.log("current duration: " + currDur + ". duration left: " + duration);
                lastStart = currStart;
            }
            // tutor, subject, date, mode, scholar athlete, start, start, start, ... 
            if (!appointmentInfo.includes(formObj.endTime)) {
                appointmentInfo.push(formObj.endTime);
            }

            const appointments = [];

            for (let i = 5; i < appointmentInfo.length - 1; i++) {
                const infoObj = {
                    tutor: appointmentInfo[0],
                    subject: appointmentInfo[1],
                    date: appointmentInfo[2],
                    mode: appointmentInfo[3],
                    scholarAthlete: appointmentInfo[4],
                    startTime: appointmentInfo[i],
                    endTime: appointmentInfo[i + 1]
                };

                console.log("supposed to be validating infoObj: " + infoObj);
        
                const errors = validateForm(infoObj);
                if (errors.length > 0) {
                    console.log("there is an error");
                    alert("Please correct the following errors: \n" + errors.join("\n"));
                    return;
                }

                appointments.push(infoObj);
            }

            console.log("final appointmentInfo: " + appointmentInfo);
            addAppointments(appointments);
        }
    });
});

async function validateForm(formObj) {
    const errors = [];

    //if (tutors not in our list)
    //if subject not in our list
    //if date is invalid
    const dateParts = formObj.date.split("/");
    if (dateParts.length != 3) {
        errors.push("Date must be in the form MM/DD/YYYY");
    }
    if (isNaN(parseInt(dateParts[0]))) {
        errors.push("Please put month in number format (ex: November should be 11");
    } else {
        if (parseInt(dateParts[0] > 12)) {
            errors.push("There are no months > 12.")
        } else if (parseInt(dateParts[0] <= 0)) {
            errors.push("There are no months <= 0.");
        }
    }
    if (isNaN(parseInt(dateParts[1]))) {
        errors.push("Please put day in number format (ex: 28 or 03");
    } else {
        if (parseInt(dateParts[1] > 31)) {
            errors.push("There are no days > 31.")
        } else if (parseInt(dateParts[1] <= 0)) {
            errors.push("There are no days <= 0.");
        }
    }
    if (isNaN(parseInt(dateParts[2]))) {
        errors.push("Please put year in number format (ex: 2024 or 2003");
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

    return errors;
}

function calcDurationNum(time1, time2) {
    const hour1 = time1.split(":")[0];
    const minute1 = time1.split(":")[1];

    const hourNum1 = parseFloat(hour1);
    const minNum1 = parseFloat(minute1 / 60);

    const hour2 = time2.split(":")[0];
    const minute2 = time2.split(":")[1];

    const hourNum2 = parseFloat(hour2);
    const minNum2 = parseFloat(minute2 / 60);

    return ((hourNum2 + minNum2) - (hourNum1 + minNum1));
}

function getNextStart(lastStart, duration) {
    // Split lastStart into hours and minutes
    const [hour, minute] = lastStart.split(":").map(Number);

    // Calculate total minutes
    const totalMinutes = hour * 60 + minute + duration * 60;

    // Convert total minutes back to hours and minutes
    const newHour = Math.floor(totalMinutes / 60) % 24; // % 24 to handle overflow
    const newMinute = Math.round(totalMinutes % 60);

    // Format the result as HH:MM
    const formattedHour = String(newHour).padStart(2, "0");
    const formattedMinute = String(newMinute).padStart(2, "0");

    console.log("From getNextStart, formattedHour: " + formattedHour + ", formattedMinute: " + formattedMinute);
    return `${formattedHour}:${formattedMinute}`;
}

async function addAppointments(appointments) {
    const formContainer = document.getElementById('add-appt-form-container');
    const form = formContainer.querySelector('form');
    const forms = formContainer.children;

    for (let j = 0; j < appointments.length; j++) {
        let infoObj = appointments[j];
        try {
            const response = await fetch("/api/appointments/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(infoObj)
            });
    
            if (response.ok) {
                alert("Appointment added/updated successfully!");
    
                if (forms.length > 1) {
                    formContainer.removeChild(form);
                } else {
                    form.reset();
                }
            } else {
                alert("Failed to add/update appointment.");
            }
        } catch (error) {
            console.error("Error in appt add", error);
            alert("An error occurred while adding/updating the appointment.");
        }
    }
};