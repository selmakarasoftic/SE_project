<?php
require_once 'BaseDao.php';

class CarDao extends BaseDao {
    public function __construct() {
        parent::__construct("cars");
    }

    // Get all cars - custom join, NOT in BaseDao
    public function getAllCars() {
        $stmt = $this->connection->prepare("
            SELECT 
                c.id,
                c.model,
                c.year,
                c.engine,
                c.horsepower,
                c.image_url,
                u.username AS uploader,
                u.id AS user_id
            FROM cars c
            JOIN users u ON c.user_id = u.id
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Get car by ID - custom join, NOT in BaseDao
    public function getCarById($id) {
        $stmt = $this->connection->prepare("
            SELECT 
                c.id,
                c.model,
                c.year,
                c.engine,
                c.horsepower,
                c.image_url,
                u.username AS uploader,
                u.id AS user_id
            FROM cars c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = :id
        ");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    // Get all cars by user - NOT in BaseDao (custom WHERE)
    public function getCarsByUser($user_id) {
        $stmt = $this->connection->prepare("SELECT * FROM cars WHERE user_id = :user_id");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // ovo vidjeti da mozda user moze da vidi
    // samo svoja dodana ako hoce al to moram na frontu dpdat
    public function countCarsByUser($user_id) {
        $stmt = $this->connection->prepare("
            SELECT COUNT(*) as total FROM cars WHERE user_id = :user_id
        ");
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();
        return $stmt->fetch()['total'];
    }

    //  addCar, updateCar, deleteCar are done through BaseDao

    public function getLatestCar() {
        $stmt = $this->connection->prepare("
            SELECT 
                c.id,
                c.model,
                c.year,
                c.engine,
                c.horsepower,
                c.image_url,
                u.username AS uploader,
                u.id AS user_id
            FROM cars c
            JOIN users u ON c.user_id = u.id
            ORDER BY c.id DESC
            LIMIT 1
        ");
        $stmt->execute();
        return $stmt->fetch();
    }
}
?>
