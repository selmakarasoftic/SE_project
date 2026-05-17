import UserService from '../../services/user-service.js';

function initAdminPage() {
    const userListContainer = document.getElementById("userList");
    const adminPanel = document.getElementById("adminPanel");
    const userData = localStorage.getItem("user_data");
    const loggedInUser = userData ? JSON.parse(userData) : null;

    if (!adminPanel) return;

    // Check if user is logged in and is an admin
    if (!loggedInUser) {
        window.location.href = "login.html";
        return;
    }

    if (loggedInUser.role !== "admin") {
        adminPanel.innerHTML = "<p>Unauthorized access. Redirecting to home page...</p>";
        setTimeout(() => {
            window.location.href = "home.html";
        }, 2000);
        return;
    }

    fetchAndRenderUsers(); // Call the function to fetch and render users
}

function fetchAndRenderUsers() {
    const userListContainer = document.getElementById("userList");
    if (!userListContainer) return;

    userListContainer.innerHTML = ""; // Clear previous content

    UserService.getAllUsers(
        function(result) {
            console.log("UserService.getAllUsers raw response:", result); // Log raw response
            let usersToRender = [];

            if (result && result.data && Array.isArray(result.data)) {
                usersToRender = result.data;
            } else if (Array.isArray(result)) {
                usersToRender = result;
            } else {
                console.error("Invalid response format for getAllUsers:", result);
                userListContainer.innerHTML = "<p>Failed to load users: Invalid data format.</p>";
                return;
            }

            console.log("Users to render:", usersToRender);

            if (usersToRender.length > 0) {
                usersToRender.forEach((user) => {
                    const userCard = document.createElement("div");
                    userCard.classList.add("user-card");

                    userCard.innerHTML = `
                        <div class="user-info">
                            <h3>${user.username} <span class="role-badge ${user.role}">${user.role.toUpperCase()}</span></h3>
                            <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
                            <p><strong>Registered:</strong> ${user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}</p>
                        </div>
                        <div class="user-actions">
                            <button class="edit-btn-user" onclick="window.editUser('${user.id}', '${user.username}', '${user.email}', '${user.role}')">✏️ Edit</button>
                            ${user.role !== "admin" ? `<button class="delete-btn-user" onclick="window.deleteUser('${user.id}')">🗑️ Delete</button>` : ""}
                        </div>
                    `;

                    userListContainer.appendChild(userCard);
                });
            } else {
                userListContainer.innerHTML = "<p>No users found.</p>";
            }
        },
        function(xhr) {
            console.error("Error fetching users:", xhr.responseText);
            userListContainer.innerHTML = "<p>Error loading users.</p>";
            console.log("XHR object on error:", xhr);
        }
    );
}

// Make functions global for onclick events
window.editUser = function (id, username, email, role) {
    const newRole = prompt(`Change role for ${username} (admin/guest):`, role);
    if (newRole && (newRole === "admin" || newRole === "guest")) {
        const updatedUser = { username: username, email: email, role: newRole };
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'users/' + id,
            type: 'PUT',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            data: JSON.stringify(updatedUser),
            contentType: 'application/json',
            success: function(result) {
                if (result && result.success) {
                    alert("User updated successfully!");
                    fetchAndRenderUsers(); // Re-render the list
                } else {
                    alert(result.message || "Failed to update user!");
                }
            },
            error: function(xhr) {
                alert("Error: " + (xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : xhr.responseText));
            }
        });
    } else if (newRole !== null) {
        alert("❌ Invalid role. Use 'admin' or 'guest'.");
    }
};

window.deleteUser = function (id) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    $.ajax({
        url: Constants.PROJECT_BASE_URL + 'users/' + id,
        type: 'DELETE',
        headers: { 'Authorization': localStorage.getItem('user_token') },
        success: function(result) {
            if (result && result.success) {
                alert("User deleted successfully!");
                fetchAndRenderUsers(); // Re-render the list
            } else {
                alert(result.message || "Failed to delete user!");
            }
        },
        error: function(xhr) {
            alert("Error: " + (xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : xhr.responseText));
        }
    });
};

