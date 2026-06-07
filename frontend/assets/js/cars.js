import CarService from '../../services/car-service.js';

let allCars = [];

function initCars() {
    const userData = localStorage.getItem("user_data");
    const user = userData ? JSON.parse(userData) : null;
    const form = document.getElementById("addCarSection");

    // Ako nema logovanog usera, sakrij add car sekciju
    if (!user && form) {
        form.style.display = "none";
    }

    setupFilters();
    fetchAndRenderCars();
}

function setupFilters() {
    const searchInput = document.getElementById("searchInput");
    const minYear = document.getElementById("minYear");
    const maxYear = document.getElementById("maxYear");
    const minHorsepower = document.getElementById("minHorsepower");
    const sortOption = document.getElementById("sortOption");
    const resetBtn = document.getElementById("resetFiltersBtn");

    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (minYear) minYear.addEventListener("input", applyFilters);
    if (maxYear) maxYear.addEventListener("input", applyFilters);
    if (minHorsepower) minHorsepower.addEventListener("input", applyFilters);
    if (sortOption) sortOption.addEventListener("change", applyFilters);

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            if (minYear) minYear.value = "";
            if (maxYear) maxYear.value = "";
            if (minHorsepower) minHorsepower.value = "";
            if (sortOption) sortOption.value = "";

            applyFilters();
        });
    }
}

function fetchAndRenderCars() {
    CarService.getAllCars(
        function (result) {
            if (Array.isArray(result)) {
                allCars = result;
            } else if (result && result.data && Array.isArray(result.data)) {
                allCars = result.data;
            } else {
                console.error("Invalid response format:", result);
                alert("Failed to fetch cars: Invalid response format");
                return;
            }

            applyFilters();
        },
        function (xhr) {
            console.error("Failed to fetch cars:", xhr.responseText);
            alert("Failed to fetch cars: " + xhr.responseText);
        }
    );
}

function applyFilters() {
    let filteredCars = [...allCars];

    const searchValue = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
    const minYearValue = document.getElementById("minYear")?.value;
    const maxYearValue = document.getElementById("maxYear")?.value;
    const minHorsepowerValue = document.getElementById("minHorsepower")?.value;
    const sortValue = document.getElementById("sortOption")?.value || "";

    if (searchValue) {
        filteredCars = filteredCars.filter(car =>
            (car.model || "").toLowerCase().includes(searchValue) ||
            (car.engine || "").toLowerCase().includes(searchValue) ||
            (car.uploader || "").toLowerCase().includes(searchValue)
        );
    }

    if (minYearValue) {
        filteredCars = filteredCars.filter(car => Number(car.year) >= Number(minYearValue));
    }

    if (maxYearValue) {
        filteredCars = filteredCars.filter(car => Number(car.year) <= Number(maxYearValue));
    }

    if (minHorsepowerValue) {
        filteredCars = filteredCars.filter(car => Number(car.horsepower) >= Number(minHorsepowerValue));
    }

    switch (sortValue) {
        case "year-desc":
            filteredCars.sort((a, b) => Number(b.year) - Number(a.year));
            break;
        case "year-asc":
            filteredCars.sort((a, b) => Number(a.year) - Number(b.year));
            break;
        case "hp-desc":
            filteredCars.sort((a, b) => Number(b.horsepower) - Number(a.horsepower));
            break;
        case "hp-asc":
            filteredCars.sort((a, b) => Number(a.horsepower) - Number(b.horsepower));
            break;
        case "model-asc":
            filteredCars.sort((a, b) => (a.model || "").localeCompare(b.model || ""));
            break;
        case "model-desc":
            filteredCars.sort((a, b) => (b.model || "").localeCompare(a.model || ""));
            break;
        default:
            break;
    }

    renderCars(filteredCars);
}

function renderCars(cars) {
    const container = document.getElementById("carsContainer");
    const emptyState = document.getElementById("carsEmptyState");

    if (!container) return;

    container.innerHTML = "";

    if (!cars || cars.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        return;
    } else {
        if (emptyState) emptyState.style.display = "none";
    }

    cars.forEach((car) => {
        const card = document.createElement("div");
        card.classList.add("car-card");

        // klik na card vodi na reviews za taj auto
        card.addEventListener("click", function (e) {
            if (
                e.target.closest(".admin-buttons") ||
                e.target.closest(".prev") ||
                e.target.closest(".next") ||
                e.target.tagName === "BUTTON"
            ) {
                return;
            }

            localStorage.setItem("selected_car_id", car.id);
            window.location.hash = "#reviews";
        });

        // Create Image Gallery
        const galleryDiv = document.createElement("div");
        galleryDiv.classList.add("image-gallery");

        const images = car.image_url ? [car.image_url] : [];

        images.forEach((imgSrc, idx) => {
            const img = document.createElement("img");
            img.src = imgSrc;
            img.alt = car.model || "Car image";
            if (idx === 0) img.classList.add("active");
            galleryDiv.appendChild(img);
        });

        if (images.length > 1) {
            const prevBtn = document.createElement("button");
            prevBtn.classList.add("prev");
            prevBtn.innerHTML = "&#10094;";
            prevBtn.onclick = (e) => {
                e.stopPropagation();
                prevImage(galleryDiv);
            };

            const nextBtn = document.createElement("button");
            nextBtn.classList.add("next");
            nextBtn.innerHTML = "&#10095;";
            nextBtn.onclick = (e) => {
                e.stopPropagation();
                nextImage(galleryDiv);
            };

            galleryDiv.appendChild(prevBtn);
            galleryDiv.appendChild(nextBtn);
        }

        const detailsDiv = document.createElement("div");
        detailsDiv.classList.add("car-details");
        detailsDiv.innerHTML = `
            <h3>${car.model}</h3>
            <p>Year: ${car.year}</p>
            <p>Engine: ${car.engine}</p>
            <p>Horsepower: ${car.horsepower}</p>
            <p>Added by: ${car.uploader || 'Unknown'}</p>
        `;

        const userData = localStorage.getItem("user_data");
        const user = userData ? JSON.parse(userData) : null;

        // admin dugmad ostaju
        if (user && user.role === "admin") {
            const buttonContainer = document.createElement("div");
            buttonContainer.classList.add("admin-buttons");

            const editBtn = document.createElement("button");
            editBtn.classList.add("edit-btn-cars");
            editBtn.textContent = "✏️ Edit";
            editBtn.onclick = (e) => {
                e.stopPropagation();
                showEditForm(car);
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("delete-btn-cars");
            deleteBtn.textContent = "🗑️ Delete";
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteCar(car.id);
            };

            buttonContainer.appendChild(editBtn);
            buttonContainer.appendChild(deleteBtn);
            detailsDiv.appendChild(buttonContainer);
        }

        if (images.length > 0) {
            card.appendChild(galleryDiv);
        }

        card.appendChild(detailsDiv);
        container.appendChild(card);
    });
}

function addNewCar() {
    const model = document.getElementById("carModel").value.trim();
    const year = document.getElementById("carYear").value;
    const engine = document.getElementById("engine").value.trim();
    const horsepower = document.getElementById("horsepower").value;
    const imageInput = document.getElementById("carImages");

    const userDataRaw = localStorage.getItem("user_data");
    if (!userDataRaw) {
        alert("You must be logged in to add a car.");
        return;
    }

    const userData = JSON.parse(userDataRaw);
    const userId = userData.id;

    if (!model || !year || !engine || !horsepower || imageInput.files.length === 0) {
        alert("Please fill all fields and add at least one image!");
        return;
    }

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("model", model);
    formData.append("year", year);
    formData.append("engine", engine);
    formData.append("horsepower", horsepower);
    formData.append("image", imageInput.files[0]);

    fetch("/backend/cars", {
        method: "POST",
        body: formData,
        headers: {
            "Authorization": localStorage.getItem("user_token")
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Car added successfully!");

                document.getElementById("carModel").value = "";
                document.getElementById("carYear").value = "";
                document.getElementById("engine").value = "";
                document.getElementById("horsepower").value = "";
                document.getElementById("carImages").value = "";

                fetchAndRenderCars();
            } else {
                alert("Failed to add car: " + (data.message || "Unknown error"));
            }
        })
        .catch(error => {
            alert("Failed to add car: " + error);
        });
}

function deleteCar(id) {
    if (!confirm("Are you sure you want to delete this car?")) return;

    CarService.deleteCar(
        id,
        function (result) {
            if (result && result.success) {
                fetchAndRenderCars();
                alert("Car deleted successfully!");
            } else {
                alert("Failed to delete car: " + (result.message || "Unknown error"));
            }
        },
        function (xhr) {
            alert("Failed to delete car: " + xhr.responseText);
        }
    );
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function prevImage(gallery) {
    const images = gallery.querySelectorAll("img");
    const activeImage = gallery.querySelector("img.active");
    let currentIndex = Array.from(images).indexOf(activeImage);
    activeImage.classList.remove("active");
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    images[currentIndex].classList.add("active");
}

function nextImage(gallery) {
    const images = gallery.querySelectorAll("img");
    const activeImage = gallery.querySelector("img.active");
    let currentIndex = Array.from(images).indexOf(activeImage);
    activeImage.classList.remove("active");
    currentIndex = (currentIndex + 1) % images.length;
    images[currentIndex].classList.add("active");
}

function showEditForm(car) {
    const modal = document.createElement("div");
    modal.classList.add("modal-overlay");

    modal.innerHTML = `
        <div class="modal-content">
            <h3>Edit Car</h3>
            <form id="editCarForm">
                <input type="text" id="editCarModel" placeholder="Car Model" value="${car.model}" required>
                <input type="number" id="editCarYear" placeholder="Year" min="1886" max="2026" value="${car.year}" required>
                <input type="text" id="editEngine" placeholder="Engine" value="${car.engine}" required>
                <input type="number" id="editHorsepower" placeholder="Horsepower" min="1" value="${car.horsepower}" required>
                <input type="file" id="editCarImages" accept="image/*">
                <div class="modal-buttons">
                    <button type="submit">Save Changes</button>
                    <button type="button" id="cancelEditCarBtn">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("editCarForm").addEventListener("submit", function (e) {
        e.preventDefault();
        updateCar(car.id);
    });

    document.getElementById("cancelEditCarBtn").addEventListener("click", function () {
        closeModal();
    });
}

function closeModal() {
    const modal = document.querySelector(".modal-overlay");
    if (modal) {
        modal.remove();
    }
}

function updateCar(carId) {
    const model = document.getElementById("editCarModel").value.trim();
    const year = document.getElementById("editCarYear").value;
    const engine = document.getElementById("editEngine").value.trim();
    const horsepower = document.getElementById("editHorsepower").value;
    const imageInput = document.getElementById("editCarImages");

    if (!model || !year || !engine || !horsepower) {
        alert("Please fill all required fields!");
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
        function (result) {
            if (result && result.success) {
                alert("Car updated successfully!");
                closeModal();
                fetchAndRenderCars();
            } else {
                alert("Failed to update car: " + (result.message || "Unknown error"));
            }
        },
        function (xhr) {
            alert("Failed to update car: " + xhr.responseText);
        }
    );
}

$(document).ready(function () {
    if ($("#car-form").length) {
        $("#car-form").validate({
            rules: {
                model: {
                    required: true,
                    minlength: 2
                },
                year: {
                    required: true,
                    number: true,
                    min: 1900,
                    max: new Date().getFullYear()
                },
                engine: {
                    required: true
                },
                horsepower: {
                    required: true,
                    number: true,
                    min: 1
                },
                image: {
                    required: true,
                    accept: "image/*"
                }
            },
            messages: {
                model: {
                    required: "Please enter the car model",
                    minlength: "Model name must be at least 2 characters long"
                },
                year: {
                    required: "Please enter the year",
                    number: "Please enter a valid year",
                    min: "Year must be 1900 or later",
                    max: "Year cannot be in the future"
                },
                engine: {
                    required: "Please enter the engine type"
                },
                horsepower: {
                    required: "Please enter the horsepower",
                    number: "Please enter a valid number",
                    min: "Horsepower must be greater than 0"
                },
                image: {
                    required: "Please select an image",
                    accept: "Please select a valid image file"
                }
            },
            submitHandler: function (form, event) {
                event.preventDefault();
                addNewCar();
                return false;
            }
        });
    }

    if (window.location.hash === "#cars") {
        initCars();
    }
});

window.addNewCar = addNewCar;
window.initCars = initCars;
window.closeModal = closeModal;