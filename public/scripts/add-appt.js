/* public/scripts/add-appt.js */

document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('add-appt-form-container');
    formContainer.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = e.target;
        const forms = formContainer.children;
        const formData = new FormData(form);

        const formObj = {};
        formData.forEach((value, key) => {
            formObj[key] = value;
        });

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
    });
});
