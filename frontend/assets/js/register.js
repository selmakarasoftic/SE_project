import UserService from '../../services/user-service.js';

$(document).ready(function() {
    $("#register-form").validate({
        rules: {
            username: {
                required: true,
                minlength: 3
            },
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 6
            },
            confirmPassword: {
                required: true,
                equalTo: "#registerPassword"
            }
        },
        messages: {
            username: {
                required: "Please enter a username",
                minlength: "Username must be at least 3 characters long"
            },
            email: {
                required: "Please enter an email address",
                email: "Please enter a valid email address"
            },
            password: {
                required: "Please enter a password",
                minlength: "Password must be at least 6 characters long"
            },
            confirmPassword: {
                required: "Please confirm your password",
                equalTo: "Passwords do not match"
            }
        },
        submitHandler: function(form, event) {
            event.preventDefault();
            registerUser();
            return false;
        }
    });
});

function registerUser() {
    const username = $("#registerUsername").val().trim();
    const email = $("#registerEmail").val().trim();
    const password = $("#registerPassword").val().trim();

    UserService.register(username, email, password);
}