<?php

require_once 'CarService.php';
require_once 'ReviewService.php';
require_once 'UserService.php';
require_once 'GalleryService.php';
require_once 'MeetupService.php';

$car_service = new CarService();
$review_service = new ReviewService();
$user_service = new UserService();
$gallery_service = new GalleryService();
$meetup_service = new MeetupService();

try {
    echo "<h2>Testing CarService</h2>";

    // Test create car
    $new_car = [
        "user_id" => 12,
        "model" => "Honda Civic",
        "year" => 2019,
        "engine" => "2.0L VTEC",
        "horsepower" => 158,
        "image_url" => "https://example.com/honda.jpg"
    ];
    $car_service->createCar($new_car);

    // Test get all cars
    $cars = $car_service->getAllCars();
    echo "<pre>";
    print_r($cars);
    echo "</pre>";

    echo "<h2>Testing ReviewService</h2>";

    // Test create review
    $new_review = [
        "user_id" => 12,
        "car_id" => 1,
        "title" => "Great ride!",
        "review_text" => "The car drives smoothly and looks amazing.",
        "rating" => 5
    ];
    $review_service->createReview($new_review);

    // Test get all reviews
    $reviews = $review_service->getAllReviews();
    echo "<pre>";
    print_r($reviews);
    echo "</pre>";

    echo "<h2>Testing UserService</h2>";

    // Test register new user
    $new_user = [
        "username" => "testuser1234",
        "email" => "testuser1234@example.com",
        "password" => "securepassword"
    ];
    $user_service->registerUser($new_user);

    // Test get all users
    $users = $user_service->getAllUsers();
    echo "<pre>";
    print_r($users);
    echo "</pre>";

    echo "<h2>Testing GalleryService</h2>";

    // Test create gallery item
    $new_gallery_item = [
        "user_id" => 12,
        "title" => "Cool Car Pic",
        "image_url" => "https://example.com/carphoto.jpg"
    ];
    $gallery_service->createGalleryItem($new_gallery_item);

    // Test get all gallery items
    $gallery_items = $gallery_service->getAllGalleryItems();
    echo "<pre>";
    print_r($gallery_items);
    echo "</pre>";

    echo "<h2>Testing MeetupService</h2>";

    // Test create meetup
    $new_meetup = [
        "title" => "Car Lovers Gathering",
        "date" => "2025-06-15",
        "location" => "City Park",
        "description" => "Meet other car enthusiasts and show off your rides.",
        "organizer_id" => 12
    ];
    $meetup_service->createMeetup($new_meetup);

    // Test get all meetups
    $meetups = $meetup_service->getAllMeetups();
    echo "<pre>";
    print_r($meetups);
    echo "</pre>";

} catch (Exception $e) {
    echo "<strong>Error: </strong>" . $e->getMessage();
}

?>
