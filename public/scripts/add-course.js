/* public/scripts/add-course.js */

document.getElementById('add-course-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const courseName = document.getElementById('course-name').value.trim();

    const courseParts = courseName.split(" ");
    if (courseParts.length < 2) {
        alert("Please enter the course name in the format 'Subject<SPACE>code', like 'Math 10'");
        return;
    }

    const name = courseName;
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

        const data = await response.json();
        if (data.success) {
            alert("Course added successfully");
        } else {
            alert("Failed to add course");
        }
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error adding the course');
    }
});