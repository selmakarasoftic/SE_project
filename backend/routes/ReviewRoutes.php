<?php

/**
 * @OA\Get(
 *     path="/reviews",
 *     summary="Get all reviews",
 *     security={{"ApiKey": {}}},
 *     tags={"Reviews"},
 *     @OA\Response(response=200, description="List of reviews")
 * )
 */
Flight::route('GET /reviews', function() {
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::GUEST]);
    Flight::json(Flight::reviewService()->getAllReviews());
});

/**
 * @OA\Get(
 *     path="/reviews/latest",
 *     summary="Get the latest added review",
 *     security={{"ApiKey": {}}},
 *     tags={"Reviews"},
 *     @OA\Response(response=200, description="Latest review details")
 * )
 */
Flight::route('GET /reviews/latest', function () {
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::GUEST]);
    Flight::json(Flight::reviewService()->getLatestReview());
});

/**
 * @OA\Get(
 *     path="/reviews/{id}",
 *     summary="Get a review by ID",
 *     security={{"ApiKey": {}}},
 *     tags={"Reviews"},
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Response(response=200, description="Review details"),
 *     @OA\Response(response=404, description="Review not found")
 * )
 */
Flight::route('GET /reviews/@id', function($id) {
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::GUEST]);
    Flight::json(Flight::reviewService()->getReviewById($id));
});

/**
 * @OA\Post(
 *     path="/reviews",
 *     summary="Add a new review",
 *     security={{"ApiKey": {}}},
 *     tags={"Reviews"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"user_id", "car_id", "title", "review_text", "rating"},
 *             @OA\Property(property="user_id", type="integer"),
 *             @OA\Property(property="car_id", type="integer"),
 *             @OA\Property(property="title", type="string"),
 *             @OA\Property(property="review_text", type="string"),
 *             @OA\Property(property="rating", type="number", format="float")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Review added")
 * )
 */
Flight::route('POST /reviews', function() {
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::GUEST]);
    $data = $_POST; // Get form fields
    $car_id = null;


    // Handle car_id: ensure it's null if not selected, or an integer
    if (isset($data['car_id']) && ($data['car_id'] === '' || $data['car_id'] === 'null')) {
        $data['car_id'] = null;
    } else if (isset($data['car_id'])) {
        $data['car_id'] = (int)$data['car_id']; // Cast to int if it's a number
    } else {
        $data['car_id'] = null; // Default to null if not sent from frontend
    }

    // Explicitly cast user_id and rating to integers
    if (isset($data['user_id'])) {
        $data['user_id'] = (int)$data['user_id'];
    }
    if (isset($data['rating'])) {
        $data['rating'] = (int)$data['rating'];
    }

    // Remove reviewer_name as it's not a column in the database
    if (isset($data['reviewer_name'])) {
        unset($data['reviewer_name']);
    }

    try {
        $success = Flight::reviewService()->createReview($data);
        Flight::json([
            "success" => $success,
            "message" => $success ? "Review created successfully" : "Failed to create review"
        ]);
    } catch (Exception $e) {
        Flight::json([
            "success" => false,
            "message" => "Backend error: " . $e->getMessage()
        ], 500); // Send a 500 status code with the error
    }
});

/**
 * @OA\Put(
 *     path="/reviews/{id}",
 *     summary="Update a review",
 *     security={{"ApiKey": {}}},
 *     tags={"Reviews"},
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             @OA\Property(property="title", type="string"),
 *             @OA\Property(property="review_text", type="string"),
 *             @OA\Property(property="rating", type="number", format="float")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Review updated")
 * )
 */
Flight::route('PUT /reviews/@id', function($id) {
    $user = Flight::auth_middleware()->getLoggedInUser();
    
    if (!$user) {
        Flight::json(["success" => false, "message" => "Unauthorized: No user logged in."], 401);
        return;
    }

    // Fetch the review to check ownership
    $review = Flight::reviewService()->getReviewById((int)$id);
    if (!$review) {
        Flight::json(["success" => false, "message" => "Review not found."], 404);
        return;
    }

    // Authorize: Admin can edit any review, regular user can only edit their own
    if ($user->role === Roles::ADMIN || $user->id === $review['user_id']) {
        $data = Flight::request()->data->getData();
        // Cast rating to int if present
        if (isset($data['rating'])) {
            $data['rating'] = (int)$data['rating'];
        }
        $rows = Flight::reviewService()->updateReview($id, $data);
        Flight::json([
            "success" => $rows > 0,
            "updated_id" => $id,
            "message" => $rows > 0 ? "Review updated successfully" : "No review updated (check ID or changes)"
        ]);
    } else {
        Flight::json(["success" => false, "message" => "Forbidden: You can only edit your own reviews."], 403);
    }
});

/**
 * @OA\Delete(
 *     path="/reviews/{id}",
 *     summary="Delete a review",
 *     security={{"ApiKey": {}}},
 *     tags={"Reviews"},
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Response(response=200, description="Review deleted")
 * )
 */
Flight::route('DELETE /reviews/@id', function($id) {
    $user = Flight::auth_middleware()->getLoggedInUser();
    
    if (!$user) {
        Flight::json(["success" => false, "message" => "Unauthorized: No user logged in."], 401);
        return;
    }

    // Fetch the review to check ownership
    $review = Flight::reviewService()->getReviewById((int)$id);
    if (!$review) {
        Flight::json(["success" => false, "message" => "Review not found."], 404);
        return;
    }

    // Authorize: Admin can delete any review, regular user can only delete their own
    if ($user->role === Roles::ADMIN || $user->id === $review['user_id']) {
        $rows = Flight::reviewService()->deleteReview($id);
        Flight::json([
            "success" => $rows > 0,
            "deleted_id" => $id,
            "message" => $rows > 0 ? "Review deleted successfully" : "No review deleted (check ID)"
        ]);
    } else {
        Flight::json(["success" => false, "message" => "Forbidden: You can only delete your own reviews."], 403);
    }
});
?>
