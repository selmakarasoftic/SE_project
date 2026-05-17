import CarService from '../../services/car-service.js';
import ReviewService from '../../services/review-service.js';
import MeetupService from '../../services/meetup-service.js';

window.initHome = function () {
    renderHome();
};

function renderHome() {
    const userDataString = localStorage.getItem("user_data");
    const welcomeMessage = document.getElementById("welcomeMessage");
    const adminInfo = document.getElementById("adminInfo");

    let user = null;
    if (userDataString) {
        try {
            user = JSON.parse(userDataString);
        } catch (e) {
            console.error("Error parsing user data:", e);
            localStorage.removeItem("user_data");
        }
    }

    if (user && user.role === "admin") {
        if (welcomeMessage) {
            welcomeMessage.innerHTML = `👋 Welcome back, <strong>Admin ${user.username}</strong>!`;
        }
        if (adminInfo) adminInfo.style.display = "block";
        setupAdminButtons();
    } else {
        if (welcomeMessage) {
            welcomeMessage.innerHTML = `👋 Welcome, <strong>${user && user.username ? user.username : "Guest"}</strong>!`;
        }
        if (adminInfo) adminInfo.style.display = "none";
    }

    renderHighlights();
}

function renderHighlights() {
    const highlightsContainer = document.getElementById("latestHighlights");
    if (!highlightsContainer) return;

    highlightsContainer.innerHTML = "<p>Loading highlights...</p>";

    let highlights = [];

    const fetchLatestCar = new Promise((resolve) => {
        CarService.getLatestCar(
            (car) => {
                if (car) {
                    highlights.push({
                        title: `🚗 ${car.model}`,
                        description: `Latest car added: <strong>${car.model}</strong> (${car.year})`
                    });
                }
                resolve();
            },
            () => resolve()
        );
    });

    const fetchLatestReview = new Promise((resolve) => {
        ReviewService.getLatestReview(
            (review) => {
                if (review) {
                    highlights.push({
                        title: `⭐ ${review.title}`,
                        description: `<strong>${review.reviewer_name}</strong> says: "${review.review_text}"`
                    });
                }
                resolve();
            },
            () => resolve()
        );
    });

    const fetchLatestMeetup = new Promise((resolve) => {
        MeetupService.getLatestMeetup(
            (meetup) => {
                if (meetup) {
                    highlights.push({
                        title: `📅 ${meetup.title}`,
                        description: `Next Meetup: <strong>${meetup.title}</strong> at ${meetup.location} on ${meetup.date}`
                    });
                }
                resolve();
            },
            () => resolve()
        );
    });

    Promise.all([fetchLatestCar, fetchLatestReview, fetchLatestMeetup]).then(() => {
        highlightsContainer.innerHTML = "";

        if (!highlights.length) {
            highlightsContainer.innerHTML = "<p>No highlights available yet!</p>";
            return;
        }

        highlights.forEach((highlight) => {
            const card = document.createElement("div");
            card.classList.add("highlight-card");
            card.innerHTML = `
                <h4>${highlight.title}</h4>
                <p>${highlight.description}</p>
            `;
            highlightsContainer.appendChild(card);
        });
    });
}

function setupAdminButtons() {
    document.querySelectorAll(".admin-actions button").forEach(button => {
        button.addEventListener("click", function () {
            const targetPage = button.getAttribute("data-page");
            if (targetPage) {
                window.location.hash = `#${targetPage}`;
            }
        });
    });
}

$(document).on("spapp:ready", function () {
    if (window.location.hash === "#home") {
        initHome();
    }
});

$(document).on("spapp:changed", function (e, page) {
    if (page === "home") {
        initHome();
    }
});