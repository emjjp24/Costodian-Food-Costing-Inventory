<?php
// make sure a user is logged in, gives the logged-in user
function requireLogin($conn){

    if(!isset($_SESSION['userID'])){
        respond(false, 'Please login first.', null, 401);
    }

    $user = findUserById($conn, $_SESSION['userID']);

    // the account no longer exists
    if(!$user){
        session_destroy();
        respond(false, 'Please login first.', null, 401);
    }

    // the administrator turned this login off
    if(!$user['is_active']){
        $_SESSION = [];
        session_destroy();
        respond(false, 'This account is turned off. Please ask your administrator.', null, 401);
    }

    return $user;
}
?>