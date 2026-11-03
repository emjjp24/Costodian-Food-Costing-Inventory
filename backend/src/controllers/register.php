<?php
// this file loads what it needs, so nothing else has to change in index.php
include_once(__DIR__ . "/../validators/signup.php");
include_once(__DIR__ . "/../models/signup.php");

// free sign up: makes the user and logs the person in
function authRegister($conn, $user){

    if(isset($_POST['username']) && isset($_POST['password'])){
        list($error, $data) = validateSignup($_POST);
        if($error){
            respond(false, $error, null, 400);
        }
        if(usernameTaken($conn, $data['username'], 0)){
            respond(false, 'That username is already taken.', null, 400);
        }

        try{
            $user_id = insertSignupUser($conn, $data['full_name'], $data['username'], password_hash($data['password'], PASSWORD_DEFAULT), $data['account_type'], $data['business_name']);
        } catch(PDOException $e){
            // two people picked the same username at the same moment
            if($e->getCode() == '23000'){
                respond(false, 'That username is already taken.', null, 400);
            }
            throw $e;
        }

        // a new session id after sign up stops session fixation
        session_regenerate_id(true);
        $_SESSION['userID'] = $user_id;

        respond(true, 'Your account is ready. Welcome, ' . $data['full_name'] . '!', [
            'id' => $user_id,
            'full_name' => $data['full_name'],
            'username' => $data['username'],
            'role' => 'staff',
            'account_type' => $data['account_type'],
            'business_name' => $data['business_name']
        ], 201);
    }
    respond(false, 'Please fill in your full name, username and password.', null, 400);
}
?>
