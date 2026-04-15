<?php

require_once 'BaseService.php';
require_once __DIR__ . '/../dao/GalleryDao.php';

class GalleryService extends BaseService {
    public function __construct() {
        $dao = new GalleryDao();
        parent::__construct($dao);
    }

    // get all - koristi JOIN s users pa ostaje custom
    public function getAllGalleryItems() {
        return $this->dao->getAllGalleryItems();
    }

    // get by id - koristi JOIN s users pa ostaje custom
    public function getGalleryItemById($id) {
        return $this->dao->getGalleryItemById($id);
    }

    // dodaj - validacija pa ne koristi direktno BaseService::create()
    public function createGalleryItem($data) {
        // Business Logic: Validate before inserting
        if (!isset($data['title']) || strlen($data['title']) < 3) {
            throw new Exception('Title must be at least 3 characters.');
        }
        if (!isset($data['image_url']) || empty($data['image_url'])) {
            throw new Exception('Image URL is required.');
        }
        //return $this->dao->add($data); // koristi BaseDao::add()
        return $this->create($data); // koristi BaseService create(), which calls BaseDao::insert()

    }

    public function updateGalleryItem($id, $data) {
        // Business Logic: Validate before updating
        if (!isset($data['title']) || strlen($data['title']) < 3) {
            throw new Exception('Title must be at least 3 characters.');
        }
        // Image URL might not be updated every time, so check if it's provided and not empty
        if (isset($data['image_url']) && empty($data['image_url'])) {
            throw new Exception('Image URL cannot be empty if provided.');
        }
        return $this->update($id, $data); // koristi BaseService update(), which calls BaseDao::update()
    }

    // obrisi - koristi BaseService::delete()
    public function deleteGalleryItem($id) {
        return $this->delete($id); // oristi BaseService::delete()
    }

    // ovo vidjeti da mozda user moze da vidi
    // samo svoja dodana ako hoce al to moram na frontu dpdat
    public function getGalleryItemsByUser($user_id) {
        return $this->dao->getGalleryItemsByUser($user_id);
    }
}
?>
