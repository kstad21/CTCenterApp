/* public/scripts/index.js */

//fetch data from api and display it 
document.addEventListener('DOMContentLoaded', () => {
    fetchTutors();
    fetchAppts();
    displayDate((new Date()).toISOString());

    //close overlay when close button is clicked
    document.querySelectorAll('.close-overlay-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const overlay = event.target.closest('.overlay');
            if (overlay) {
                overlay.style.display = 'none';
                if (overlay.id === 'tutor-overlay') {
                    fetchTutors();
                } else if (overlay.id === 'appt-overlay') {
                    fetchAppts();
                }
            }
        });
    });
});

//use tutor model to interact w/ mongodb
async function fetchTutors() {
    try {
        const response = await fetch('/api/tutors'); //fetch all tutors 
        if (!response.ok) {
            throw new Error('Failed to fetch tutors');
        }
        const tutors = await response.json(); //parse response as json
        console.log(tutors);
        displayTutors(tutors);
    } catch (error) {
        console.log("Error retrieving tutors:", error);
        document.getElementById('tutors-container').innerHTML = '<p>Error loading tutors</p>';
    }
}

async function fetchAppts() {
    try {
        const response = await fetch('/api/appointments');
        if (!response.ok) {
            throw new Error('Failed to fetch appointments');
        }
        const appointments = await response.json();
        console.log(appointments);
        displayAppointments(appointments);
    } catch (error) {
        console.log("Error retrieving tutors:", error);
        document.getElementById('appts-container').innerHTML = '<p>Error loading appointments</p>';
    }
}

function displayTutors(tutors) {
    const container = document.getElementById('tutors-container');
    container.innerHTML = '';

    if (tutors.length == 0) {
        container.innerHTML = '<p>No tutors</p>';
        return;
    }

    tutors.forEach(tutor => {
        console.log("HERE");
        //create div for each tutor
        const tutorDiv = document.createElement('div');
        tutorDiv.classList.add('tutor');

        const tutorInfo = document.createElement('span');

        console.log(tutor.courses);
        const courseNames = tutor.courses.map(course => course.name).join(', ');
        let infoText = `${tutor.name}: Primary Subject: ${tutor.primSubj} | Secondary Subject: ${tutor.secSubj} | Courses: ${courseNames}`;

        if (tutor.email.length > 0) {
            infoText += ` | Email: ${tutor.email}`;
        }
        tutorInfo.textContent = infoText;
        tutorDiv.appendChild(tutorInfo);

        //create delete button for this tutor
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.style.display = 'none'; //initially hidden

        //show when mouse hovers
        tutorDiv.addEventListener('mouseover', () => {
            deleteBtn.style.display = 'inline';
            tutorDiv.style.backgroundColor = '#f0f0f0';
        });

        tutorDiv.addEventListener('mouseout', () => {
            deleteBtn.style.display = 'none';
            tutorDiv.style.backgroundColor = '#FFFFFF';
        })

        deleteBtn.addEventListener('click', async (event) => {
            event.stopPropagation();
            const result = await removeTutor(tutor.name, tutorDiv);
        })

        tutorDiv.addEventListener('click', () => {
            console.log("Should be showing tutor overlay");
            showTutorOverlay(tutor);
        });

        tutorDiv.appendChild(deleteBtn);
        container.appendChild(tutorDiv);
    });
}

function displayAppointments(appointments) {
    const container = document.getElementById('appts-container');
    container.innerHTML = '';

    if (appointments.length == 0) {
        container.innerHTML = '<p>No appointments</p>';
        return;
    }

    appointments.forEach(appt => {
        //create div for each appt
        const appointmentDiv = document.createElement('div');
        appointmentDiv.classList.add('appointment');

        const apptInfo = document.createElement('span');
        apptInfo.textContent = `Tutor: ${appt.tutor} | Subject: ${appt.subject} | ${(parseDate(appt.startTime)).split(" (")[0]}-${((parseDate(appt.endTime)).split(" (")[0]).split(": ")[1]} | Mode: ${appt.mode}`;
        appointmentDiv.appendChild(apptInfo);

        //create delete button for this appointment
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.style.display = 'none'; //initially hidden

        //show when mouse hovers
        appointmentDiv.addEventListener('mouseover', () => {
            deleteBtn.style.display = 'inline';
            appointmentDiv.style.backgroundColor = '#f0f0f0';
        });

        appointmentDiv.addEventListener('mouseout', () => {
            deleteBtn.style.display = 'none';
            appointmentDiv.style.backgroundColor = '#FFFFFF';
        })

        deleteBtn.addEventListener('click', async (event) => {
            event.stopPropagation();
            
            await removeAppt(appt, appointmentDiv);
        })

        appointmentDiv.addEventListener('click', () => {
            showAppointmentOverlay(appt);
        });

        appointmentDiv.appendChild(deleteBtn);
        container.appendChild(appointmentDiv);
    });
}

async function removeTutor(name, tutorDiv) {
    try {
        const response = await fetch("/api/tutors/remtutor", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name })
        });

        if (response.ok) {
            alert(`Tutor ${name} deleted successfully!`);
            tutorDiv.remove();
        } else {
            const errorData = await response.json();
            alert(errorData.error);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while removing the tutor.");
    }
}

function showTutorOverlay(tutor) {
    const tutorDetails = [
        { label: 'Name', value: tutor.name, field:'name' },
        { label: 'Primary Subject', value:tutor.primSubj, field:'primSubj' },
        { label: 'Secondary Subject', value:tutor.secSubj, field:'secSubj' },
        { label: 'Course', value:tutor.courses.join(', '), field:'courses' },
        { label: 'Email', value: tutor.email, field:'email' }
    ];
    const detailContainer = document.getElementById('overlay-tutor-details');
    detailContainer.innerHTML = '';

    tutorDetails.forEach(detail => {
        detailContainer.style.display = 'flex';
        detailContainer.style.alignItems = 'left';
        detailContainer.style.marginBottom = '10px';

        const detailText = document.createElement('p');
        detailText.textContent = `${detail.label}: ${detail.value}`;
        detailText.style.margin = '0 10px 0 0';

        const editButton = document.createElement('button');
        editButton.innerHTML = '✏️';
        editButton.style.cursor = 'pointer';
        editButton.style.border = 'none';
        editButton.style.background = 'transparent';
        editButton.style.fontSize = '16px';
        editButton.style.marginLeft = '0';
        editButton.style.textAlign = 'left';

        const form = document.createElement('form');
        form.style.display = 'none';
        form.style.marginLeft = '10px';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = detail.value;
        input.style.marginRight = '5px';

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.type = 'submit';

        form.appendChild(input);
        form.appendChild(saveButton);

        editButton.addEventListener('click', () => {
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newValue = input.value;
            detailText.textContent = `${detail.label}: ${newValue}`;
            tutor[detail.field] = newValue;
            form.style.display = 'none';
            updateTutor(tutor);
        });

        document.getElementById('tutor-overlay-content').append(detailContainer);
        detailContainer.appendChild(detailText);
        detailContainer.appendChild(editButton);
        detailContainer.appendChild(form);
    });

    document.getElementById('tutor-overlay').style.display = 'block';
}

function updateTutor(tutor) {
    console.log("inside updateTutor", tutor);
    fetch('/api/tutors/update', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tutor)
    })
    .then(response => {
        //console.log("inside fetch, ", body);
        if (!response.ok) {
            throw new Error('Failed to update tutor');
        }
        return response.json();
    })
    .then(data => {
        console.log('Tutor updated successfully:', data);
    })
    .catch(error => {
        console.error('Error updating tutor:', error);
    })
}

function showAppointmentOverlay(appointment) {
    document.getElementById('overlay-appt-start-end').textContent = `${(parseDate(appointment.startTime)).split(" (")[0]}-${((parseDate(appointment.endTime)).split(" (")[0]).split(": ")[1]}`;
    document.getElementById('overlay-appt-details').innerHTML = `
        <p>Tutor: ${appointment.tutor}</p>
        <p>Subject: ${appointment.subject}</p>
        <p>Mode: ${appointment.mode}</p>
        <p>AND MOREEEEEEEE</p>
    `;

    document.getElementById('appt-overlay').style.display = 'block';
}

function parseDate(date) {
    // "2024-04-07T14:22:40Z"
    console.log(date);
    const months = ["Jan", "Feb", "March", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    const dateParts = date.split("-");
    const year = dateParts[0];
    const month = dateParts[1];
    const daytime = dateParts[2].split("T");
    const day = daytime[0];
    const time = daytime[1].substring(0, daytime[1].length - 8);

    return months[parseInt(month) - 1] + " " + day + ": " + time + " (" + year + ")";
    // Apr, 07: 14:22 (2024)
}

function displayDate(date) {
    console.log(date);
    const parsedDate = parseDate(date);
    console.log(parsedDate);
    const almost = parsedDate.split(":")[0] + ", " + parsedDate.split(":")[2].split('(')[1];
    const dateString = almost.substring(0, almost.length - 1);
    
    document.getElementById('display-date').innerHTML = `
        <p>${dateString}</p>
    `
} 

async function removeAppt(appt, apptDiv) {
    try {
        const response = await fetch("/api/appointments/remove", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: appt._id, tutor: appt.tutor })
        });

        if (response.ok) {
            alert(`Appt for tutor ${ appt.tutor } deleted successfully!`);
            apptDiv.remove();
        } else {
            const errorData = await response.json();
            alert(errorData.error);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while removing the appt.");
    }
}