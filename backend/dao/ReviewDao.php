<?php
require_once 'BaseDao.php';

class ReviewDao extends BaseDao {
    public function __construct() {
        parent::__construct("reviews");
    }

    public function getAllReviews() {
        $stmt = $this->connection->prepare("
            SELECT 
                r.id,
                r.title,
                r.review_text,
                r.rating,
                r.review_type,
                r.user_id,
                r.car_id,
                u.username AS reviewer_name,
                c.model AS car_model,
                c.image_url AS car_image
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            LEFT JOIN cars c ON r.car_id = c.id
            ORDER BY r.id DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getReviewById($id) {
        $stmt = $this->connection->prepare("
            SELECT 
                r.id,
                r.title,
                r.review_text,
                r.rating,
                r.review_type,
                r.user_id,
                r.car_id,
                u.username AS reviewer_name,
                c.model AS car_model,
                c.image_url AS car_image
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            LEFT JOIN cars c ON r.car_id = c.id
            WHERE r.id = :id
        ");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function getReviewsByUser($user_id) {
        $stmt = $this->connection->prepare("
            SELECT 
                r.id,
                r.title,
                r.review_text,
                r.rating,
                r.review_type,
                r.user_id,
                r.car_id,
                u.username AS reviewer_name,
                c.model AS car_model,
                c.image_url AS car_image
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            LEFT JOIN cars c ON r.car_id = c.id
            WHERE r.user_id = :user_id
            ORDER BY r.id DESC
        ");
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function countReviewsByUser($user_id) {
        $stmt = $this->connection->prepare("
            SELECT COUNT(*) AS total
            FROM reviews
            WHERE user_id = :user_id
        ");
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();

        $result = $stmt->fetch();
        return $result ? $result['total'] : 0;
    }

    public function getLatestReview() {
        $stmt = $this->connection->prepare("
            SELECT 
                r.id,
                r.title,
                r.review_text,
                r.rating,
                r.review_type,
                r.user_id,
                r.car_id,
                u.username AS reviewer_name,
                c.model AS car_model,
                c.image_url AS car_image
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            LEFT JOIN cars c ON r.car_id = c.id
            ORDER BY r.id DESC
            LIMIT 1
        ");
        $stmt->execute();
        return $stmt->fetch();
    }
}
?>