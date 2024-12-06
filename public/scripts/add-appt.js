/* public/scripts/add-appt.js */

document.addEventListener('DOMContentLoaded', (e) => {
    e.preventDefault();
    const formContainer = document.getElementById('add-appt-form-container');
    console.log("HERE?");
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

        console.log("formObj: ", formObj);

        console.log("right before const errors = validate form");

        /*const errors = validateForm(formObj);
        if (errors.length > 0) {
            alert("Please correct the following errors: \n" + errors.join("\n"));
            return;
        }*/

        if (buttonId === "add-appt") {
            console.log("HERE****");
            try {
                await fetch("/api/appointments/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formObj)
                })
                .then(response => response.json())
                .then(responseData => {
                    if (responseData.success) {
                        alert("Appointment added/updated successfully!");
        
                        if (forms.length > 1) {
                            formContainer.removeChild(form);
                        } else {
                            form.reset();
                        }
                    } else {
                        const errors = responseData.errors;
                        if (Array.isArray(errors)) {
                            alert("Please correct:\n" + errors.join('\n'));
                        }
                    }
                })
    
                
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

                appointments.push(infoObj);
            }

            console.log("final appointmentInfo: " + appointmentInfo);
            addAppointments(appointments);
        }
    });
});

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

    console.log("INSIDE ADDAPPOINTMENTS");

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

            const responseData = await response.json();

            if (responseData.success) {
                alert("Appointment added/updated successfully!");
        
                if (forms.length > 1) {
                    formContainer.removeChild(form);
                } else {
                    form.reset();
                }
            } else if (responseData.success === false) {
                const errors = responseData.errors;
                if (Array.isArray(errors)) {
                    alert("Please correct: \n" + errors.join('\n'));
                } else {
                    alert("An error occurred: Unknown error");
                }
                // Stop processing further appointments
                return;
            }
        } catch (error) {
            console.error("Error in appt add", error);
            alert("An error occurred while adding/updating the appointment.");
            // Stop processing further appointments
            return;
        }
    }
}