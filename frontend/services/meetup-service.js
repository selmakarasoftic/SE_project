import Constants from '../utils/constants.js';

const MeetupService = {
    getAllMeetups: function(success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'meetups',
            type: 'GET',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    },
    getMeetupById: function(id, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'meetups/' + id,
            type: 'GET',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    },
    addMeetup: function(meetup, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'meetups',
            type: 'POST',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            data: JSON.stringify(meetup),
            contentType: 'application/json',
            success,
            error
        });
    },
    updateMeetup: function(id, meetup, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'meetups/' + id,
            type: 'PUT',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            data: JSON.stringify(meetup),
            contentType: 'application/json',
            success,
            error
        });
    },
    deleteMeetup: function(id, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'meetups/' + id,
            type: 'DELETE',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    },
    getLatestMeetup: function(success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'meetups/latest',
            type: 'GET',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    }
};

export default MeetupService; 