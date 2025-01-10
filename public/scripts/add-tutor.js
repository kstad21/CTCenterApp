/* public/scripts/add-tutor.js */

document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById("add-tutor-form-container");
    formContainer.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = e.target;
        const forms = formContainer.children;
        const formData = new FormData(form);
        
        //collect formData into an object
        const formObj = {};
        formData.forEach((value, key) => {
            formObj[key] = value;
        });

        console.log("inside add-tutor.js, formData: " + JSON.stringify(formObj));

        try {
            const response = await fetch("/api/tutors/addtutor", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formObj)
            });

            if (response.ok) {
                alert("Tutor added/updated successfully!");

                //check if other forms 
                if (forms.length > 1) {
                    formContainer.removeChild(form);
                } else {
                    form.reset();
                }
            } else {
                alert("Failed to add/update tutor.");
            }
        } catch (error) {
            console.error("Error", error);
            alert("An error occured while adding/updating the tutor.");
        }
    });

    // add a new form when add form button is clicked
    document.getElementById("add-tutor-form-container-btn").addEventListener("click", () => {
        /*const newForm = document.createElement("form");
        newForm.innerHTML = `
            <label for="name">Name:</label><input type="text" name="name" required><br>
            <label for="primSubj">Primary Subject:</label><input type="text" name="primSubj" required><br>
            <label for="secSubj">Secondary Subject:</label><input type="text" name="secSubj"><br>
            <label for="email">Email:</label><input type="email" name="email"><br>
            <label for="courses">Courses:</label><input type="text" name="courses"><br>
            <button type="submit">Submit</button>
        `;*/
        const newForm = document.getElementById('add-tutor-form').cloneNode(true);
        const inputs = newForm.querySelectorAll('input, select');
        inputs.forEach(input => input.value = '');

        formContainer.appendChild(newForm);
    });

    //remove last form when remove form button is clicked
    document.getElementById("sub-tutor-form-container-btn").addEventListener("click", () => {
        const forms = formContainer.querySelectorAll("form");
        if (forms.length > 1) {
            formContainer.removeChild(forms[forms.length - 1]);
        }
    });
});

