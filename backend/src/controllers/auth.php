<?php
// what the frontend gets to know about a logged-in user
function userInfo($row){
    return [
        'id' => (int)$row['id'],
        'full_name' => $row['full_name'],
        'username' => $row['username'],
        'email' => isset($row['email']) ? $row['email'] : null,
        'phone' => isset($row['phone']) ? $row['phone'] : null,
        'role' => $row['role'],
        'recovery_question' => isset($row['recovery_question']) ? $row['recovery_question'] : null,
        'account_id' => (int)$row['account_id'],
        'account_name' => $row['account_name'],
        'account_type' => $row['account_type'],
        'account_address' => isset($row['account_address']) ? $row['account_address'] : null,
        'account_tagline' => isset($row['account_tagline']) ? $row['account_tagline'] : null,
        'created_at' => isset($row['created_at']) ? $row['created_at'] : null,
        'last_login_at' => isset($row['last_login_at']) ? $row['last_login_at'] : null,
        // what this user may do (the frontend hides the buttons that are not allowed)
        'permissions' => permissionsFor($row['role'], $row['account_type'])
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
            $user_id = insertUser($conn, $account_id, $data['full_name'], $data['username'],
                                  password_hash($data['password'], PASSWORD_DEFAULT), 'admin',
                                  $data['recovery_question'],
                                  password_hash(normalizeRecoveryAnswer($data['recovery_answer']), PASSWORD_DEFAULT));
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

function authRecoveryVerify($conn, $user){
    unset($_SESSION['password_recovery']);
    list($error, $data) = validateRecoveryVerification($_POST);
    if($error){
        respond(false, $error, null, 400);
    }

    $wait = loginLockMinutes($conn, $data['username']);
    if($wait > 0){
        respond(false, 'Too many wrong attempts. Please try again in ' . $wait . ($wait == 1 ? ' minute.' : ' minutes.'), null, 429);
    }

    $found = findUserByUsername($conn, $data['username']);
    $verified = $found
        && $found['role'] == 'admin'
        && isset($found['recovery_question'], $found['recovery_answer'])
        && $found['recovery_question'] === $data['recovery_question']
        && password_verify(normalizeRecoveryAnswer($data['recovery_answer']), $found['recovery_answer']);
    if(!$verified){
        recordLoginFailure($conn, $data['username']);
        respond(false, 'The username or recovery details are incorrect.', null, 401);
    }

    session_regenerate_id(true);
    $_SESSION['password_recovery'] = [
        'user_id' => (int)$found['id'],
        'expires_at' => time() + 600
    ];
    respond(true, 'Recovery answer verified. You can now set a new password.');
}

function authRecoveryReset($conn, $user){
    list($error, $data) = validatePasswordRecovery($_POST);
    if($error){
        respond(false, $error, null, 400);
    }

    $state = isset($_SESSION['password_recovery']) && is_array($_SESSION['password_recovery'])
        ? $_SESSION['password_recovery']
        : null;
    if(!$state || !isset($state['user_id'], $state['expires_at']) || (int)$state['expires_at'] <= time()){
        unset($_SESSION['password_recovery']);
        respond(false, 'Please verify your recovery answer again.', null, 401);
    }

    $found = findRecoveryAdminById($conn, (int)$state['user_id']);
    if(!$found){
        unset($_SESSION['password_recovery']);
        respond(false, 'Please verify your recovery answer again.', null, 401);
    }

    updateUserPassword($conn, (int)$found['id'], password_hash($data['new_password'], PASSWORD_DEFAULT));
    clearLoginFailures($conn, $found['username']);
    unset($_SESSION['password_recovery']);
    if(isset($_SESSION['userID']) && (int)$_SESSION['userID'] === (int)$found['id']){
        unset($_SESSION['userID']);
    }
    session_regenerate_id(true);
    respond(true, 'Your password has been reset. You can now log in.');
}

function authRecoveryCancel($conn, $user){
    unset($_SESSION['password_recovery']);
    respond(true, 'Recovery verification cancelled.');
}

function authRecoverySetup($conn, $user){
    if($user['role'] != 'admin'){
        respond(false, 'Only the account administrator can set password recovery details.', null, 403);
    }
    list($error, $data) = validateRecoverySettings($_POST);
    if($error){
        respond(false, $error, null, 400);
    }

    $found = findUserByUsername($conn, $user['username']);
    if(!$found || !password_verify($data['current_password'], $found['password'])){
        respond(false, 'The current password is wrong.', null, 400);
    }

    $answer_hash = password_hash(normalizeRecoveryAnswer($data['recovery_answer']), PASSWORD_DEFAULT);
    updateUserRecovery($conn, (int)$user['id'], $data['recovery_question'], $answer_hash);
    respond(true, 'Your recovery question has been saved.', userInfo(findUserById($conn, $user['id'])));
}

function authLogin($conn, $user){

    if(isset($_POST['username']) && isset($_POST['password'])){
        list($error, $data) = validateLogin($_POST);
        if($error){
            respond(false, $error, null, 400);
        }

        // too many wrong passwords: wait before trying again (even a correct password waits)
        $wait = loginLockMinutes($conn, $data['username']);
        if($wait > 0){
            respond(false, 'Too many wrong attempts. Please try again in ' . $wait . ($wait == 1 ? ' minute.' : ' minutes.'), null, 429);
        }

        $found = findUserByUsername($conn, $data['username']);
        if(!$found || !password_verify($data['password'], $found['password'])){
            $left = recordLoginFailure($conn, $data['username']);
            $message = 'Wrong username or password.';
            if($left === 0){
                $message = 'Too many wrong attempts. Please try again in ' . LOGIN_LOCK_MINUTES . ' minutes.';
                respond(false, $message, null, 429);
            }
            if($left !== null && $left <= 2){
                $message .= ' ' . $left . ($left == 1 ? ' try' : ' tries') . ' left before a ' . LOGIN_LOCK_MINUTES . '-minute lock.';
            }
            respond(false, $message, null, 401);
        }
        clearLoginFailures($conn, $data['username']);

        // a staff login that the administrator turned off cannot sign in
        if(!$found['is_active']){
            respond(false, 'This account is turned off. Please ask your administrator.', null, 403);
        }

        // a new session id after login stops session fixation
        session_regenerate_id(true);
        unset($_SESSION['password_recovery']);
        $_SESSION['userID'] = (int)$found['id'];
        touchLastLogin($conn, (int)$found['id']);

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

// my profile: full_name, username, email, phone, and business_name, business_address, business_tagline (only the administrator of a business account)
function authProfile($conn, $user){

    $is_business = $user['account_type'] == 'business';
    $can_rename_business = $is_business && $user['role'] == 'admin';

    list($error, $data) = validateProfile($_POST, $can_rename_business);
    if($error){
        respond(false, $error, null, 400);
    }
    if(usernameTaken($conn, $data['username'], (int)$user['id'])){
        respond(false, 'That username is already taken.', null, 400);
    }

    try{
        updateOwnProfile($conn, (int)$user['id'], $data['full_name'], $data['username'], $data['email'], $data['phone']);
    } catch(PDOException $e){
        // two people picked the same username at the same moment
        if($e->getCode() == '23000'){
            respond(false, 'That username is already taken.', null, 400);
        }
        throw $e;
    }

    // the name of the account: the business name, or the person's own name for a personal account
    if($can_rename_business){
        updateAccountName($conn, (int)$user['account_id'], $data['business_name']);
        updateAccountDetails($conn, (int)$user['account_id'], $data['business_address'], $data['business_tagline']);
    } elseif(!$is_business){
        updateAccountName($conn, (int)$user['account_id'], $data['full_name']);
    }

    respond(true, 'Your profile was saved.', userInfo(findUserById($conn, (int)$user['id'])));
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

// delete my own account (needs the password)
// a staff member deletes only their own login; the administrator deletes the whole account with all its data
function authDelete($conn, $user){

    list($error, $password) = validateDeleteAccount($_POST);
    if($error){
        respond(false, $error, null, 400);
    }

    $found = findUserByUsername($conn, $user['username']);
    if(!$found || !password_verify($password, $found['password'])){
        respond(false, 'The password is wrong.', null, 400);
    }

    if($user['role'] == 'admin'){
        $conn->beginTransaction();
        try{
            deleteAccountWithData($conn, (int)$user['account_id']);
            $conn->commit();
        } catch(Throwable $e){
            if($conn->inTransaction()){
                $conn->rollBack();
            }
            throw $e;
        }
        $message = 'Your account and all its data were deleted.';
    } else {
        deleteOwnStaffLogin($conn, (int)$user['id']);
        $message = 'Your login was deleted.';
    }

    $_SESSION = [];
    if(session_status() == PHP_SESSION_ACTIVE){
        session_destroy();
    }
    respond(true, $message);
}
?>