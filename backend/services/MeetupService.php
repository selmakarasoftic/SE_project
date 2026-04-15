<?php

require_once 'BaseService.php';
require_once __DIR__ . '/../dao/MeetupDao.php';

class MeetupService extends BaseService {
    public function __construct() {
        $dao = new MeetupDao();
        parent::__construct($dao);
    }

    // get all - koristi JOIN s users pa ostaje custom
    public function getAllMeetups() {
        return $this->dao->getAllMeetups();
    }

    // get one - koristi JOIN s users pa ostaje custom
    public function getMeetupById($id) {
        return $this->dao->getMeetupById($id);
    }

    // create - validacija pa ne koristi direktno BaseService::create()
    public function createMeetup($data) {
        // Business Logic: Validate before inserting
        if (!isset($data['title']) || strlen($data['title']) < 3) {
            throw new Exception('Title must be at least 3 characters.');
        }
        if (!isset($data['location']) || strlen($data['location']) < 3) {
            throw new Exception('Location must be at least 3 characters.');
        }
        if (!isset($data['date']) || empty($data['date'])) {
            throw new Exception('Date is required.');
        }
        if (!isset($data['description']) || strlen($data['description']) < 10) {
            throw new Exception('Description must be at least 10 characters.');
        }
        return $this->create($data); //  BaseService pa  BaseDao::insert
    }

    // update - koristi BaseService::update()
    public function updateMeetup($id, $data) {
        return $this->update($id, $data); //  koristi BaseService::update()
    }

    // delete - koristi BaseService::delete()
    public function deleteMeetup($id) {
        return $this->delete($id); //  koristi BaseService::delete()
    }

    // ovo isto kao i za auta i galeriju
    public function getMeetupsByOrganizer($organizer_id) {
        return $this->dao->getMeetupsByOrganizer($organizer_id);
    }

    // ovo ce mi trebat jer na profilu ispisujem koliko je dodanih objava 
    public function countMeetupsByUser($user_id) {
        return $this->dao->countMeetupsByUser($user_id);
    }

    public function getLatestMeetup() {
        return $this->dao->getLatestMeetup();
    }
}
?>
