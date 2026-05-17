import Constants from '../utils/constants.js';

const CarService = {
    getAllCars: function(success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'cars',
            type: 'GET',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    },
    getCarById: function(id, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'cars/' + id,
            type: 'GET',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    },
    addCar: function(car, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'cars',
            type: 'POST',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            data: JSON.stringify(car),
            contentType: 'application/json',
            success,
            error
        });
    },
    updateCar: function(id, car, success, error) {
        const ajaxOptions = {
            url: Constants.PROJECT_BASE_URL + 'cars/' + id,
            type: 'PUT',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        };

        if (car instanceof FormData) {
            ajaxOptions.data = car;
            ajaxOptions.processData = false;
            ajaxOptions.contentType = false;
        } else {
            ajaxOptions.data = JSON.stringify(car);
            ajaxOptions.contentType = 'application/json';
        }

        $.ajax(ajaxOptions);
    },
    deleteCar: function(id, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'cars/' + id,
            type: 'DELETE',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    },
    getLatestCar: function(success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'cars/latest',
            type: 'GET',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    }
};

export default CarService; 