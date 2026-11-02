<?php
// $is_new = true when creating (password required), false when editing
function validateUser($post, $is_new){
    $full_name = isset($post['full_name']) ? cleanText($post['full_name']) : "";
    $username = isset($post['username']) ? cleanText($post['username']) : "";
    $role = isset($post['role']) ? cleanText($post['role']) : "";
    $password = (isset($post['password']) && is_string($post['password'])) ? $post['password'] : "";

    if($full_name == "" || $username == "" || $role == ""){
        return ['Please fill in the full name, username and role.', null];
    }
    if(mb_strlen($full_name) > 100){
        return ['The full name must not be longer than 100 characters.', null];
    }
    if(!preg_match('/^[A-Za-z0-9_.-]{3,50}$/', $username)){
        return ['The username must be 3 to 50 characters: letters, numbers, dot, dash or underscore.', null];
    }
    if($role != 'admin' && $role != 'staff'){
        return ['The role must be admin or staff.', null];
    }
    if($is_new && $password == ""){
        return ['Please enter a password.', null];
    }
    if($password != "" && (strlen($password) < 6 || strlen($password) > 72)){
        return ['The password must be 6 to 72 characters long.', null];
    }

    return [null, ['full_name' => $full_name, 'username' => $username, 'role' => $role, 'password' => $password]];
}
?>
