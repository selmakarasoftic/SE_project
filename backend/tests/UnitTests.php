<?php

require_once __DIR__ . '/../middleware/ValidationMiddleware.php';
require_once __DIR__ . '/../services/BaseService.php';
require_once __DIR__ . '/../services/CarService.php';
require_once __DIR__ . '/../services/ReviewService.php';
require_once __DIR__ . '/../services/GalleryService.php';

$passed = 0;
$failed = 0;

function runTest($name, $callback) {
    global $passed, $failed;

    try {
        $callback();
        echo "PASS: $name\n";
        $passed++;
    } catch (Throwable $e) {
        echo "FAIL: $name - " . $e->getMessage() . "\n";
        $failed++;
    }
}

function assertTrue($condition, $message = 'Assertion failed') {
    if (!$condition) {
        throw new Exception($message);
    }
}

function assertEquals($expected, $actual, $message = 'Values are not equal') {
    if ($expected != $actual) {
        throw new Exception(
            $message . " | Expected: " . var_export($expected, true) .
            ", got: " . var_export($actual, true)
        );
    }
}

function expectException($callback, $expectedMessage = null) {
    try {
        $callback();
    } catch (Throwable $e) {
        if ($expectedMessage !== null && strpos($e->getMessage(), $expectedMessage) === false) {
            throw new Exception("Wrong exception message. Got: " . $e->getMessage());
        }
        return;
    }

    throw new Exception('Expected exception was not thrown.');
}

/*
    Fake DAO is used to test service logic without connecting to the real database.
*/
class FakeDao {
    public array $inserted = [];
    public array $updated = [];
    public array $deleted = [];

    public function insert($data) {
        $this->inserted[] = $data;
        return array_merge(['id' => count($this->inserted)], $data);
    }

    public function update($id, $data) {
        $this->updated[] = [
            'id' => $id,
            'data' => $data
        ];

        return array_merge(['id' => $id], $data);
    }

    public function delete($id) {
        $this->deleted[] = $id;
        return true;
    }

    public function getAll() {
        return [];
    }

    public function getById($id) {
        return ['id' => $id];
    }
}

class TestableCarService extends CarService {
    public FakeDao $fakeDao;

    public function __construct() {
        $this->fakeDao = new FakeDao();
        BaseService::__construct($this->fakeDao);
    }
}

class TestableReviewService extends ReviewService {
    public FakeDao $fakeDao;

    public function __construct() {
        $this->fakeDao = new FakeDao();
        BaseService::__construct($this->fakeDao);
    }
}

class TestableGalleryService extends GalleryService {
    public FakeDao $fakeDao;

    public function __construct() {
        $this->fakeDao = new FakeDao();
        BaseService::__construct($this->fakeDao);
    }
}

/*
    TEST 1:
    Valid registration data should pass validation.
*/
runTest('Registration validation accepts complete valid user data', function () {
    $validator = new ValidationMiddleware();

    $result = $validator->validateRegistration([
        'username' => 'testuser',
        'email' => 'testuser@example.com',
        'password' => 'secret123'
    ]);

    assertTrue($result === true, 'Valid registration data should pass.');
});

/*
    TEST 2:
    Registration should reject invalid email format.
*/
runTest('Registration validation rejects invalid email format', function () {
    $validator = new ValidationMiddleware();

    expectException(function () use ($validator) {
        $validator->validateRegistration([
            'username' => 'testuser',
            'email' => 'invalid-email-format',
            'password' => 'secret123'
        ]);
    }, 'Invalid email format');
});

/*
    TEST 3:
    Registration should reject weak password.
*/
runTest('Registration validation rejects weak password', function () {
    $validator = new ValidationMiddleware();

    expectException(function () use ($validator) {
        $validator->validateRegistration([
            'username' => 'testuser',
            'email' => 'testuser@example.com',
            'password' => '123'
        ]);
    }, 'Password must be at least 6 characters');
});

/*
    TEST 4:
    Login should not be allowed without password.
*/
runTest('Login validation rejects missing password', function () {
    $validator = new ValidationMiddleware();

    expectException(function () use ($validator) {
        $validator->validateLogin([
            'email' => 'testuser@example.com',
            'password' => ''
        ]);
    }, 'Password is required');
});

/*
    TEST 5:
    Password change should require old password.
*/
runTest('Password change validation rejects missing old password', function () {
    $validator = new ValidationMiddleware();

    expectException(function () use ($validator) {
        $validator->validatePasswordChange([
            'old_password' => '',
            'new_password' => 'newSecret123'
        ]);
    }, 'Old password is required');
});

/*
    TEST 6:
    Car validation should reject data without engine type.
*/
runTest('Car validation rejects missing engine type', function () {
    $validator = new ValidationMiddleware();

    expectException(function () use ($validator) {
        $validator->validateCar([
            'model' => 'BMW M3',
            'year' => 2020,
            'horsepower' => 480
        ]);
    }, 'Engine type is required');
});

/*
    TEST 7:
    Valid car data should be created through the service layer.
*/
runTest('CarService creates valid car and calls DAO insert once', function () {
    $service = new TestableCarService();

    $car = $service->createCar([
        'model' => 'Audi A4',
        'year' => 2019,
        'engine' => '2.0 TDI',
        'horsepower' => 150,
        'user_id' => 1
    ]);

    assertEquals('Audi A4', $car['model'], 'Created car model should match.');
    assertEquals(1, count($service->fakeDao->inserted), 'DAO insert should be called exactly once.');
});

/*
    TEST 8:
    Backend should reject a car with a future year.
*/
runTest('CarService rejects future car year', function () {
    $service = new TestableCarService();

    expectException(function () use ($service) {
        $service->createCar([
            'model' => 'Future Concept',
            'year' => intval(date('Y')) + 1,
            'engine' => 'Electric',
            'horsepower' => 300,
            'user_id' => 1
        ]);
    }, 'Year must be between 1886 and today');
});

/*
    TEST 9:
    Review text should not be too short.
*/
runTest('ReviewService rejects review text that is too short', function () {
    $service = new TestableReviewService();

    expectException(function () use ($service) {
        $service->createReview([
            'title' => 'Good',
            'review_text' => 'short',
            'rating' => 4,
            'user_id' => 1,
            'car_id' => 2
        ]);
    }, 'Review text must be at least 10 characters');
});

/*
    TEST 10:
    Valid review should be created through the service layer.
*/
runTest('ReviewService creates valid review and calls DAO insert once', function () {
    $service = new TestableReviewService();

    $review = $service->createReview([
        'title' => 'Great car',
        'review_text' => 'This car is comfortable, reliable, and fun to drive.',
        'rating' => 5,
        'user_id' => 1,
        'car_id' => 2
    ]);

    assertEquals('Great car', $review['title'], 'Review title should match.');
    assertEquals(1, count($service->fakeDao->inserted), 'DAO insert should be called exactly once.');
});

/*
    TEST 11:
    Gallery update should reject an empty image URL when image_url is provided.
*/
runTest('GalleryService rejects update when provided image URL is empty', function () {
    $service = new TestableGalleryService();

    expectException(function () use ($service) {
        $service->updateGalleryItem(3, [
            'title' => 'Updated gallery item',
            'image_url' => ''
        ]);
    }, 'Image URL cannot be empty if provided');
});

echo "\nResult: $passed passed, $failed failed.\n";

exit($failed > 0 ? 1 : 0);