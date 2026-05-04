<?php
require __DIR__ . '/vendor/autoload.php';

// Register services
require_once __DIR__ . '/services/CarService.php';
require_once __DIR__ . '/services/ReviewService.php';
require_once __DIR__ . '/services/UserService.php';
require_once __DIR__ . '/services/GalleryService.php';
require_once __DIR__ . '/services/MeetupService.php';
require_once __DIR__ . '/services/AuthService.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';
require_once __DIR__ . '/middleware/ValidationMiddleware.php';
require_once __DIR__ . '/data/roles.php';

Flight::register('auth_middleware', 'AuthMiddleware');
Flight::register('validation_middleware', 'ValidationMiddleware');
Flight::register('carService', 'CarService');
Flight::register('reviewService', 'ReviewService');
Flight::register('userService', 'UserService');
Flight::register('galleryService', 'GalleryService');
Flight::register('meetupService', 'MeetupService');
Flight::register('auth_service', 'AuthService');
//now i implement middleware to protect all routes except login register and docs 
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
require_once __DIR__ . '/dao/config.php';

Flight::route('/*', function(){
    $url = Flight::request()->url;

    if (
        str_starts_with($url, '/login') ||
        str_starts_with($url, '/register') ||
        str_starts_with($url, '/auth/login') ||
        str_starts_with($url, '/auth/register') ||
        str_starts_with($url, '/public/v1/docs') 
    ) {
        return true; // Allow public routes to proceed
    }

    try {
        /*$token = Flight::request()->getHeader("Authorization");
        if (!$token) {
            Flight::halt(401, "Missing authentication headerUPS");
        }

        $decoded = JWT::decode($token, new Key(Database::JWT_SECRET(), 'HS256'));
        Flight::set('user', $decoded->user);
        if(Flight::auth_middleware()->verifyToken($token))
               return TRUE;
    } catch (Exception $e) {
        Flight::halt(401, $e->getMessage());
    }*/
    $headers = getallheaders();
        error_log("Headers: " . print_r($headers, true));

        // Find the Authorization or Authentication header case-insensitively
        $authHeader = null;
        foreach ($headers as $name => $value) {
            if (strtolower($name) === 'authorization' || strtolower($name) === 'authentication') {
                $authHeader = $value;
                break;
            }
        }

        if (empty($authHeader)) {
            error_log("Missing Authorization header here is the problem");
            Flight::halt(401, json_encode([
                'success' => false,
                'error' => 'Missing authorization header',
                'headers' => $headers
            ]));
            return false;
        }

        if ($authHeader == 0) {
            error_log("Invalid Authorization header format");
            Flight::halt(401, json_encode([
                'success' => false,
                'error' => 'Invalid authorization header format',
                'authHeader' => $authHeader,
                'headers' => $headers
            ]));
            return false;
        }

        $token = $authHeader;
        error_log("Token received: " . $token);

        // Use middleware to verify token and set user data
        Flight::auth_middleware()->verifyToken($token);

        return true;

    } catch (Exception $e) {
        error_log("JWT Error: " . $e->getMessage());
        Flight::halt(401, json_encode([
            'success' => false,
            'error' => 'Invalid or expired token',
            'details' => $e->getMessage()
        ]));
        return false;
    }

});

// Load routes
require_once __DIR__ . '/routes/CarRoutes.php';
require_once __DIR__ . '/routes/ReviewRoutes.php';
require_once __DIR__ . '/routes/UserRoutes.php';
require_once __DIR__ . '/routes/GalleryRoutes.php';
require_once __DIR__ . '/routes/MeetupRoutes.php';
require_once __DIR__ . '/routes/AuthRoutes.php';

Flight::start();

