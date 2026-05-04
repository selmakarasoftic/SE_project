<?php
require_once 'BaseDao.php';

class MeetupDao extends BaseDao {
    public function __construct() {
        parent::__construct("meetups");
    }

    // get all - JOIN with users, NOT in BaseDao
    public function getAllMeetups() {
        $stmt = $this->connection->prepare("
            SELECT 
                m.id,
                m.title,
                m.date,
                m.location,
                m.description,
                u.username AS organizer_name,
                u.id AS organizer_id
            FROM meetups m
            JOIN users u ON m.organizer_id = u.id
            ORDER BY m.date DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // get one - JOIN with user, NOT in BaseDao
    public function getMeetupById($id) {
        $stmt = $this->connection->prepare("
            SELECT 
                m.*,
                u.username AS organizer_name
            FROM meetups m
            JOIN users u ON m.organizer_id = u.id
            WHERE m.id = :id
        ");
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    //  addMeetup  koristi BaseDao::add()
    //  updateMeetup  koristi BaseDao::update()
    //  deleteMeetup  koristi BaseDao::delete()

    // ovo isto kao i za auta i galeriju
    public function getMeetupsByOrganizer($organizer_id) {
        $stmt = $this->connection->prepare("SELECT * FROM meetups WHERE organizer_id = :organizer_id");
        $stmt->bindParam(":organizer_id", $organizer_id);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // ovo ce mi trebat jer na profilu ispisujem koliko je dodanih objava 
    public function countMeetupsByUser($user_id) {
        $stmt = $this->connection->prepare("
            SELECT COUNT(*) as total FROM meetups WHERE organizer_id = :user_id
        ");
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();
        return $stmt->fetch()['total'];
    }

    public function getLatestMeetup() {
        $stmt = $this->connection->prepare("
            SELECT 
                m.id,
                m.title,
                m.date,
                m.location,
                m.description,
                u.username AS organizer_name,
                u.id AS organizer_id
            FROM meetups m
            JOIN users u ON m.organizer_id = u.id
            ORDER BY m.id DESC
            LIMIT 1
        ");
        $stmt->execute();
        return $stmt->fetch();
    }
}
?>