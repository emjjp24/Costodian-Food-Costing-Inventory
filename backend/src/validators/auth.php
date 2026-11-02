<?php
// each validator gives [error message or null, clean data or null]

function validateLogin($post){
    $username = isset($post['username']) ? cleanText($post['username']) : "";
    $password = (isset($post['password']) && is_string($post['password'])) ? $post['password'] : "";

    if($username == "" || $password == ""){
        return ['Please enter your username and password.', null];
    }
    return [null, ['username' => $username, 'password' => $password]];
}

function validatePasswordChange($post){
    $current = (isset($post['current_password']) && is_string($post['current_password'])) ? $post['current_password'] : "";
    $new = (isset($post['new_password']) && is_string($post['new_password'])) ? $post['new_password'] : "";
    $confirm = (isset($post['confirm_password']) && is_string($post['confirm_password'])) ? $post['confirm_password'] : "";

    if($current == "" || $new == "" || $confirm == ""){
        return ['Please fill in all the password fields.', null];
    }
    if(strlen($new) < 6 || strlen($new) > 72){
        return ['The new password must be 6 to 72 characters long.', null];
    }
    if($new !== $confirm){
        return ['The new password and the confirmation do not match.', null];
    }
    return [null, ['current' => $current, 'new' => $new]];
}
?>
