import Constants from '../utils/constants.js';

const UserService = {
    init: function() {
        var token = localStorage.getItem("user_token");
        if (!token) {
            //nema tokena idi na login
            window.location.replace("pages/login.html");
            return;
        }
        
        try {
            const user = Utils.parseJwt(token).user;
            if (!user || !user.role) {
                // nesto nije ok s credentials idi na login
                localStorage.clear();
                window.location.replace("pages/login.html");
                return;
            }
            
            // ako sve valja prikazi sve
            document.getElementById("app").style.display = "block";
            this.generateMenuItems();
            
            // ako je na loginu idi na home
            if (window.location.pathname.includes("login.html")) {
                window.location.hash = '#home';
            }
        } catch (e) {
            console.error("Error in init:", e);
            localStorage.clear();
            window.location.replace("pages/login.html");
        }
    },

    login: function(entity) {
        console.log("Attempting login with:", entity);

        $.ajax({
            url: Constants.PROJECT_BASE_URL + "auth/login",
            type: "POST",
            data: JSON.stringify(entity),
            contentType: "application/json",
            dataType: "json",
            success: function(result) {
                toastr.clear();
                console.log("Full login response:", result);
                
                if (result.data && result.data.token) {
                    // sacuvaj token ovo mi treba za kasnije 
                    localStorage.setItem("user_token", result.data.token);
                    
                    //sacuvaj i data
                    const userData = {
                        id: result.data.id,
                        username: result.data.username,
                        role: result.data.role,
                        email: result.data.email
                    };
                    console.log("Storing user data:", userData);
                    localStorage.setItem("user_data", JSON.stringify(userData));
                    
                    console.log("Login successful, stored token and user data");
                    console.log("Stored user data:", JSON.parse(localStorage.getItem("user_data")));
                    toastr.success("Login successful!");
                    
                    // prvo idi na index 
                    window.location.href = "../index.html";
                    // treba mi timeout da bi se fino ucitala stranica 
                    setTimeout(() => {
                        window.location.hash = "#home";
                    }, 100);
                } else {
                    console.error("Login failed - invalid response structure:", result);
                    toastr.error(result.error || result.message || "Login failed");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                toastr.clear();
                console.error("Login error:", XMLHttpRequest.responseText);
                let errorResponse = XMLHttpRequest?.responseText;
                try {
                    const errorJson = JSON.parse(errorResponse);
                    errorResponse = errorJson.error || errorJson.message || errorResponse;
                } catch (e) {
                }
                toastr.error(errorResponse ? errorResponse : 'Login failed. Please try again.');
            }
        });
    },

    register: function(username, email, password) {
        const entity = {
            username: username,
            email: email,
            password: password,
            role: 'guest'  //dodijeli random rolu 
        };

        console.log("Attempting registration with:", entity);

        $.ajax({
            url: Constants.PROJECT_BASE_URL + "auth/register",
            type: "POST",
            data: JSON.stringify(entity),
            contentType: "application/json",
            dataType: "json",
            success: function(result) {
                toastr.clear();
                console.log("Registration response:", result);
                
                if (result.data) {
                    // Store the token and user data if available
                    if (result.data.token) {
                        localStorage.setItem("user_token", result.data.token);
                        localStorage.setItem("user_data", JSON.stringify(result.data.user));
                    }
                    
                    console.log("Registration successful");
                    toastr.success("Registration successful!");
                    
                    // First redirect to index.html
                    window.location.href = "../index.html";
                    // Then set the hash after a short delay to ensure the page is loaded
                    setTimeout(() => {
                        window.location.hash = "#home";
                    }, 100);
                } else {
                    toastr.error(result.error || result.message || "Registration failed");
                    console.log("Registration failed based on backend response:", result);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                toastr.clear();
                console.error("Registration error:", XMLHttpRequest.responseText);
                let errorResponse = XMLHttpRequest?.responseText;
                try {
                    const errorJson = JSON.parse(errorResponse);
                    errorResponse = errorJson.error || errorJson.message || errorResponse;
                } catch (e) {
                }
                toastr.error(errorResponse ? errorResponse : 'Registration failed. Please try again.');
            }
        });
    },

    logout: function() {
        localStorage.clear();
        window.location.replace("pages/login.html");
    },

    generateMenuItems: function() {
        const token = localStorage.getItem("user_token");
        const userData = localStorage.getItem("user_data");
        
        console.log("generateMenuItems - Token:", token);
        console.log("generateMenuItems - User Data:", userData);
        
        if (!token || !userData) {
            console.log("No token or user data found, redirecting to login");
            localStorage.clear();
            window.location.replace("pages/login.html");
            return;
        }

        try {
            const user = JSON.parse(userData);
            console.log("Parsed user data:", user);
            
            if (!user || !user.role) {
                console.log("Invalid user data, redirecting to login");
                localStorage.clear();
                window.location.replace("pages/login.html");
                return;
            }

            let navItems = '';
            
            // Common menu items for all users
            navItems += '<a href="#home">Home</a>';
            navItems += '<a href="#cars">Cars</a>';
            navItems += '<a href="#reviews">Reviews</a>';
            navItems += '<a href="#meetups">Meetups</a>';
            navItems += '<a href="#gallery">Gallery</a>';
            navItems += '<a href="#profile">Profile</a>';
            
            // Admin specific menu items - only show if role is exactly "admin"
            if (user.role === "admin") {
                navItems += '<a href="#users" class="admin-only">Admin Panel</a>';
            }
            
            // Logout button for all users
            navItems += '<a href="#" onclick="UserService.logout()">Logout</a>';
            
            // Update the navigation
            document.getElementById('mainNav').innerHTML = navItems;
            
            // Set initial hash if not set
            if (!window.location.hash) {
                window.location.hash = '#home';
            }
        } catch (e) {
            console.error("Error generating menu items:", e);
            localStorage.clear();
            window.location.replace("pages/login.html");
        }
    },

    getAllUsers: function(success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'users',
            type: 'GET',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    }
};

export default UserService; 