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

