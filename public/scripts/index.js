/* public/scripts/index.js */

//fetch data from api and display it 
document.addEventListener('DOMContentLoaded', () => {
    fetchTutors();
})

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

function displayTutors(tutors) {
    const container = document.getElementById('tutors-container');
    container.innerHTML = '';

    if (tutors.length == 0) {
        container.innerHTML = '<p>No tutors</p>';
        return;
    }

    tutors.forEach(tutor => {
        //create div for each tutor
        const tutorDiv = document.createElement('div');
        tutorDiv.classList.add('tutor');

        const tutorInfo = document.createElement('span');
        tutorInfo.textContent = `${tutor.name}: Primary Subject: ${tutor.primSubj} | Secondary Subject: ${tutor.secSubj} | Courses: ${tutor.courses.join(', ')} | Email: ${tutor.email}`;
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

        deleteBtn.addEventListener('click', async () => {
            const result = await removeTutor(tutor.name, tutorDiv);
        })

        tutorDiv.appendChild(deleteBtn);
        container.appendChild(tutorDiv);
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

