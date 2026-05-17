import ProfileService from '../../services/profile-service.js';
import CarService from '../../services/car-service.js';
import ReviewService from '../../services/review-service.js';
import MeetupService from '../../services/meetup-service.js';
import Constants from '../../utils/constants.js';

window.initProfile = function () {
    const usernameElement = document.getElementById("profileUsername");
    const roleElement = document.getElementById("profileRole");
    const registeredElement = document.getElementById("profileRegistered");
    const profileInfo = document.getElementById("profileInfo");

    const userData = JSON.parse(localStorage.getItem("user_data"));
    if (!userData || !userData.id) {
        if (profileInfo) {
            profileInfo.innerHTML = "<p>No user logged in or user ID not found.</p>";
        }
        return;
    }

    ProfileService.getProfile(
        userData.id,
        function(user) {
            if (user) {
                usernameElement.textContent = user.username || 'N/A';
                roleElement.textContent = user.role || 'N/A';
                registeredElement.textContent = user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : 'N/A';
            } else {
                profileInfo.innerHTML = "<p>Failed to load user profile.</p>";
            }
        },
        function(xhr) {
            console.error("Error fetching profile:", xhr.responseText);
            profileInfo.innerHTML = "<p>Error loading profile data.</p>";
        }
    );

    loadMyListings();
    loadAdminStats();
};

function loadAdminStats() {
    const userData = JSON.parse(localStorage.getItem("user_data"));
    const adminStats = document.getElementById("adminStats");
    const totalCars = document.getElementById("totalCars");
    const totalReviews = document.getElementById("totalReviews");
    const totalMeetups = document.getElementById("totalMeetups");

    if (!userData || userData.role !== "admin") {
        if (adminStats) adminStats.style.display = "none";
        return;
    }

    if (adminStats) adminStats.style.display = "block";

    CarService.getAllCars(
        function(result) {
            let cars = [];
            if (Array.isArray(result)) cars = result;
            else if (result && result.data && Array.isArray(result.data)) cars = result.data;
            if (totalCars) totalCars.textContent = cars.length;
        },
        function() {
            if (totalCars) totalCars.textContent = "N/A";
        }
    );

    ReviewService.getAllReviews(
        function(result) {
            let reviews = [];
            if (Array.isArray(result)) reviews = result;
            else if (result && result.data && Array.isArray(result.data)) reviews = result.data;
            if (totalReviews) totalReviews.textContent = reviews.length;
        },
        function() {
            if (totalReviews) totalReviews.textContent = "N/A";
        }
    );

    MeetupService.getAllMeetups(
        function(result) {
            let meetups = [];
            if (Array.isArray(result)) meetups = result;
            else if (result && result.data && Array.isArray(result.data)) meetups = result.data;
            if (totalMeetups) totalMeetups.textContent = meetups.length;
        },
        function() {
            if (totalMeetups) totalMeetups.textContent = "N/A";
        }
    );
}

function loadMyListings() {
    const userData = JSON.parse(localStorage.getItem("user_data"));
    const container = document.getElementById("myListingsContainer");
    const emptyState = document.getElementById("myListingsEmpty");

    if (!userData || !userData.id || !container) return;

    CarService.getAllCars(
        function(result) {
            let cars = [];
            if (Array.isArray(result)) cars = result;
            else if (result && result.data && Array.isArray(result.data)) cars = result.data;

            const myCars = cars.filter(car => Number(car.user_id) === Number(userData.id));

            container.innerHTML = "";

            if (!myCars.length) {
                if (emptyState) emptyState.style.display = "block";
                return;
            }

            if (emptyState) emptyState.style.display = "none";

            myCars.forEach(car => {
                const card = document.createElement("div");
                card.classList.add("my-listing-card");

                card.innerHTML = `
                    <img src="${car.image_url || ''}" alt="${car.model || 'Car image'}">
                    <div class="listing-content">
                        <h4>${car.model}</h4>
                        <p><strong>Year:</strong> ${car.year}</p>
                        <p><strong>Engine:</strong> ${car.engine}</p>
                        <p><strong>Horsepower:</strong> ${car.horsepower}</p>
                        <div class="my-listing-actions">
                            <button class="edit-btn-profile" data-id="${car.id}">✏️ Edit</button>
                            <button class="delete-btn-profile" data-id="${car.id}">🗑️ Delete</button>
                        </div>
                    </div>
                `;

                card.querySelector(".edit-btn-profile").addEventListener("click", function () {
                    showEditListingForm(car);
                });

                card.querySelector(".delete-btn-profile").addEventListener("click", function () {
                    deleteMyListing(car.id);
                });

                container.appendChild(card);
            });
        },
        function(xhr) {
            console.error("Failed to fetch user listings:", xhr.responseText);
            if (container) {
                container.innerHTML = `<p class="profile-empty-state">Failed to load your listings.</p>`;
            }
        }
    );
}

function showEditListingForm(car) {
    const modal = document.createElement("div");
    modal.classList.add("modal-overlay");

    modal.innerHTML = `
        <div class="modal-content">
            <h3>Edit My Listing</h3>
            <form id="editListingForm">
                <input type="text" id="editListingModel" placeholder="Car Model" value="${car.model}" required>
                <input type="number" id="editListingYear" placeholder="Year" min="1886" max="2026" value="${car.year}" required>
                <input type="text" id="editListingEngine" placeholder="Engine" value="${car.engine}" required>
                <input type="number" id="editListingHorsepower" placeholder="Horsepower" min="1" value="${car.horsepower}" required>
                <input type="file" id="editListingImage" accept="image/*">
                <div class="modal-buttons">
                    <button type="submit">Save Changes</button>
                    <button type="button" id="cancelProfileEditBtn">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("editListingForm").addEventListener("submit", function(e) {
        e.preventDefault();
        updateMyListing(car.id);
    });

    document.getElementById("cancelProfileEditBtn").addEventListener("click", closeProfileModal);
}

function updateMyListing(carId) {
    const model = document.getElementById("editListingModel").value.trim();
    const year = document.getElementById("editListingYear").value;
    const engine = document.getElementById("editListingEngine").value.trim();
    const horsepower = document.getElementById("editListingHorsepower").value;
    const imageInput = document.getElementById("editListingImage");

    if (!model || !year || !engine || !horsepower) {
        alert("Please fill all required fields.");
        return;
    }

    const formData = new FormData();
    formData.append("model", model);
    formData.append("year", year);
    formData.append("engine", engine);
    formData.append("horsepower", horsepower);

    if (imageInput.files.length > 0) {
        formData.append("image", imageInput.files[0]);
    }

    CarService.updateCar(
        carId,
        formData,
        function(result) {
            if (result && result.success) {
                alert("Listing updated successfully!");
                closeProfileModal();
                loadMyListings();
            } else {
                alert(result.message || "Failed to update listing.");
            }
        },
        function(xhr) {
            alert("Failed to update listing: " + xhr.responseText);
        }
    );
}

function deleteMyListing(carId) {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    CarService.deleteCar(
        carId,
        function(result) {
            if (result && result.success) {
                alert("Listing deleted successfully!");
                loadMyListings();
                loadAdminStats();
            } else {
                alert(result.message || "Failed to delete listing.");
            }
        },
        function(xhr) {
            alert("Failed to delete listing: " + xhr.responseText);
        }
    );
}

function closeProfileModal() {
    const modal = document.querySelector(".modal-overlay");
    if (modal) modal.remove();
}

$(document).on("spapp:ready", function () {
    if (window.location.hash === "#profile") {
        initProfile();
    }
});

window.changePassword = function () {
    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const userData = JSON.parse(localStorage.getItem("user_data"));
    const userId = userData ? userData.id : null;
    const message = document.getElementById("profileMessage");

    if (!oldPassword || !newPassword) {
        message.textContent = "Please fill out both fields.";
        message.style.color = "darkred";
        return;
    }

    if (!userId) {
        message.textContent = "User not logged in.";
        message.style.color = "darkred";
        return;
    }

    $.ajax({
        url: Constants.PROJECT_BASE_URL + 'users/' + userId + '/password',
        type: 'PUT',
        headers: { 'Authorization': localStorage.getItem('user_token') },
        data: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword
        }),
        contentType: 'application/json',
        success: function(result) {
            if (result && result.success) {
                message.textContent = "Password updated successfully!";
                message.style.color = "green";
                document.getElementById("oldPassword").value = '';
                document.getElementById("newPassword").value = '';
            } else {
                message.textContent = result.message || "Failed to change password!";
                message.style.color = "darkred";
            }
        },
        error: function(xhr) {
            const errorMessage = xhr.responseJSON && xhr.responseJSON.message
                ? xhr.responseJSON.message
                : xhr.responseText;
            message.textContent = "Error: " + errorMessage;
            message.style.color = "darkred";
        }
    });
};

window.logoutUser = function () {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_data");
    window.location.hash = "#login";
};

window.deleteAccount = function () {
    const userData = JSON.parse(localStorage.getItem("user_data"));
    const userId = userData ? userData.id : null;

    if (!userId) {
        alert("User not logged in.");
        return;
    }

    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        return;
    }

    $.ajax({
        url: Constants.PROJECT_BASE_URL + 'users/' + userId,
        type: 'DELETE',
        headers: { 'Authorization': localStorage.getItem('user_token') },
        success: function(result) {
            if (result && result.success) {
                alert("Account deleted successfully!");
                localStorage.removeItem("user_token");
                localStorage.removeItem("user_data");
                window.location.hash = "#home";
            } else {
                alert(result.message || "Failed to delete account!");
            }
        },
        error: function(xhr) {
            const errorMessage = xhr.responseJSON && xhr.responseJSON.message
                ? xhr.responseJSON.message
                : xhr.responseText;
            alert("Error: " + errorMessage);
        }
    });
};

window.closeProfileModal = closeProfileModal;