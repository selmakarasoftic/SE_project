<?php

require_once 'BaseService.php';
require_once __DIR__ . '/../dao/CarDao.php';

class CarService extends BaseService {
    public function __construct() {
        $dao = new CarDao();
        parent::__construct($dao);
    }

    // get all - koristi JOIN pa ostaje custom
    public function getAllCars() {
        return $this->dao->getAllCars();
    }

    // get one - koristi JOIN pa ostaje custom
    public function getCarById($id) {
        return $this->dao->getCarById($id);
    }

    // novo auto - validacija pa ne koristi BaseService::create()
    public function createCar($data) {
        // Business Logic
        if (!isset($data['model']) || empty($data['model'])) {
            throw new Exception('Model is required.');
        }
        if (!isset($data['year']) || $data['year'] < 1886 || $data['year'] > intval(date('Y'))) {
            throw new Exception('Year must be between 1886 and today.');
        }
        if (!isset($data['horsepower']) || $data['horsepower'] <= 0) {
            throw new Exception('Horsepower must be a positive number.');
        }
        return $this->create($data); // BaseService create() pa BaseDao::insert()
    }

    // update - može preko BaseService::update()
    public function updateCar($id, $data) {
        // Ensure $id is an integer for database operations
        return $this->update((int)$id, $data); // koristi BaseService::update()
    }

    // delete - može preko BaseService::delete()
    public function deleteCar($id) {
        return $this->delete($id); // koristi BaseService::delete()
    }

    //  by a specific user 
    public function getCarsByUser($user_id) {
        return $this->dao->getCarsByUser($user_id);
    }

    // ovo vidjeti da mozda user moze da vidi
    // samo svoja dodana ako hoce al to moram na frontu dpdat
    public function countCarsByUser($user_id) {
        return $this->dao->countCarsByUser($user_id);
    }

    public function getLatestCar() {
        return $this->dao->getLatestCar();
    }
}
?>
