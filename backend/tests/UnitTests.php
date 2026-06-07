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



echo "\nResult: $passed passed, $failed failed.\n";

exit($failed > 0 ? 1 : 0);