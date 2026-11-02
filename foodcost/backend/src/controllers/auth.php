<?php
function authLogin($conn, $user){

    if(isset($_POST['username']) && isset($_POST['password'])){
        list($error, $data) = validateLogin($_POST);
        if($error){
            respond(false, $error, null, 400);
        }

        $found = findUserByUsername($conn, $data['username']);
        if(!$found || !password_verify($data['password'], $found['password'])){
            respond(false, 'Wrong username or password.', null, 401);
        }

        // a new session id after login stops session fixation
        session_regenerate_id(true);
        $_SESSION['userID'] = (int)$found['id'];

        respond(true, 'Welcome, ' . $found['full_name'] . '!', [
            'id' => (int)$found['id'],
            'full_name' => $found['full_name'],
            'username' => $found['username'],
            'role' => $found['role']
        ]);
    }
    respond(false, 'Please enter your username and password.', null, 400);
}

function authLogout($conn, $user){
    $_SESSION = [];
    if(session_status() == PHP_SESSION_ACTIVE){
        session_destroy();
    }
    respond(true, 'You have been logged out.');
}

function authMe($conn, $user){
    respond(true, 'OK', $user);
}

function authPassword($conn, $user){

    list($error, $data) = validatePasswordChange($_POST);
    if($error){
        respond(false, $error, null, 400);
    }

    $found = findUserByUsername($conn, $user['username']);
    if(!password_verify($data['current'], $found['password'])){
        respond(false, 'The current password is wrong.', null, 400);
    }

    updateUserPassword($conn, $user['id'], password_hash($data['new'], PASSWORD_DEFAULT));
    respond(true, 'Your password was changed.');
}
?>
