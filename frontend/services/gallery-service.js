import Constants from '../utils/constants.js';

const GalleryService = {
    getAllGalleryItems: function(success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'gallery',
            type: 'GET',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    },
    getGalleryItemById: function(id, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'gallery/' + id,
            type: 'GET',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    },
    addGalleryItem: function(galleryItem, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'gallery',
            type: 'POST',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            data: galleryItem,
            processData: false,
            contentType: false,
            success,
            error
        });
    },
    updateGalleryItem: function(id, galleryItem, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'gallery/' + id,
            type: 'PUT',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            data: galleryItem,
            processData: false,
            contentType: false,
            success,
            error
        });
    },
    deleteGalleryItem: function(id, success, error) {
        $.ajax({
            url: Constants.PROJECT_BASE_URL + 'gallery/' + id,
            type: 'DELETE',
            headers: { 'Authorization': localStorage.getItem('user_token') },
            success,
            error
        });
    }
};

export default GalleryService;
