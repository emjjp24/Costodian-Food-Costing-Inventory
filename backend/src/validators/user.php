<?php
// staff accounts: the administrator types the name, username and a first password
// $is_new = true when creating (password required), false when editing (no password here)
function validateStaff($post, $is_new){
    $full_name = isset($post['full_name']) ? cleanText($post['full_name']) : "";
    $username = isset($post['username']) ? cleanText($post['username']) : "";
    $password = (isset($post['password']) && is_string($post['password'])) ? $post['password'] : "";

    if($full_name == "" || $username == ""){
        return ['Please fill in the full name and the username.', null];
    }
    if(mb_strlen($full_name) > 100){
        return ['The full name must not be longer than 100 characters.', null];
    }
    if(!preg_match('/^[A-Za-z0-9_.-]{3,50}$/', $username)){
        return ['The username must be 3 to 50 characters: letters, numbers, dot, dash or underscore.', null];
    }
    if($is_new){
        if($password == ""){
            return ['Please enter a password for the staff member.', null];
        }
        if(strlen($password) < 6 || strlen($password) > 72){
            return ['The password must be 6 to 72 characters long.', null];
        }
    }

    return [null, ['full_name' => $full_name, 'username' => $username, 'password' => $password]];
}

// the administrator sets a new password for a staff member (for example when it was forgotten)
function validateStaffPassword($post){
    $password = (isset($post['new_password']) && is_string($post['new_password'])) ? $post['new_password'] : "";
    $confirm = (isset($post['confirm_password']) && is_string($post['confirm_password'])) ? $post['confirm_password'] : "";

    if($password == ""){
        return ['Please enter the new password.', null];
    }
    if(strlen($password) < 6 || strlen($password) > 72){
        return ['The password must be 6 to 72 characters long.', null];
    }
    if($confirm != "" && $password !== $confirm){
        return ['The new password and the confirmation do not match.', null];
    }
    return [null, $password];
}

// turn a staff login on or off: active = 1 or 0 (true / false also work)
function validateStaffStatus($post){
    if(!isset($post['active'])){
        return ['Please say if the account should be on or off.', null];
    }
    $value = $post['active'];
    if($value === true || $value === 1 || $value === '1' || $value === 'true'){
        return [null, 1];
    }
    if($value === false || $value === 0 || $value === '0' || $value === 'false'){
        return [null, 0];
    }
    return ['The status must be 1 (on) or 0 (off).', null];
}
?>