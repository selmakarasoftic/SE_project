<?php
/*require_once 'config.php';
require_once 'BaseDao.php';
require_once 'UserDao.php';
require_once 'CarDao.php';
require_once 'ReviewDao.php';
require_once 'MeetupDao.php';
require_once 'GalleryDao.php';

echo "<pre>";

$userDao = new UserDao();
$carDao = new CarDao();
$reviewDao = new ReviewDao();
$meetupDao = new MeetupDao();
$galleryDao = new GalleryDao();

//kreiranje ili provjera usera
echo "************* Checking/Creating Test User\n";
$user = $userDao->getUserByEmail("testuser@example.com");

if (!$user) {
    $testUser = [
        "username" => "testuser",
        "email" => "testuser@example.com",
        "password" => password_hash("123456", PASSWORD_DEFAULT)
    ];
    $userDao->registerUser($testUser);
    $user = $userDao->getUserByEmail("testuser@example.com");
    echo "Test user created.\n";
} else {
    echo "Test user already exists. Skipping insert.\n";
}

$user_id = $user["id"];
print_r($user);

// dodaj usera
echo "\n************* Inserting Car \n";
$car = [
    "user_id" => $user_id,
    "model" => "TestCar 3000",
    "year" => 2025,
    "engine" => "Turbo-Electric",
    "horsepower" => 500,
    "image_url" => "assets/images/car.jpg"
];
$carDao->addCar($car);
$cars = $carDao->getCarsByUser($user_id);
$car_id = $cars[0]["id"];
print_r($cars);

// dodaj review
echo "\n************* Inserting Review \n";
$review = [
    "user_id" => $user_id,
    "car_id" => $car_id,
    "title" => "Awesome Ride",
    "review_text" => "Very smooth and futuristic.",
    "rating" => 5
];
$reviewDao->addReview($review);
$reviews = $reviewDao->getReviewsByUser($user_id);
$review_id = $reviews[0]["id"];
print_r($reviews);

// dodaj meetup
echo "\n*************Inserting Meetup \n";
$meetup = [
    "title" => "Test Meetup",
    "date" => "2025-06-10",
    "location" => "Test City",
    "description" => "For testing purposes.",
    "organizer_id" => $user_id
];
$meetupDao->addMeetup($meetup);
$meetups = $meetupDao->getMeetupsByOrganizer($user_id);
$meetup_id = $meetups[0]["id"];
print_r($meetups);

// dodaj sliku u galeriju 
echo "\n************* Inserting Gallery Item \n";
$gallery = [
    "user_id" => $user_id,
    "title" => "Test Pic",
    "image_url" => "assets/images/photo.jpg"
];
$galleryDao->addGalleryItem($gallery);
$galleryItems = $galleryDao->getGalleryItemsByUser($user_id);
$gallery_id = $galleryItems[0]["id"];
print_r($galleryItems);

// updateanje svega provjera
echo "\n*************Updating Records \n";
$newUsername = "updateduser";
$newEmail = "updated@example.com";

$existingUsers = $userDao->getAllUsers();
$usernameTaken = false;
$emailTaken = false;
foreach ($existingUsers as $u) {
    if ($u['id'] != $user_id) {
        if ($u['username'] === $newUsername) $usernameTaken = true;
        if ($u['email'] === $newEmail) $emailTaken = true;
    }
}

if ($usernameTaken || $emailTaken) {
    echo " Username or email already taken. Skipping updateUser()\n";
} else {
    $userDao->updateUser($user_id, ["username" => $newUsername, "email" => $newEmail]);
    echo "User updated successfully.\n";
}

$carDao->updateCar($car_id, [
    "model" => "Updated Model",
    "year" => 2030,
    "engine" => "Electric Pro",
    "horsepower" => 999,
    "image_url" => "updated.jpg"
]);

$reviewDao->updateReview($review_id, [
    "title" => "Updated Review",
    "review_text" => "Actually not that smooth...",
    "rating" => 3
]);

$meetupDao->updateMeetup($meetup_id, [
    "title" => "Updated Meetup",
    "date" => "2025-07-01",
    "location" => "New City",
    "description" => "Updated description."
]);

echo "Updated User:\n";
print_r($userDao->getUserById($user_id));
echo "Updated Car:\n";
print_r($carDao->getCarById($car_id));
echo "Updated Review:\n";
print_r($reviewDao->getReviewById($review_id));
echo "Updated Meetup:\n";
print_r($meetupDao->getMeetupById($meetup_id));

// get by id provjera
echo "\n*************getById Tests \n";
print_r($userDao->getUserById($user_id));
print_r($carDao->getCarById($car_id));
print_r($reviewDao->getReviewById($review_id));
print_r($meetupDao->getMeetupById($meetup_id));
print_r($galleryDao->getGalleryItemById($gallery_id));

// promjena pasworda
echo "\n************* Changing Password \n";
$newPassword = password_hash("newpassword123", PASSWORD_DEFAULT);
$userDao->changePassword($user_id, $newPassword);
echo "Password changed for user ID: $user_id\n";

// daj sve usere
echo "\n*************All Users \n";
print_r($userDao->getAllUsers());

// cound provjera
echo "\n*************Profile Stats for User ID: $user_id \n";
echo "Total Cars: " . $carDao->countCarsByUser($user_id) . "\n";
echo "Total Reviews: " . $reviewDao->countReviewsByUser($user_id) . "\n";
echo "Total Meetups: " . $meetupDao->countMeetupsByUser($user_id) . "\n";

// provjera brisanja
echo "\n*************Deleting Everything \n";

// brisanje po useru 
$reviews = $reviewDao->getReviewsByUser($user_id);
foreach ($reviews as $r) {
    $reviewDao->deleteReview($r['id']);
}

$cars = $carDao->getCarsByUser($user_id);
foreach ($cars as $c) {
    $carDao->deleteCar($c['id']);
}

$meetups = $meetupDao->getMeetupsByOrganizer($user_id);
foreach ($meetups as $m) {
    $meetupDao->deleteMeetup($m['id']);
}

$galleryItems = $galleryDao->getGalleryItemsByUser($user_id);
foreach ($galleryItems as $g) {
    $galleryDao->deleteGalleryItem($g['id']);
}

//brisanje usera
$userDao->deleteUser($user_id);

// prikazi useera obrisanog( ako prikaze ne valja)
echo "Deleted User: ";
print_r($userDao->getUserById($user_id));

echo "</pre>";*/
?>
