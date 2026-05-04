<?php

/**
 * @OA\Get(
 *     path="/gallery",
 *     summary="Get all gallery items",
 *     security={{"ApiKey": {}}},
 *     tags={"Gallery"},
 *     @OA\Response(
 *         response=200,
 *         description="List of gallery items"
 *     )
 * )
 */
Flight::route('GET /gallery', function () {
        Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::GUEST]);

    Flight::json(Flight::galleryService()->getAllGalleryItems());
});

/**
 * @OA\Get(
 *     path="/gallery/{id}",
 *     summary="Get a gallery item by ID",
 *     security={{"ApiKey": {}}},
 *     tags={"Gallery"},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="ID of the gallery item",
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Gallery item found"
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Gallery item not found"
 *     )
 * )
 */
Flight::route('GET /gallery/@id', function ($id) {
        Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::GUEST]);

    Flight::json(Flight::galleryService()->getGalleryItemById($id));
});

/**
 * @OA\Post(
 *     path="/gallery",
 *     summary="Add a new gallery item",
 *     security={{"ApiKey": {}}},
 *     tags={"Gallery"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"user_id", "title", "image_url"},
 *             @OA\Property(property="user_id", type="integer"),
 *             @OA\Property(property="title", type="string"),
 *             @OA\Property(property="image_url", type="string")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Gallery item created"
 *     )
 * )
 */
Flight::route('POST /gallery', function () {
        Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::GUEST]);

    $data = [];
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

    $data = array_merge($data, $_POST); // Merge POST data
    $data['image_url'] = $image_url;

    $success = Flight::galleryService()->createGalleryItem($data);

    Flight::json([
        "success" => $success,
        "message" => $success ? "Gallery item created successfully" : "Failed to create gallery item"
    ]);
});

/**
 * @OA\Put(
 *     path="/gallery/{id}",
 *     summary="Update a gallery item",
 *     tags={"Gallery"},
 *     security={{"ApiKey": {}}},
 * 
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Gallery item ID",
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             @OA\Property(property="title", type="string"),
 *             @OA\Property(property="image_url", type="string")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Gallery item updated"
 *     )
 * )
 */
Flight::route('PUT /gallery/@id', function ($id) {
        Flight::auth_middleware()->authorizeRoles([Roles::ADMIN]);

    $data = [];
    $image_url = null;

    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (strpos($contentType, 'multipart/form-data') !== false) {
        $matches = [];
        preg_match('/boundary=(.*)$/', $contentType, $matches);
        $boundary = $matches[1] ?? null;

        if ($boundary) {
            $input = file_get_contents('php://input');
            $parts = array_slice(explode('--' . $boundary, $input), 1);
            
            foreach ($parts as $part) {
                if (empty($part) || $part == '--\r\n') continue;

                $segments = explode("\r\n\r\n", $part, 2);
                if (count($segments) < 2) continue;

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
                    $targetDir = __DIR__ . "/../../frontend/assets/images/";
                    if (!file_exists($targetDir)) {
                        mkdir($targetDir, 0777, true);
                    }
                    $fileName = uniqid() . '_' . basename($filename);
                    $targetFilePath = $targetDir . $fileName;
                    
                    if (file_put_contents($targetFilePath, rtrim($body, "\r\n"))) {
                        $image_url = "assets/images/" . $fileName;
                    } else {
                        Flight::json(["success" => false, "message" => "Failed to upload image"]);
                        return;
                    }
                } elseif ($name) {
                    $data[$name] = rtrim($body, "\r\n");
                }
            }
        }
    } else {
        $data = Flight::request()->data->getData();
    }

    if ($image_url) {
        $data['image_url'] = $image_url;
    }

    $rows = Flight::galleryService()->updateGalleryItem($id, $data);

    Flight::json([
        "success" => $rows > 0,
        "updated_id" => $id,
        "message" => $rows > 0 ? "Gallery item updated successfully" : "No item updated (check ID)"
    ]);
});

/**
 * @OA\Delete(
 *     path="/gallery/{id}",
 *     summary="Delete a gallery item",
 *     security={{"ApiKey": {}}},
 *     tags={"Gallery"},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Gallery item ID",
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Gallery item deleted"
 *     )
 * )
 */
Flight::route('DELETE /gallery/@id', function ($id) {
        Flight::auth_middleware()->authorizeRoles([Roles::ADMIN]);

    $rows = Flight::galleryService()->deleteGalleryItem($id);

    Flight::json([
        "success" => $rows > 0,
        "deleted_id" => $id,
        "message" => $rows > 0 ? "Gallery item deleted successfully" : "No item deleted (check ID)"
    ]);
});

/**
 * @OA\Get(
 *     path="/gallery/user/{user_id}",
 *     summary="Get gallery items by user ID",
 *     security={{"ApiKey": {}}},
 *     tags={"Gallery"},
 *     @OA\Parameter(
 *         name="user_id",
 *         in="path",
 *         required=true,
 *         description="User ID",
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Gallery items by user"
 *     )
 * )
 */
Flight::route('GET /gallery/user/@user_id', function ($user_id) {
        Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::GUEST]);

    Flight::json(Flight::galleryService()->getGalleryItemsByUser($user_id));
});
