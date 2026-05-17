import Constants from '../utils/constants.js';

const ReviewService = {
    getAllReviews: function(success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'reviews',
            type: 'GET',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    },
    getReviewById: function(id, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'reviews/' + id,
            type: 'GET',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    },
    addReview: function(review, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'reviews',
            type: 'POST',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            data: JSON.stringify(review),
            contentType: 'application/json',
            success,
            error
        });
    },
    updateReview: function(id, review, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'reviews/' + id,
            type: 'PUT',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            data: JSON.stringify(review),
            contentType: 'application/json',
            success,
            error
        });
    },
    deleteReview: function(id, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'reviews/' + id,
            type: 'DELETE',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    },
    getLatestReview: function(success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'reviews/latest',
            type: 'GET',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    }
};

export default ReviewService; 