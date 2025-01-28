document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('add-appt-form-container');
    const repeatDaysContainer = document.getElementById('repeat-days-container');

    // attach event listeners for +/- form buttons
    const addFormButton = document.getElementById('add-appt-form-container-btn');
    const removeFormButton = document.getElementById('sub-appt-form-container-btn');

    // add new form
    addFormButton.addEventListener('click', () => {
        console.log("add form button clicked");
        const newForm = formContainer.children[0].cloneNode(true);
        formContainer.appendChild(newForm);
    });

    // remove last form if it exists
    removeFormButton.addEventListener('click', () => {
        console.log("delete form button clicked");
        if (formContainer.children.length > 1) {
            formContainer.removeChild(formContainer.lastChild);
        }
    });

    // add listener to toggle the day buttons 
    repeatDaysContainer.querySelectorAll('.day-btn').forEach((button) => {
        button.addEventListener('click', () => {
            button.classList.toggle('selected');
        })
    });

    // handle submissions
    formContainer.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        var isShift;

        // toggle isShift
        const submitter = e.submitter;
        if (submitter.id === 'add-appt') {
            console.log("appt submit clicked");
            isShift = false;
        } else {
            console.log("shift submit clicked");
            isShift = true;
        }

        // validate form info 
        const validatedData = validateApptForm(form);
        for (const key in validatedData) {
            if (validatedData.hasOwnProperty(key)) {
                const element = validatedData[key];
                console.log(typeof element);
        
                if (typeof element === "string" && element.includes("!")) {
                    alert("Invalid form submission: " + element.split("!")[1] + ", please edit.");
                }
            }
        }

        // get appt info based on repeat days and validated data
        const apptInfo = getApptInfo(repeatDaysContainer, validatedData, isShift);

        console.log(apptInfo);

        // add each appt 
        var added = 0;
        for (var j = 0; j < apptInfo.length; j++) {
            var addedCorrectly = addAppointment(apptInfo[j]);
            if (addedCorrectly) {
                added++;
            }
        }
        alert(`${added} appointments were successfully added!`);
    });
});

/**
 * @param {Object} appointment 
 */
async function addAppointment(appointment) {
    try {
        const response = await fetch("/api/appointments/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(appointment)
        });
        //console.log('added appt, response: ', response.json(), response.status);
        const responseData = await response.json();
        if (responseData.success) {
            return true;
        }
    } catch (error) {
        console.error("Error in appt add", error);
        alert("An error occured while adding/updating this appointment.");
        return false;
    }
}

/**
 * @param {HTMLElement} form 
 * @returns {Array} - correct info 
 * [tutor, subject, date, mode, scholarAthlete, startTime, endTime]
 */
function validateApptForm(form) {
    const validatedData = {};
    const formData = new FormData(form);

    // validate tutor. Could check if it is an actual name in our database.
    const givenTutor = formData.get('tutor');
    validatedData.tutor = givenTutor;
    console.log("Validated tutor: ", validatedData.tutor)

    // validate subject. Check if subject is in our list of offered
    const validSubjects = ['CHEM', 'CHEM(O)', 'CHEM(GEN)', 'MATH', 'PHYSICS', 'BIO', 'ECON'];
    var givenSubject = formData.get('subject').toUpperCase();
    if (!validSubjects.includes(givenSubject)) {
        if (givenSubject.includes("CHEM")) {
            if (givenSubject.includes('O')) {
                givenSubject = "CHEM(O)";
            } else if (givenSubject.includes('G')) {
                givenSubject = "CHEM(GEN)";
            } else {
                givenSubject.includes("CHEM");
            }
        } else if (givenSubject.includes("MA")) {
            givenSubject = "MATH";
        } else if (givenSubject.includes("PH")) {
            givenSubject = "PHYSICS";
        } else if (givenSubject.includes("B")) {
            givenSubject = "BIO";
        } else if (givenSubject.includes("EC")) {
            givenSubject = "ECON";
        } else {
            givenSubject = "!subject";
        }
    }
    validatedData.subject = givenSubject;
    console.log("Validated subject: ", validatedData.subject)
    
    // validate date.
    var givenDate = formData.get('start-date');
    console.log('trying to validate date, ' + givenDate);
    var date;
    try {
        date = toDate(givenDate);
        validatedData.startDate = date;
    } catch (error) {
        validatedData.startDate = "!start-date";
    }
    console.log("Validated startDate: ", validatedData.startDate)

    var givenEndDate = formData.get('end-date');
    console.log('trying to validate date, ' + givenEndDate);
    var date;
    try {
        date = toDate(givenEndDate);
        validatedData.endDate = date;
    } catch (error) {
        validatedData.endDate = "!end-date";
    }
    console.log('validated endDate ', validatedData.endDate)

    // validate mode
    var givenMode = formData.get('mode').toUpperCase();
    if (givenMode.includes("I")) {
        givenMode = "IP";
    } else if (givenMode.includes("O")) {
        givenMode = "OL"
    } else {
        givenMode = "!mode";
    }
    validatedData.mode = givenMode;
    console.log('validated mode: ', validatedData.mode)

    // validate scholar athlete
    var givenScholarAthlete = formData.get('scholar-athlete').toUpperCase();
    if (givenScholarAthlete.includes("Y")) {
        givenScholarAthlete = "Y";
    } else if (givenScholarAthlete.includes("N")) {
        givenScholarAthlete = "N";
    } else {
        givenScholarAthlete = "!scholar-athlete"
    }
    validatedData.scholarAthlete = givenScholarAthlete;
    console.log("Validated SA: ", validatedData.scholarAthlete)

    // validate start time
    var givenStartTime = formData.get('start-time');
    if (validateTime(givenStartTime)) {
        validatedData.startTime = givenStartTime;
    } else {
        validatedData.startTime = "!start-time";
    }
    console.log("Validated startTime: ", validatedData.startTime)
    
    // validate end time
    var givenEndTime = formData.get('end-time');
    if (validateTime(givenEndTime)) {
        if (givenStartTime == "!start-time" || parseInt(givenEndTime.split(":")[0]) < parseInt(givenStartTime.split(":")[0])) {
            validatedData.endTime = "!end-time";
        }
        validatedData.endTime = givenEndTime;
    } else {
        validatedData.endTime = "!end-time";
    }
    console.log("Validated endTime: ", validatedData.endTime)


    console.log('at end of validateData: ', validatedData);
    return validatedData;
}

/**
 * @param {HTMLElement} repeatDaysContainer - holds day buttons.
 * @returns {Array} - list of selected days.
 */
function getDays(repeatDaysContainer) {
    console.log("inside getDays");
    const selectedDays = [];
    repeatDaysContainer.querySelectorAll('.day-btn').forEach((button) => {
        console.log(`Button text: ${button.textContent}`);
        console.log(`Button data-day: ${button.dataset.day}`);
        if (button.classList.contains('selected')) {
            console.log("selected");
            selectedDays.push(button.dataset.day);
        }
    });
    console.log(selectedDays);
    return selectedDays;
}

/**
 * Given days to repeat, return a list of dates that appointments
 * should be created for.
 * @param {String Array} selectedDays 
 * @param {String} startDate 
 * @param {String} endDate 
 */
function getRepeatDates(selectedDays, startDate, endDate) {
    const dates = [];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const selectedDaysNumber = [];
    for (var i = 0; i < selectedDays.length; i++) {
        console.log(selectedDays[i], days.indexOf(selectedDays[i]));
        selectedDaysNumber.push(days.indexOf(selectedDays[i]));
    }

    var start = startDate;
    var end = endDate;
    try {
        start = toDate(startDate);
        end = toDate(endDate);
    } catch (error) {
        console.error("Error in converting dates in getRepeatDates ", error);
    }

    var currDate = start;
    while (currDate <= end) {
        console.log('curr date: ' + currDate.toString());
        // getDay returns 0 for Sunday 
        var dayOfWeek = currDate.getDay();

        if (selectedDaysNumber.indexOf(dayOfWeek) != -1) {
            dates.push(new Date(currDate));
        }

        currDate.setDate(currDate.getDate() + 1);
    }

    return dates;
}

/**
 * @param {Dictionary} form - submitted form
 * @returns {Object} - object containing appt data
 */
function getApptInfo(repeatDaysContainer, validatedData, isShift) {
    const apptInfo = [];
    var shiftStarts = [];

    const tutor = validatedData.tutor;
    const subject = validatedData.subject;
    const mode = validatedData.mode;
    const scholarAthlete = validatedData.scholarAthlete;
    
    const selectedDays = getDays(repeatDaysContainer);

    const dateForAppts = getRepeatDates(selectedDays, validatedData.startDate, validatedData.endDate);
    
    const startTime = validatedData.startTime;
    const endTime = validatedData.endTime;

    // if this is a shift, we need to first get a list of all the appt info for the shifts
    if (isShift) {
        console.log("This is a shift!");
        shiftStarts = getStartsForShift(startTime, endTime);
    }

    // outer loop: for each day
    for (var i = 0; i < dateForAppts.length; i++) {
        var currDate = dateForAppts[i];
        if (shiftStarts.length > 0) {
            for (var j = 0; j < shiftStarts.length - 1; j++) {
                var currStart = shiftStarts[j];
                var end;
                if (j + 1 == shiftStarts.length) {
                    end = endTime;
                } else {
                    end = shiftStarts[j+1];
                }
    
                var currApptObj = {
                    tutor: tutor,
                    subject: subject,
                    date: currDate,
                    mode: mode,
                    scholarAthlete: scholarAthlete,
                    startTime: currStart,
                    endTime: end
                };
                apptInfo.push(currApptObj);
            }
        } else {
            var currApptObj = {
                tutor: tutor,
                subject: subject,
                date: currDate,
                mode: mode,
                scholarAthlete: scholarAthlete,
                startTime: startTime,
                endTime: endTime
            };
            apptInfo.push(currApptObj);
        }
        
    }

    return apptInfo;
}

/**
 * @param {String} startTime 
 * @param {String} endTime 
 * @returns {String Array} - start times + end time at the end
 */
function getStartsForShift(startTime, endTime) {
    console.log('inside get starts for shift');
    const startTimes = [];
    startTimes.push(startTime);

    var duration = calcNumericalDuration(startTime, endTime);
    console.log('starting duration: ', duration);
    var lastStart = startTime;
    
    while (duration > 0.5) {
        var currDur;
        if (duration >= 1.25 || duration == 0.75) {
            currDur = 0.75
        } else {
            currDur = 0.5;
        }

        const currStart = getNextStart(lastStart, currDur);
        console.log('curr start: ', currStart);
        startTimes.push(currStart);
        console.log('pushed: ' + currStart);

        duration -= currDur;
        console.log('duration is now: ', duration);
        lastStart = currStart;
    }

    startTimes.push(endTime);
    console.log('abt to return startTimes: ', startTimes);
    return startTimes;
}

/**
 * @param {String} dateStr 
 * @returns {Date}
 */
function toDate(dateStr) {
    console.log("inside of toDate: ", dateStr);
    const parts = dateStr.split('/');
    if (parts.length!= 3) {
        throw new Error('Invalid date format! Expected MM/DD/YYYY.');
    }

    const [month, day, year] = parts.map(part => parseInt(part, 10));

    if (isNaN(month) || isNaN(day) || isNaN(year) || month < 1 || month > 12 || day > 31 || day < 1) {
        throw new Error('Invalid date value!');
    }

    return new Date(year, month - 1, day);
}

/**
 * @param {String} time1 - start time
 * @param {String} time2 - end time
 * @returns {float} - duration
 */
function calcNumericalDuration(time1, time2) {
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

/**
 * @param {String} - start of last appt
 * @param {float} - duration
 * @returns {String} - (ex): HH:MM, military time
 */
function getNextStart(lastStart, duration) {
    const [hour, minute] = lastStart.split(":").map(Number);
    const totalMinutes = hour * 60 + minute + duration * 60;

    const newHour = Math.floor(totalMinutes/60) % 24;
    const newMinute = Math.round(totalMinutes % 60);

    const formattedHour = String(newHour).padStart(2, "0");
    const formattedMinute = String(newMinute).padStart(2, "0");

    return `${formattedHour}:${formattedMinute}`;
}

/**
 * @param {String} time 
 * @returns true or false
 */
function validateTime(time) {
    var timeParts = time.split(":");
    if (timeParts.length == 2) {
        const hourInt = parseInt(timeParts[0]);
        const minInt = parseInt(timeParts[1]);
        if (!isNaN(hourInt) && !isNaN(minInt)) {
            if (hourInt < 9 || hourInt > 21 || minInt < 0 || minInt >= 60) {
                return false;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
    return true;
}