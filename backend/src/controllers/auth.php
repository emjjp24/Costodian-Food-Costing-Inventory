<?php
// what the frontend gets to know about a logged-in user
function userInfo($row){
    return [
        'id' => (int)$row['id'],
        'full_name' => $row['full_name'],
        'username' => $row['username'],
        'role' => $row['role'],
        'account_id' => (int)$row['account_id'],
        'account_name' => $row['account_name'],
        'account_type' => $row['account_type']
    ];
}

// free sign up: makes a new account (personal or business) and logs the person in
function authRegister($conn, $user){

    if(isset($_POST['username']) && isset($_POST['password'])){
        list($error, $data) = validateRegister($_POST);
        if($error){
            respond(false, $error, null, 400);
        }
        if(usernameTaken($conn, $data['username'], 0)){
            respond(false, 'That username is already taken.', null, 400);
        }

        $conn->beginTransaction();
        try{
            $account_id = insertAccount($conn, $data['account_name'], $data['account_type']);
            // the person who signs up is the administrator of the new account
            $user_id = insertUser($conn, $account_id, $data['full_name'], $data['username'], password_hash($data['password'], PASSWORD_DEFAULT), 'admin');
            seedDefaultCategories($conn, $account_id);
            $conn->commit();
        } catch(Throwable $e){
            if($conn->inTransaction()){
                $conn->rollBack();
            }
            // two people picked the same username at the same moment
            if($e instanceof PDOException && $e->getCode() == '23000'){
                respond(false, 'That username is already taken.', null, 400);
            }
            throw $e;
        }

        session_regenerate_id(true);
        $_SESSION['userID'] = $user_id;

        respond(true, 'Your account is ready. Welcome, ' . $data['full_name'] . '!', userInfo(findUserById($conn, $user_id)), 201);
    }
    respond(false, 'Please fill in your full name, username and password.', null, 400);
}

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

        respond(true, 'Welcome, ' . $found['full_name'] . '!', userInfo(findUserById($conn, $found['id'])));
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
    respond(true, 'OK', userInfo($user));
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