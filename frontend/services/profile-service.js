import Constants from '../utils/constants.js';

const ProfileService = {
    getProfile: function(userId, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'users/' + userId,
            type: 'GET',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    },
    updateProfile: function(profile, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'profile',
            type: 'PUT',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            data: JSON.stringify(profile),
            contentType: 'application/json',
            success,
            error
        });
    }
};

export default ProfileService; 