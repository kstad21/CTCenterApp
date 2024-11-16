/* public/scripts/add-course.js */

document.addEventListener('DOMContentLoaded', () => {
    fetchCourses();

    document.getElementById('close-overlay-btn').addEventListener('click', () => {
        document.getElementById('course-overlay').style.display = 'none';
    });
})

document.getElementById('add-course-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const courseInput = document.getElementById('course-name').value.trim();

    const courses = courseInput.split(",").map(course => course.trim());
    //check for duplicates

    const uniqueCourses = [];
    const duplicatesFound = false;
    courses.forEach(course => {
        if (!uniqueCourses.includes(course)) {
            uniqueCourses.push(course);
        } else {
            duplicatesFound = true;
        }
    })
    
    if (duplicatesFound) {
        alert("Duplicates were found and removed. Courses will only be added once.");
    }

    uniqueCourses.forEach(async course => {
        await addCourse(course);
    })
});

async function fetchCourses() {
    try {
        const response = await fetch('/api/courses');
        if (!response.ok) {
            throw new Error('Failed to fetch tutors');
        }
        const courses = await response.json();
        displayCourses(courses);
    } catch (error) {
        console.log("Error retrieving courses:", error);
        document.getElementById('courses-container').innerHTML = '<p>Error loading courses</p>';
    }
}

async function addCourse(courses) {
    const courseParts = courses.split(" ");
    if (courseParts.length < 2) {
        alert(`Error in formatting of ${courses}, will not add.`);
        return;
    }

    const name = courses;
    const subject = courseParts[0];
    const code = courseParts[1];

    try {
        const response = await fetch('/api/courses/addcourse', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, subject, code })
        });

        if (response.status == 201) {
            alert(`Course ${name} added successfully`);
        } else if  (response.status == 400) {
            alert(`Course named ${name} already exists. Will not add.`);
        } else {
            alert(`Failed to add course '${name}'`);
        }

        fetchCourses();
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error adding the course');
    }
}

function displayCourses(courses) {
    const container = document.getElementById('courses-container');
    container.innerHTML = '';

    if (courses.length == 0) {
        container.innerHTML = '<p>No courses</p>';
        return;
    }

    courses.forEach(course => {
        const courseDiv = document.createElement('div');
        courseDiv.classList.add('course');

        const courseInfo = document.createElement('span');
        courseInfo.textContent = `${course.name}: Subject: ${course.subject} | Code: ${course.code}`;
        courseDiv.appendChild(courseInfo);

        //create delete buttn 
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.style.display = 'none'; // initially hidden

        //show when mouse hovers
        courseDiv.addEventListener('mouseover', () => {
            deleteBtn.style.display = 'inline';
            courseDiv.style.backgroundColor = '#f0f0f0';
        });

        courseDiv.addEventListener('mouseout', () => {
            deleteBtn.style.display = 'none';
            courseDiv.style.backgroundColor = '#FFFFFF';
        });

        deleteBtn.addEventListener('click', async (event) => {
            event.stopPropagation();
            const result = await removeCourse(course.name, courseDiv);
        });

        courseDiv.addEventListener('click', () => {
            showCourseOverlay(course);
        });

        courseDiv.appendChild(deleteBtn);
        container.appendChild(courseDiv);
    })
}

async function removeCourse(name, courseDiv) {
    try {
        const response = await fetch("/api/courses/remcourse", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name })
        })

        if (response.ok) {
            alert(`Course ${name} deleted successfully!`);
            courseDiv.remove();
        } else {
            const errorData = await response.json();
            alert(errorData.error);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while removing the course.");
    }
}

function showCourseOverlay(course) {
    document.getElementById('overlay-course-name').textContent = course.name;
    document.getElementById('overlay-course-details').innerHTML = `
        <p>Name: ${course.name}</p>
        <p>Subject: ${course.subject}</p>
        <p>Code: ${course.code}</p>
        <p>Quarters offered: ${course.quartersOffered} </p>
        <p>Professors: ${course.profs} </p>
    `;

    document.getElementById('course-overlay').style.display = 'block';
}