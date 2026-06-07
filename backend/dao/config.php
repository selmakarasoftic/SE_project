<?php

class Database
{
    private static $instance = null;
    private $connection;

    private static $host = getenv('DB_HOST');
    private static $dbName = getenv('DB_NAME');
    private static $username = getenv('DB_USERNAME');
    private static $password = getenv('DB_PASSWORD');


    // PRIVATE constructor → sprječava new Database()
    private function __construct()
    {
        try {
            $this->connection = new PDO(
                "mysql:host=" . self::$host . ";dbname=" . self::$dbName,
                self::$username,
                self::$password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );
        } catch (PDOException $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }

    // sprječava clone
    private function __clone()
    {
    }

    // sprječava unserialize
    public function __wakeup()
    {
        throw new Exception("Cannot unserialize singleton");
    }

    // getInstance → vraća jednu instancu
    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    // vraća PDO konekciju
    public function getConnection()
    {
        return $this->connection;
    }

    public static function connect()
    {
        return self::getInstance()->getConnection();
    }

    public static function JWT_SECRET()
    {
        return 'SecureRandomString';
    }
}

?>