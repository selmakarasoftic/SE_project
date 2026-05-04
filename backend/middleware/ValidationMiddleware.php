<?php

class ValidationMiddleware {

    public function validateRegistration($data) {
        if (!isset($data['username']) || strlen($data['username']) < 3) {
            throw new Exception('Username must be at least 3 characters.');
        }
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email format.');
        }
        if (!isset($data['password']) || strlen($data['password']) < 6) {
            throw new Exception('Password must be at least 6 characters.');
        }
        return true;
    }

    public function validateLogin($data) {
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email format.');
        }
        if (!isset($data['password']) || empty($data['password'])) {
            throw new Exception('Password is required.');
        }
        return true;
    }

    public function validatePasswordChange($data) {
        if (!isset($data['old_password']) || empty($data['old_password'])) {
            throw new Exception('Old password is required.');
        }
        if (!isset($data['new_password']) || strlen($data['new_password']) < 6) {
            throw new Exception('New password must be at least 6 characters.');
        }
        return true;
    }

    public function validateCar($data) {
        if (!isset($data['model']) || empty($data['model'])) {
            throw new Exception('Car model is required.');
        }
        if (!isset($data['year']) || !is_numeric($data['year']) || $data['year'] < 1900 || $data['year'] > date('Y')) {
            throw new Exception('Invalid year. Must be between 1900 and current year.');
        }
        if (!isset($data['engine']) || empty($data['engine'])) {
            throw new Exception('Engine type is required.');
        }
        if (!isset($data['horsepower']) || !is_numeric($data['horsepower']) || $data['horsepower'] <= 0) {
            throw new Exception('Horsepower must be a positive number.');
        }
        return true;
    }

    public function validateMeetup($data) {
        if (!isset($data['title']) || strlen($data['title']) < 3) {
            throw new Exception('Title must be at least 3 characters.');
        }
        if (!isset($data['description']) || strlen($data['description']) < 10) {
            throw new Exception('Description must be at least 10 characters.');
        }
        if (!isset($data['date']) || !strtotime($data['date'])) {
            throw new Exception('Invalid date format.');
        }
        if (!isset($data['location']) || empty($data['location'])) {
            throw new Exception('Location is required.');
        }
        return true;
    }
} 