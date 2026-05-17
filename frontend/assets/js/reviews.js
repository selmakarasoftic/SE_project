import ReviewService from '../../services/review-service.js';

let allReviews = [];

window.initReviews = function () {
    setupReviewFilters();
    fetchAndRenderReviews();
    showOrHideReviewForm();
};

function setupReviewFilters() {
    const searchInput = document.getElementById("reviewSearchInput");
    const typeFilter = document.getElementById("reviewTypeFilter");
    const ratingFilter = document.getElementById("reviewRatingFilter");
    const resetBtn = document.getElementById("resetReviewFiltersBtn");

    if (searchInput) searchInput.addEventListener("input", applyReviewFilters);
    if (typeFilter) typeFilter.addEventListener("change", applyReviewFilters);
    if (ratingFilter) ratingFilter.addEventListener("change", applyReviewFilters);

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            if (typeFilter) typeFilter.value = "";
            if (ratingFilter) ratingFilter.value = "";

            applyReviewFilters();
        });
    }
}

function fetchAndRenderReviews() {
    ReviewService.getAllReviews(
        function(result) {
            if (Array.isArray(result)) {
                allReviews = result;
            } else if (result && result.data && Array.isArray(result.data)) {
                allReviews = result.data;
            } else {
                console.error("Invalid response format:", result);
                alert("Failed to fetch reviews: Invalid response format");
                return;
            }

            console.log("Fetched reviews:", allReviews);
            applyReviewFilters();
        },
        function(xhr) {
            console.error("Failed to fetch reviews:", xhr.responseText);
            alert("Failed to fetch reviews: " + xhr.responseText);
        }
    );
}

function applyReviewFilters() {
    let filteredReviews = [...allReviews];

    const searchValue = (document.getElementById("reviewSearchInput")?.value || "").toLowerCase().trim();
    const typeValue = document.getElementById("reviewTypeFilter")?.value || "";
    const ratingValue = document.getElementById("reviewRatingFilter")?.value || "";

    if (searchValue) {
        filteredReviews = filteredReviews.filter(review =>
            (review.title || "").toLowerCase().includes(searchValue) ||
            (review.review_text || "").toLowerCase().includes(searchValue) ||
            (review.reviewer_name || "").toLowerCase().includes(searchValue)
        );
    }

    if (typeValue) {
        filteredReviews = filteredReviews.filter(review => review.review_type === typeValue);
    }

    if (ratingValue) {
        filteredReviews = filteredReviews.filter(review => Number(review.rating) >= Number(ratingValue));
    }

    renderReviews(filteredReviews);
}

function renderReviews(reviews) {
    const container = document.getElementById("reviewsContainer");
    const emptyState = document.getElementById("reviewsEmptyState");

    if (!container) return;

    container.innerHTML = "";

    if (!reviews || reviews.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        return;
    } else {
        if (emptyState) emptyState.style.display = "none";
    }

    reviews.forEach((review) => {
        const card = document.createElement("div");
        card.classList.add("review-card");

        const reviewType = review.review_type ?? "unknown";

        card.innerHTML = `
            <h3>${review.title}</h3>
            <p><strong>Type:</strong> ${capitalizeFirstLetter(reviewType)}</p>
            <p><strong>Reviewer:</strong> ${review.reviewer_name || 'Unknown'}</p>
            <p>${review.review_text}</p>
            <p><strong>Rating:</strong> ${'⭐'.repeat(Number(review.rating || 0))}</p>
        `;

        const userData = localStorage.getItem("user_data");
        const user = userData ? JSON.parse(userData) : null;

        if (user && (user.role === "admin" || user.id === review.user_id)) {
            const buttonContainer = document.createElement("div");
            buttonContainer.classList.add("review-buttons");

            if (user.id === review.user_id) {
                const editBtn = document.createElement("button");
                editBtn.classList.add("edit-btn-review");
                editBtn.textContent = "✏️ Edit";
                editBtn.onclick = () => showEditReviewForm(review);
                buttonContainer.appendChild(editBtn);
            }

            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("delete-btn-review");
            deleteBtn.textContent = "🗑️ Delete";
            deleteBtn.onclick = () => deleteReview(review.id);
            buttonContainer.appendChild(deleteBtn);

            card.appendChild(buttonContainer);
        }

        container.appendChild(card);
    });
}

function showOrHideReviewForm() {
    const form = document.querySelector(".add-review");
    const userData = localStorage.getItem("user_data");
    const user = userData ? JSON.parse(userData) : null;

    if (form && user && (user.role === "admin" || user.role === "guest")) {
        form.style.display = "block";
    } else if (form) {
        form.style.display = "none";
    }
}

window.addReview = function () {
    const title = document.getElementById("reviewTitle").value.trim();
    const content = document.getElementById("reviewContent").value.trim();
    const rating = document.getElementById("reviewRating").value;
    const reviewType = document.getElementById("reviewType").value;

    const userDataRaw = localStorage.getItem("user_data");
    if (!userDataRaw) {
        alert("You must be logged in to add a review.");
        return;
    }

    const userData = JSON.parse(userDataRaw);
    const userId = userData.id;
    const reviewerName = userData.username;

    if (!title || !content) {
        alert("Please fill out all fields!");
        return;
    }

    const selectedCarId = localStorage.getItem("selected_car_id");

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("title", title);
    formData.append("review_text", content);
    formData.append("rating", rating);
    formData.append("reviewer_name", reviewerName);
    formData.append("review_type", reviewType);

    if (reviewType === "car" && selectedCarId) {
        formData.append("car_id", selectedCarId);
    } else {
        formData.append("car_id", "");
    }

    console.log("Submitting review type:", reviewType);
    for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
    }

    fetch("/SelmaKarasoftic/WebProgramming/backend/reviews", {
        method: "POST",
        body: formData,
        headers: {
            "Authorization": localStorage.getItem("user_token")
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Review added successfully!");
            fetchAndRenderReviews();

            document.getElementById("reviewTitle").value = "";
            document.getElementById("reviewContent").value = "";
            document.getElementById("reviewRating").value = "5";
            document.getElementById("reviewType").value = "car";
        } else {
            alert("Failed to add review: " + (data.message || "Unknown error"));
        }
    })
    .catch(error => {
        alert("Failed to add review: " + error);
    });
};

function showEditReviewForm(review) {
    const modal = document.createElement("div");
    modal.classList.add("modal-overlay");

    const currentType = review.review_type ?? "unknown";

    modal.innerHTML = `
        <div class="modal-content">
            <h3>Edit Review</h3>
            <form id="editReviewForm">
                <select id="editReviewType" required>
                    <option value="car" ${currentType === "car" ? "selected" : ""}>Car</option>
                    <option value="part" ${currentType === "part" ? "selected" : ""}>Part</option>
                </select>

                <input type="text" id="editReviewTitle" placeholder="Review Title" value="${review.title}" required>
                <textarea id="editReviewContent" placeholder="Your Review" required>${review.review_text}</textarea>

                <select id="editReviewRating" required>
                    <option value="5" ${review.rating == 5 ? 'selected' : ''}>⭐⭐⭐⭐⭐</option>
                    <option value="4" ${review.rating == 4 ? 'selected' : ''}>⭐⭐⭐⭐☆</option>
                    <option value="3" ${review.rating == 3 ? 'selected' : ''}>⭐⭐⭐☆☆</option>
                    <option value="2" ${review.rating == 2 ? 'selected' : ''}>⭐⭐☆☆☆</option>
                    <option value="1" ${review.rating == 1 ? 'selected' : ''}>⭐☆☆☆☆</option>
                </select>

                <div class="modal-buttons">
                    <button type="submit">Save Changes</button>
                    <button type="button" onclick="closeModal()">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("editReviewForm").addEventListener("submit", function(e) {
        e.preventDefault();
        updateReview(review.id, review.car_id || null);
    });
}

function closeModal() {
    const modal = document.querySelector(".modal-overlay");
    if (modal) {
        modal.remove();
    }
}

function updateReview(reviewId, existingCarId = null) {
    const title = document.getElementById("editReviewTitle").value.trim();
    const content = document.getElementById("editReviewContent").value.trim();
    const rating = document.getElementById("editReviewRating").value;
    const reviewType = document.getElementById("editReviewType").value;

    if (!title || !content) {
        alert("Please fill all required fields!");
        return;
    }

    const selectedCarId = localStorage.getItem("selected_car_id");

    let finalCarId = null;
    if (reviewType === "car") {
        finalCarId = existingCarId || selectedCarId || null;
    }

    const reviewData = {
        title: title,
        review_text: content,
        rating: parseInt(rating),
        review_type: reviewType,
        car_id: finalCarId
    };

    console.log("Updating review with data:", reviewData);

    ReviewService.updateReview(
        reviewId,
        reviewData,
        function(result) {
            if (result && result.success) {
                alert("Review updated successfully!");
                closeModal();
                fetchAndRenderReviews();
            } else {
                alert("Failed to update review: " + (result.message || "Unknown error"));
            }
        },
        function(xhr) {
            alert("Failed to update review: " + xhr.responseText);
        }
    );
}

function deleteReview(id) {
    if (!confirm("Are you sure you want to delete this review?")) return;

    ReviewService.deleteReview(
        id,
        function(result) {
            if (result && result.success) {
                fetchAndRenderReviews();
                alert("Review deleted successfully!");
            } else {
                alert("Failed to delete review: " + (result.message || "Unknown error"));
            }
        },
        function(xhr) {
            alert("Failed to delete review: " + xhr.responseText);
        }
    );
}

function capitalizeFirstLetter(value) {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
}

$(document).ready(function() {
    if ($("#review-form").length) {
        $("#review-form").validate({
            rules: {
                reviewTitle: {
                    required: true,
                    minlength: 3
                },
                reviewContent: {
                    required: true,
                    minlength: 10
                },
                reviewRating: {
                    required: true,
                    number: true,
                    min: 1,
                    max: 5
                }
            },
            messages: {
                reviewTitle: {
                    required: "Please enter a title for your review",
                    minlength: "Title must be at least 3 characters long"
                },
                reviewContent: {
                    required: "Please write your review",
                    minlength: "Review must be at least 10 characters long"
                },
                reviewRating: {
                    required: "Please select a rating",
                    number: "Please enter a valid number",
                    min: "Rating must be at least 1",
                    max: "Rating cannot be more than 5"
                }
            },
            submitHandler: function(form, event) {
                event.preventDefault();
                addReview();
                return false;
            }
        });
    }

    if (window.location.hash === "#reviews") {
        initReviews();
    }
});

window.closeModal = closeModal;