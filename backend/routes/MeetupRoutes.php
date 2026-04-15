<?php

/**
 * @OA\Get(
 *     path="/meetups",
 *     summary="Get all meetups",
 *     security={{"ApiKey": {}}},
 *     tags={"Meetups"},
 *     @OA\Response(
 *         response=200,
 *         description="List of meetups"
 *     )
 * )
 */
Flight::route('GET /meetups', function () {
        Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::GUEST]);
    Flight::json(Flight::meetupService()->getAllMeetups());
});

/**
 * @OA\Get(
 *     path="/meetups/latest",
 *     summary="Get the latest added meetup",
 *     security={{"ApiKey": {}}},
 *     tags={"Meetups"},
 *     @OA\Response(response=200, description="Latest meetup details")
 * )
 */
Flight::route('GET /meetups/latest', function () {
    Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::GUEST]);
    Flight::json(Flight::meetupService()->getLatestMeetup());
});

/**
 * @OA\Get(
 *     path="/meetups/{id}",
 *     summary="Get a meetup by ID",
 *     security={{"ApiKey": {}}},
 *     tags={"Meetups"},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="ID of the meetup",
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Meetup found"
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Meetup not found"
 *     )
 * )
 */
Flight::route('GET /meetups/@id', function ($id) {
        Flight::auth_middleware()->authorizeRoles([Roles::ADMIN, Roles::GUEST]);

    Flight::json(Flight::meetupService()->getMeetupById($id));
});

/**
 * @OA\Post(
 *     path="/meetups",
 *     summary="Create a new meetup",
 *     security={{"ApiKey": {}}},
 *     tags={"Meetups"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"title", "date", "location", "description", "organizer_id"},
 *             @OA\Property(property="title", type="string"),
 *             @OA\Property(property="date", type="string", format="date"),
 *             @OA\Property(property="location", type="string"),
 *             @OA\Property(property="description", type="string"),
 *             @OA\Property(property="organizer_id", type="integer")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Meetup created"
 *     )
 * )
 */
Flight::route('POST /meetups', function () {
        Flight::auth_middleware()->authorizeRoles([Roles::ADMIN]);

    $data = Flight::request()->data->getData();
    $success = Flight::meetupService()->createMeetup($data);
    Flight::json([
        "success" => $success,
        "message" => $success ? "Meetup created successfully" : "Failed to create meetup"
    ]);
});

/**
 * @OA\Put(
 *     path="/meetups/{id}",
 *     summary="Update a meetup",
 *     tags={"Meetups"},
 *     security={{"ApiKey": {}}},
 * 
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Meetup ID",
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             @OA\Property(property="title", type="string"),
 *             @OA\Property(property="date", type="string", format="date"),
 *             @OA\Property(property="location", type="string"),
 *             @OA\Property(property="description", type="string")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Meetup updated"
 *     )
 * )
 */
Flight::route('PUT /meetups/@id', function ($id) {
        Flight::auth_middleware()->authorizeRoles([Roles::ADMIN]);

    $data = Flight::request()->data->getData();
    $rows = Flight::meetupService()->updateMeetup($id, $data);
    Flight::json([
        "success" => $rows > 0,
        "updated_id" => $id,
        "message" => $rows > 0 ? "Meetup updated successfully" : "No meetup updated (check ID)"
    ]);
});

/**
 * @OA\Delete(
 *     path="/meetups/{id}",
 *     summary="Delete a meetup",
 *     security={{"ApiKey": {}}},
 *     tags={"Meetups"},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Meetup ID",
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Meetup deleted"
 *     )
 * )
 */
Flight::route('DELETE /meetups/@id', function ($id) {
        Flight::auth_middleware()->authorizeRoles([Roles::ADMIN]);

    $rows = Flight::meetupService()->deleteMeetup($id);
    Flight::json([
        "success" => $rows > 0,
        "deleted_id" => $id,
        "message" => $rows > 0 ? "Meetup deleted successfully" : "No meetup deleted (check ID)"
    ]);
});
