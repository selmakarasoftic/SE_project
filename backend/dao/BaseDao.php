<?php
require_once 'config.php';
class BaseDao {
    protected $table;
    protected $connection; //storing variables, 
    //protected means it is available just for child classes

    public function __construct($table) {
        $this->table = $table;
        $this->connection = Database::connect();
    }

    public function getAll() {
        $stmt = $this->connection->prepare("SELECT * FROM $this->table");
        $stmt->execute();
        return $stmt->fetchAll();
    }//stmt is pdo statement object, sprema statement koji cuva query i kasnije salje u bazu

    public function getById($id) {
        $stmt = $this->connection->prepare("SELECT * FROM $this->table WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function insert($data) {
        $columns = implode(", ", array_keys($data));
        $placeholders = ":" . implode(", :", array_keys($data));
        $stmt = $this->connection->prepare("INSERT INTO $this->table ($columns) VALUES ($placeholders)");
        return $stmt->execute($data);
    }

    public function update($id, $data) {
        $fields = "";
        foreach ($data as $key => $value) {
            $fields .= "$key = :$key, ";
        }
        $fields = rtrim($fields, ", ");
        $data['id'] = $id;
        $stmt = $this->connection->prepare("UPDATE $this->table SET $fields WHERE id = :id");
        return $stmt->execute($data);
    }

    public function delete($id) {
        $stmt = $this->connection->prepare("DELETE FROM $this->table WHERE id = :id");
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
    public function query_unique($query, $params = []) {
    $stmt = $this->connection->prepare($query);
    $stmt->execute($params);
    return $stmt->fetch(); 
}

}

?>
