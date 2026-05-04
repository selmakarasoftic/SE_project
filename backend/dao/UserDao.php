<?php
require_once 'BaseDao.php';

class UserDao extends BaseDao {
    public function __construct() {
        parent::__construct("users");
    }

    // register - može koristiti BaseDao::add() ako koristiš u service
    public function registerUser($data) {
        $stmt = $this->connection->prepare("
            INSERT INTO users (username, email, password)
            VALUES (:username, :email, :password)
        ");
        return $stmt->execute($data);
    }

    // login
    public function getUserByEmail($email) {
        $stmt = $this->connection->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->bindParam(":email", $email);
        $stmt->execute();
        return $stmt->fetch();
    }

    // get one - samo određena polja, pa ostaje
    public function getUserById($id) {
        $stmt = $this->connection->prepare("SELECT id, username, email, role, created_at, password FROM users WHERE id = :id");
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    // update - koristiš BaseDao::update() ako koristiš sva polja (ali zadržaćemo tvoju custom)
    public function updateUser($id, $data) {
        $data['id'] = $id;
        $stmt = $this->connection->prepare("
            UPDATE users 
            SET username = :username, email = :email, role = :role
            WHERE id = :id
        ");
        $stmt->execute($data);
        return $stmt->rowCount(); // return number of affected rows
    }

    // change pwd
    public function changePassword($id, $newPassword) {
        $stmt = $this->connection->prepare("
            UPDATE users SET password = :password WHERE id = :id
        ");
        $stmt->bindParam(":password", $newPassword);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }

    // za admina
    public function getAllUsers() {
        $stmt = $this->connection->prepare("
            SELECT id, username, email, role, created_at FROM users
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // obrisi - može preko BaseDao::delete()
    public function deleteUser($id) {
        $stmt = $this->connection->prepare("DELETE FROM users WHERE id = :id");
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        return $stmt->rowCount(); // return number of affected rows
    }
}
?>
