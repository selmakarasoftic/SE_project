$(document).ready(function () {
    // Initialize SPApp
    const app = $.spapp({
        templateDir: "./pages/",
        defaultView: "home",
        pageNotFound: "404"
    });

    // Define Routes
    const routes = [
        { view: "home", load: "home.html", init: typeof initHome === "function" ? initHome : null },
        { view: "cars", load: "cars.html", init: typeof initCars === "function" ? initCars : null },
        { view: "reviews", load: "reviews.html", init: typeof initReviews === "function" ? initReviews : null },
        { view: "meetups", load: "meetups.html", init: typeof initMeetups === "function" ? initMeetups : null },
        { view: "profile", load: "profile.html", init: typeof initProfile === "function" ? initProfile : null },
        { view: "users", load: "users.html", init: typeof initAdminPage === "function" ? initAdminPage : null },
        { view: "gallery", load: "gallery.html", init: typeof initGallery === "function" ? initGallery : null }
    
    ];

    // Loop through and add routes dynamically
    routes.forEach(route => {
        app.route({
            view: route.view,
            load: route.load,
            onReady: function () {
                if (route.init) route.init();
            }
        });
    });

    // Run the SPA only once
    app.run();
});
