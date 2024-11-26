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

            console.log("final appointmentInfo: " + appointmentInfo);
            addAppointments(appointmentInfo);
        }
    });
});

function validateForm(formObj) {
    const errors = [];

    //if (tutors not in our list)
    //if subject not in our list
    //if date is valid
    //if time is in operating hours
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

async function addAppointments(appointmentInfo, e) {
    const formContainer = document.getElementById('add-appt-form-container');
    const form = formContainer.querySelector('form');
    const forms = formContainer.children;

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