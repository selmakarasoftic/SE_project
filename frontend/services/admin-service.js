import Constants from '../utils/constants.js';

const AdminService = {
    getAllUsers: function(success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'users',
            type: 'GET',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    },
    getUserById: function(id, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'users/' + id,
            type: 'GET',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    },
    updateUserRole: function(id, role, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'users/' + id,
            type: 'PUT',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            data: JSON.stringify({ role }),
            contentType: 'application/json',
            success,
            error
        });
    },
    deleteUser: function(id, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'users/' + id,
            type: 'DELETE',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    }
};

export default AdminService; 