import GalleryService from '../../services/gallery-service.js';

$(document).on("spapp:ready", function () {
    if (window.location.hash === "#gallery") {
        initGallery();
    }
});

window.initGallery = function () {
    console.log("initGallery called.");
    const user = JSON.parse(localStorage.getItem("user_data"));
    const uploadSection = document.getElementById("uploadSection");

    if (uploadSection) {
        if (user) {
            uploadSection.style.display = "block";
        } else {
            uploadSection.style.display = "none";
        }
    }
    fetchAndRenderGallery();
}

function fetchAndRenderGallery() {
    console.log("Fetching and rendering gallery...");
    GalleryService.getAllGalleryItems(
        function(result) {
            console.log("getAllGalleryItems Result:", result);
            if (Array.isArray(result)) {
                renderGallery(result);
            } else if (result && result.data && Array.isArray(result.data)) {
                renderGallery(result.data);
            } else {
                console.error("Invalid response format:", result);
                alert("Failed to fetch gallery items: Invalid response format");
            }
        },
        function(xhr) {
            console.error("Failed to fetch gallery items:", xhr.responseText);
            alert("Failed to fetch gallery items: " + xhr.responseText);
        }
    );
}

function renderGallery(photos) {
    console.log("Rendering gallery with photos:", photos);
    const galleryContainer = document.getElementById("galleryContainer");
    if (!galleryContainer) {
        console.warn("galleryContainer not found.");
        return;
    }

    // Clear existing content more robustly
    while (galleryContainer.firstChild) {
        galleryContainer.removeChild(galleryContainer.firstChild);
    }

    if (!Array.isArray(photos) || photos.length === 0) {
        galleryContainer.innerHTML = "<p>No photos in the gallery yet.</p>";
        return;
    }

    const userData = localStorage.getItem("user_data");
    const user = userData ? JSON.parse(userData) : null;

    photos.forEach((photo) => {
        const photoCard = document.createElement("div");
        photoCard.classList.add("photo-card");

        photoCard.innerHTML = `
            <img src="${photo.image_url}" alt="${photo.title}">
            <h4>${photo.title}</h4>
            <p>Uploaded by: ${photo.uploaded_by_name || 'Unknown'} | ${new Date(photo.uploaded_at).toLocaleString()}</p>
        `;

        if (user && user.role === "admin") {
            const buttonContainer = document.createElement("div");
            buttonContainer.classList.add("gallery-buttons");

            const editBtn = document.createElement("button");
            editBtn.classList.add("edit-btn-gallery");
            editBtn.textContent = "✏️ Edit";
            editBtn.onclick = () => showEditGalleryForm(photo);

            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("delete-btn-gallery");
            deleteBtn.textContent = "🗑️ Delete";
            deleteBtn.onclick = () => deletePhoto(photo.id);

            buttonContainer.appendChild(editBtn);
            buttonContainer.appendChild(deleteBtn);
            photoCard.appendChild(buttonContainer);
        }

        galleryContainer.appendChild(photoCard);
    });
}

window.uploadPhoto = function () {
    const userData = JSON.parse(localStorage.getItem("user_data"));
    if (!userData) {
        alert("You must be logged in to upload photos!");
        return;
    }

    const title = document.getElementById("photoTitle").value;
    const fileInput = document.getElementById("photoUpload");
    const file = fileInput.files[0];
    const userId = userData.id;

    if (!title || !file) {
        alert("Please enter a title and select an image.");
        return;
    }

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("title", title);
    formData.append("image", file);

    GalleryService.addGalleryItem(formData,
        function(result) {
            console.log("Add Gallery Item Success:", result);
            if (result && result.success) {
                alert("Photo uploaded successfully!");
                fetchAndRenderGallery();
                document.getElementById("photoTitle").value = "";
                fileInput.value = ""; // Clear the file input
            } else {
                alert("Failed to upload photo: " + (result.message || "Unknown error"));
            }
        },
        function(xhr) {
            console.error("Add Gallery Item Error:", xhr.responseText);
            alert("Failed to upload photo: " + xhr.responseText);
        }
    );
};

function showEditGalleryForm(photo) {
    const modal = document.createElement("div");
    modal.classList.add("modal-overlay");
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Edit Gallery Item</h3>
            <form id="editGalleryForm">
                <input type="text" id="editGalleryTitle" placeholder="Title" value="${photo.title}" required>
                <input type="file" id="editGalleryImage" accept="image/*">
                <div class="modal-buttons">
                    <button type="submit">Save Changes</button>
                    <button type="button" id="cancelEditGallery">Cancel</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("editGalleryForm").addEventListener("submit", function(e) {
        e.preventDefault();
        updateGalleryItem(photo.id);
    });

    document.getElementById("cancelEditGallery").addEventListener("click", function() {
        closeModal();
    });
}

function closeModal() {
    const modal = document.querySelector(".modal-overlay");
    if (modal) {
        modal.remove();
    }
}

function updateGalleryItem(galleryId) {
    const title = document.getElementById("editGalleryTitle").value;
    const imageInput = document.getElementById("editGalleryImage");

    if (!title) {
        alert("Please fill all required fields!");
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    if (imageInput.files.length > 0) {
        formData.append("image", imageInput.files[0]);
    }

    GalleryService.updateGalleryItem(galleryId, formData,
        function(result) {
            if (result && result.success) {
                alert("Gallery item updated successfully!");
                closeModal();
                fetchAndRenderGallery();
            } else {
                alert("Failed to update gallery item: " + (result.message || "Unknown error"));
            }
        },
        function(xhr) {
            alert("Failed to update gallery item: " + xhr.responseText);
        }
    );
}

window.deletePhoto = function (id) {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    GalleryService.deleteGalleryItem(id,
        function(result) {
            if (result && result.success) {
                alert("Photo deleted successfully!");
                fetchAndRenderGallery();
            } else {
                alert("Failed to delete photo: " + (result.message || "Unknown error"));
            }
        },
        function(xhr) {
            alert("Failed to delete photo: " + xhr.responseText);
        }
    );
};
