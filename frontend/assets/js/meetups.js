import MeetupService from '../../services/meetup-service.js';

window.initMeetups = function () {
    const user = JSON.parse(localStorage.getItem("user_data"));

    // Show/hide add meetup form based on admin role
    const addForm = document.getElementById("addMeetupForm");
    if (addForm) {
        if (user && user.role === "admin") {
            addForm.style.display = "block";
        } else {
            addForm.style.display = "none";
        }
    }
    fetchAndRenderMeetups();
};

function fetchAndRenderMeetups() {
    MeetupService.getAllMeetups(
        function(result) {
            // Accept both array and object with data property
            if (Array.isArray(result)) {
                renderMeetups(result);
            } else if (result && result.data && Array.isArray(result.data)) {
                renderMeetups(result.data);
            } else {
                console.error("Invalid response format:", result);
                alert("Failed to fetch meetups: Invalid response format");
            }
        },
        function(xhr) {
            console.error("Failed to fetch meetups:", xhr.responseText);
            alert("Failed to fetch meetups: " + xhr.responseText);
        }
    );
}

window.addMeetup = function () {
    const userData = JSON.parse(localStorage.getItem("user_data"));
    if (!userData || userData.role !== "admin") {
        alert("Only admins can add meetups!");
        return;
    }

    const title = document.getElementById("meetupTitle").value;
    const date = document.getElementById("meetupDate").value;
    const location = document.getElementById("meetupLocation").value;
    const description = document.getElementById("meetupDescription").value;
    const organizerId = userData.id;

    if (!title || !date || !location || !description) {
        alert("Please fill out all fields!");
        return;
    }

    const newMeetup = {
        title: title,
        date: date,
        location: location,
        description: description,
        organizer_id: organizerId
    };

    MeetupService.addMeetup(newMeetup,
        function(result) {
            if (result && result.success) {
                alert("Meetup added successfully!");
                fetchAndRenderMeetups();
                document.getElementById("meetupTitle").value = "";
                document.getElementById("meetupDate").value = "";
                document.getElementById("meetupLocation").value = "";
                document.getElementById("meetupDescription").value = "";
            } else {
                alert("Failed to add meetup: " + (result.message || "Unknown error"));
            }
        },
        function(xhr) {
            alert("Failed to add meetup: " + xhr.responseText);
        }
    );
};

function renderMeetups(meetups) {
    const container = document.getElementById("meetupsContainer");
    if (!container) return;

    container.innerHTML = "";
const emptyState = document.getElementById("meetupsEmptyState");
if (!Array.isArray(meetups) || meetups.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    container.innerHTML = "";
    return;
} else {
    if (emptyState) emptyState.style.display = "none";
}

    const userData = localStorage.getItem("user_data");
    const user = userData ? JSON.parse(userData) : null;

    meetups.forEach((meetup) => {
        const card = document.createElement("div");
        card.classList.add("meetup-card");

        card.innerHTML = `
            <h3>${meetup.title}</h3>
            <p><strong>Date:</strong> ${meetup.date}</p>
            <p><strong>Location:</strong> ${meetup.location}</p>
            <p>${meetup.description}</p>
            <p><strong>Scheduled By:</strong> ${meetup.organizer_name || 'Unknown'}</p>
        `;

        if (user && user.role === "admin") {
            const buttonContainer = document.createElement("div");
            buttonContainer.classList.add("meetup-buttons");

            const editBtn = document.createElement("button");
            editBtn.classList.add("edit-btn-meetup");
            editBtn.textContent = "✏️ Edit";
            editBtn.onclick = () => showEditMeetupForm(meetup);

            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("delete-btn-meetup");
            deleteBtn.textContent = "🗑️ Delete";
            deleteBtn.onclick = () => deleteMeetup(meetup.id);

            buttonContainer.appendChild(editBtn);
            buttonContainer.appendChild(deleteBtn);
            card.appendChild(buttonContainer);
        }

        container.appendChild(card);
    });
}

function showEditMeetupForm(meetup) {
    console.log("showEditMeetupForm called for meetup:", meetup);
    const modal = document.createElement("div");
    modal.classList.add("modal-overlay");
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Edit Meetup</h3>
            <form id="editMeetupForm">
                <input type="text" id="editMeetupTitle" placeholder="Meetup Title" value="${meetup.title}" required>
                <input type="date" id="editMeetupDate" value="${meetup.date}" required>
                <input type="text" id="editMeetupLocation" placeholder="Location" value="${meetup.location}" required>
                <textarea id="editMeetupDescription" placeholder="Description" required>${meetup.description}</textarea>
                <div class="modal-buttons">
                    <button type="submit">Save Changes</button>
                    <button type="button" onclick="closeModal()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    console.log("Modal appended to body.");

    document.getElementById("editMeetupForm").addEventListener("submit", function(e) {
        e.preventDefault();
        console.log("Edit form submitted.");
        updateMeetup(meetup.id);
    });
}

function closeModal() {
    const modal = document.querySelector(".modal-overlay");
    if (modal) {
        modal.remove();
    }
}

function updateMeetup(meetupId) {
    const title = document.getElementById("editMeetupTitle").value;
    const date = document.getElementById("editMeetupDate").value;
    const location = document.getElementById("editMeetupLocation").value;
    const description = document.getElementById("editMeetupDescription").value;

    if (!title || !date || !location || !description) {
        alert("Please fill all required fields!");
        return;
    }

    const meetupData = {
        title: title,
        date: date,
        location: location,
        description: description
    };

    MeetupService.updateMeetup(meetupId, meetupData,
        function(result) {
            if (result && result.success) {
                alert("Meetup updated successfully!");
                closeModal();
                fetchAndRenderMeetups();
            } else {
                alert("Failed to update meetup: " + (result.message || "Unknown error"));
            }
        },
        function(xhr) {
            alert("Failed to update meetup: " + xhr.responseText);
        }
    );
}

function deleteMeetup(id) {
    if (!confirm("Are you sure you want to delete this meetup?")) return;

    MeetupService.deleteMeetup(id,
        function(result) {
            if (result && result.success) {
                alert("Meetup deleted successfully!");
                fetchAndRenderMeetups();
            } else {
                alert("Failed to delete meetup: " + (result.message || "Unknown error"));
            }
        },
        function(xhr) {
            alert("Failed to delete meetup: " + xhr.responseText);
        }
    );
}

$(document).ready(function() {
    // Initialize form validation
    $("#meetup-form").validate({
        rules: {
            meetupTitle: {
                required: true,
                minlength: 3
            },
            meetupDescription: {
                required: true,
                minlength: 10
            },
            meetupDate: {
                required: true,
                date: true
            },
            meetupLocation: {
                required: true
            }
        },
        messages: {
            meetupTitle: {
                required: "Please enter a title for the meetup",
                minlength: "Title must be at least 3 characters long"
            },
            meetupDescription: {
                required: "Please provide a description",
                minlength: "Description must be at least 10 characters long"
            },
            meetupDate: {
                required: "Please select a date",
                date: "Please enter a valid date"
            },
            meetupLocation: {
                required: "Please enter a location"
            }
        },
        submitHandler: function(form) {
            event.preventDefault();
            addMeetup();
            return false;
        }
    });

    // Initialize meetups page
    if (window.location.hash === "#meetups") {
        initMeetups();
    }
});
