import UserService from '../../services/user-service.js';

$(document).ready(function() {
    $("#login-form").validate({
        rules: {
            loginInput: {
                required: true
            },
            password: {
                required: true,
                minlength: 6
            }
        },
        messages: {
            loginInput: {
                required: "Please enter your username or email"
            },
            password: {
                required: "Please enter your password",
                minlength: "Password must be at least 6 characters long"
            }
        },
        submitHandler: function(form, event) {
            event.preventDefault();

            const entity = {
                email: $("#loginInput").val().trim(),
                password: $("#loginPassword").val().trim()
            };

            UserService.login(entity);
            return false;
        }
    });
});