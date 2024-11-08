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
    if (tutors.length == 0) {
        container.innerHTML = '<p>No tutors</p>';
        return;
    }

    const list = document.createElement('ul');
    tutors.forEach(tutor => {
        const listItem = document.createElement('li');
        listItem.textContent = `${tutor.name}: ${tutor.courses.join(', ')}`;
        list.appendChild(listItem);
    });

    container.appendChild(list);
}