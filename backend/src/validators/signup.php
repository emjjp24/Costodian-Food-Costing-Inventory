<?php
// sign up form: personal use or small business
// gives [error message or null, clean data or null]
function validateSignup($post){
    $full_name = isset($post['full_name']) ? cleanText($post['full_name']) : "";
    $username = isset($post['username']) ? cleanText($post['username']) : "";
    $type = isset($post['account_type']) ? cleanText($post['account_type']) : "";
    $business_name = isset($post['business_name']) ? cleanText($post['business_name']) : "";
    $password = (isset($post['password']) && is_string($post['password'])) ? $post['password'] : "";
    $confirm = (isset($post['confirm_password']) && is_string($post['confirm_password'])) ? $post['confirm_password'] : "";

    if($full_name == "" || $username == "" || $password == "" || $confirm == ""){
        return ['Please fill in your full name, username and password.', null];
    }
    if($type != 'personal' && $type != 'business'){
        return ['Please choose personal use or small business.', null];
    }
    if(mb_strlen($full_name) > 100){
        return ['The full name must not be longer than 100 characters.', null];
    }
    if(!preg_match('/^[A-Za-z0-9_.-]{3,50}$/', $username)){
        return ['The username must be 3 to 50 characters: letters, numbers, dot, dash or underscore.', null];
    }
    if(strlen($password) < 6 || strlen($password) > 72){
        return ['The password must be 6 to 72 characters long.', null];
    }
    if($password !== $confirm){
        return ['The password and the confirmation do not match.', null];
    }

    // a business needs a name, a personal account does not
    if($type == 'business'){
        if($business_name == ""){
            return ['Please enter the name of your business.', null];
        }
        if(mb_strlen($business_name) > 100){
            return ['The business name must not be longer than 100 characters.', null];
        }
    } else {
        $business_name = null;
    }

    return [null, ['full_name' => $full_name, 'username' => $username, 'password' => $password, 'account_type' => $type, 'business_name' => $business_name]];
}
?>
