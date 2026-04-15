<?php

/**
 * @OA\Get(
 *     path="/cars",
 *     summary="Get all cars",
 *     security={{"ApiKey": {}}},
 *     tags={"Cars"},
 *     @OA\Response(
 *         response=200,
 *         description="List of cars"
 *     )
 * )
 */

Flight::route('GET /cars', function () {
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::GUEST]);
    Flight::json(Flight::carService()->getAllCars());
});

/**
 * @OA\Get(
 *     path="/cars/latest",
 *     summary="Get the latest added car",
 *     security={{"ApiKey": {}}},
 *     tags={"Cars"},
 *     @OA\Response(response=200, description="Latest car details")
 * )
 */
Flight::route('GET /cars/latest', function () {
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::GUEST]);
    Flight::json(Flight::carService()->getLatestCar());
});

/**
 * @OA\Get(
 *     path="/cars/{id}",
 *     summary="Get a car by ID",
 *     security={{"ApiKey": {}}},
 *     tags={"Cars"},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Car details"
 *     )
 * )
 */
Flight::route('GET /cars/@id', function ($id) {
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::GUEST]);
    Flight::json(Flight::carService()->getCarById($id));
});

/**
 * @OA\Post(
 *     path="/cars",
 *     summary="Add a new car",
 *     security={{"ApiKey": {}}},
 *     tags={"Cars"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"user_id", "model", "year", "engine", "horsepower", "image_url"},
 *             @OA\Property(property="user_id", type="integer"),
 *             @OA\Property(property="model", type="string"),
 *             @OA\Property(property="year", type="integer"),
 *             @OA\Property(property="engine", type="string"),
 *             @OA\Property(property="horsepower", type="integer"),
 *             @OA\Property(property="image_url", type="string")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Car added")
 * )
 */
Flight::route('POST /cars', function () {
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::GUEST]);

    $data = $_POST; // Get form fields
    $image_url = null;

    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $targetDir = __DIR__ . "/../../frontend/assets/images/";
        if (!file_exists($targetDir)) {
            mkdir($targetDir, 0777, true);
        }
        $fileName = uniqid() . '_' . basename($_FILES["image"]["name"]);
        $targetFilePath = $targetDir . $fileName;

        if (move_uploaded_file($_FILES["image"]["tmp_name"], $targetFilePath)) {
            $image_url = "assets/images/" . $fileName;
        } else {
            Flight::json(["success" => false, "message" => "Failed to upload image"]);
            return;
        }
    }

    $data['image_url'] = $image_url;

    // Now pass $data to your service to save in the database
    $result = Flight::carService()->createCar($data);

    Flight::json([
        "success" => $result,
        "message" => $result ? "Car created successfully" : "Failed to create car"
    ]);
});

/**
 * @OA\Put(
 *     path="/cars/{id}",
 *     summary="Update a car",
 *     security={{"ApiKey": {}}},
 *     tags={"Cars"},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             @OA\Property(property="model", type="string"),
 *             @OA\Property(property="year", type="integer"),
 *             @OA\Property(property="engine", type="string"),
 *             @OA\Property(property="horsepower", type="integer"),
 *             @OA\Property(property="image_url", type="string")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Car updated")
 * )
 */
Flight::route('PUT /cars/@id', function ($id) {
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::GUEST]);

    $data = [];
    $image_url = null;

    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (strpos($contentType, 'multipart/form-data') !== false) {
        // Manually parse multipart/form-data for PUT requests
        $matches = [];
        preg_match('/boundary=(.*)$/', $contentType, $matches);
        $boundary = $matches[1] ?? null;

        if ($boundary) {
            $input = file_get_contents('php://input');
            $parts = array_slice(explode('--' . $boundary, $input), 1);
            
            foreach ($parts as $part) {
                if (empty($part) || $part == '--\r\n') continue;

                $segments = explode("\r\n\r\n", $part, 2);
                if (count($segments) < 2) continue; // Skip if headers and body are not clearly separated

                list($headers, $body) = $segments;
                $headers = explode("\r\n", $headers);
                
                $name = null;
                $filename = null;

                foreach ($headers as $header) {
                    if (strpos($header, 'Content-Disposition:') !== false) {
                        preg_match('/name="([^"]+)"/', $header, $nameMatches);
                        $name = $nameMatches[1] ?? null;
                        preg_match('/filename="([^"]+)"/', $header, $filenameMatches);
                        $filename = $filenameMatches[1] ?? null;
                    }
                }

                if ($name === 'image' && $filename) {
                    // Handle image upload
                    $targetDir = __DIR__ . "/../../frontend/assets/images/";
                    if (!file_exists($targetDir)) {
                        mkdir($targetDir, 0777, true);
                    }
                    $fileName = uniqid() . '_' . basename($filename);
                    $targetFilePath = $targetDir . $fileName;
                    
                    // Save the image data
                    if (file_put_contents($targetFilePath, rtrim($body, "\r\n"))) {
                        $image_url = "assets/images/" . $fileName;
                    } else {
                        Flight::json(["success" => false, "message" => "Failed to upload image"]);
                        return;
                    }
                } elseif ($name) {
                    // Handle other form fields
                    $data[$name] = rtrim($body, "\r\n");
                }
            }
        }
    } else {
        // For JSON or other content types, use Flight's default data parsing
        $data = Flight::request()->data->getData();
    }

    if ($image_url) {
        $data['image_url'] = $image_url;
    }

    $rows = Flight::carService()->updateCar($id, $data);

    Flight::json([
        "success" => $rows > 0,
        "updated_id" => $id,
        "message" => $rows > 0 ? "Car updated successfully" : "No car updated (check ID)"
    ]);
});

/**
 * @OA\Delete(
 *     path="/cars/{id}",
 *     summary="Delete a car",
 *     security={{"ApiKey": {}}},
 *     tags={"Cars"},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(response=200, description="Car deleted")
 * )
 */
Flight::route('DELETE /cars/@id', function ($id) {
    $rows = Flight::carService()->deleteCar($id);
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN]);


    Flight::json([
        "success" => $rows > 0,
        "deleted_id" => $id,
        "message" => $rows > 0 ? "Car deleted successfully" : "No car deleted (check ID)"
    ]);
});
