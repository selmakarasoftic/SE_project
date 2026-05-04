<?php
require_once 'BaseService.php';
require_once __DIR__ . '/../dao/AuthDao.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;


class AuthService extends BaseService {
   private $auth_dao;
   public function __construct() {
       $this->auth_dao = new AuthDao();
       parent::__construct(new AuthDao);
   }


   public function get_user_by_email($email){
       return $this->auth_dao->get_user_by_email($email);
   }


   public function register($entity) {  
       /*if (!is_array($entity)) {
        return ['success' => false, 'error' => 'Invalid request format.'];
        }
        if (empty($entity['email']) || empty($entity['password']) || empty($entity['username'])) {
           return ['success' => false, 'error' => 'Email, password and username are required.'];
       }


       $email_exists = $this->auth_dao->get_user_by_email($entity['email']);
       if($email_exists){
           return ['success' => false, 'error' => 'Email already registered.'];
       }


       $entity['password'] = password_hash($entity['password'], PASSWORD_BCRYPT);


       $entity = parent::create($entity);


       //unset($entity['password']);


       return ['success' => true, 'data' => $entity];            */
       try {
        $required = ['username', 'email', 'password', 'role'];
        foreach ($required as $field) {
            if (empty($entity[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }

        if (!in_array($entity['role'], ['admin', 'guest'])) {
            throw new Exception("Role must be either 'admin' or 'guest'");
        }

        if ($this->auth_dao->get_user_by_email($entity['email'])) {
            throw new Exception("Email already registered");
        }

        $entity['password'] = password_hash($entity['password'], PASSWORD_BCRYPT);

        $registration_successful = parent::create($entity);
        
        if (!$registration_successful) {
             throw new Exception("Registration failed - database insertion failed");
        }
        
        // Fetch the newly registered user to return it
        $registered_user = $this->auth_dao->get_user_by_email($entity['email']);

        error_log("Registration result: " . print_r($registered_user, true));
        
        if (empty($registered_user) || !is_array($registered_user)) {
            throw new Exception("Registration failed - could not fetch user after insertion");
        }

        if (array_key_exists('password', $registered_user)) {
            unset($registered_user['password']);
        }

        return [
            'success' => true,
            'data' => $registered_user
        ];

    } catch (Exception $e) {
        error_log("Registration Error: " . $e->getMessage());
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    } 
   }


   public function login($entity) {  
       try {
            if (empty($entity['email']) || empty($entity['password'])) {
                throw new Exception('Email and password are required');
            }

            $db_user = $this->auth_dao->get_user_by_email($entity['email']);
            if (!$db_user) {
                throw new Exception('Invalid credentials');
            }

            if (!password_verify($entity['password'], $db_user['password'])) {
                throw new Exception('Invalid credentials');
            }

            unset($db_user['password']);
            $jwt_payload = [
                'user' => $db_user,
                'iat' => time(),
                'exp' => time() + (60 * 60 * 24) 
            ];

            $token = JWT::encode(
                $jwt_payload,
                Database::JWT_SECRET(),
                'HS256'
            );

            return [
                'success' => true,
                'data' => array_merge($db_user, ['token' => $token])
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
   }
}
