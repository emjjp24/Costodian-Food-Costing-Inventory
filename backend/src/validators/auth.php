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

function recoveryQuestionOptions(){
    return [
        'first_pet' => 'What was the name of your first pet?',
        'first_school' => 'What was the name of your first school?',
        'birth_city' => 'In which city were you born?',
        'childhood_nickname' => 'What was your childhood nickname?',
        'favorite_teacher' => 'What was the surname of a favorite teacher?'
    ];
}

function normalizeRecoveryAnswer($answer){
    return mb_strtolower(cleanText($answer), 'UTF-8');
}

function recoveryAnswerTooLong($answer){
    return strlen(normalizeRecoveryAnswer($answer)) > 72;
}

// sign up: a personal account or a small business account
function validateRegister($post){
    $full_name = isset($post['full_name']) ? cleanText($post['full_name']) : "";
    $username = isset($post['username']) ? cleanText($post['username']) : "";
    $type = isset($post['account_type']) ? cleanText($post['account_type']) : "";
    $business_name = isset($post['business_name']) ? cleanText($post['business_name']) : "";
    $password = (isset($post['password']) && is_string($post['password'])) ? $post['password'] : "";
    $confirm = (isset($post['confirm_password']) && is_string($post['confirm_password'])) ? $post['confirm_password'] : "";
    $recovery_question = isset($post['recovery_question']) ? cleanText($post['recovery_question']) : "";
    $recovery_answer = isset($post['recovery_answer']) ? cleanText($post['recovery_answer']) : "";

    if($full_name == "" || $username == "" || $password == "" || $confirm == ""){
        return ['Please fill in your full name, username and password.', null];
    }
    if($recovery_question == "" || $recovery_answer == ""){
        return ['Please choose a recovery question and enter its answer.', null];
    }
    if(!array_key_exists($recovery_question, recoveryQuestionOptions())){
        return ['Please choose a valid recovery question.', null];
    }
    if(recoveryAnswerTooLong($recovery_answer)){
        return ['The recovery answer must not be longer than 72 characters.', null];
    }
    if($type != 'personal' && $type != 'business'){
        return ['Please choose the account type: personal or business.', null];
    }
    if(mb_strlen($full_name) > 100){
        return ['The full name must not be longer than 100 characters.', null];
    }
    if(!preg_match('/^[A-Za-z0-9_.-]{3,50}$/', $username)){
        return ['The username must be 3 to 50 characters: letters, numbers, dot, dash or underscore.', null];
    }
    if(strlen($password) < MIN_PASSWORD_LENGTH || strlen($password) > 72){
        return ['The password must be ' . MIN_PASSWORD_LENGTH . ' to 72 characters long.', null];
    }
    if($password !== $confirm){
        return ['The password and the confirmation do not match.', null];
    }

    // a business needs a name, a personal account just uses the person's name
    if($type == 'business'){
        if($business_name == ""){
            return ['Please enter the name of your business.', null];
        }
        if(mb_strlen($business_name) > 100){
            return ['The business name must not be longer than 100 characters.', null];
        }
        $account_name = $business_name;
    } else {
        $account_name = $full_name;
    }

    return [null, ['full_name' => $full_name, 'username' => $username, 'password' => $password,
                   'account_type' => $type, 'account_name' => $account_name,
                   'recovery_question' => $recovery_question, 'recovery_answer' => $recovery_answer]];
}

function validateRecoveryVerification($post){
    $username = isset($post['username']) ? cleanText($post['username']) : "";
    $question = isset($post['recovery_question']) ? cleanText($post['recovery_question']) : "";
    $answer = isset($post['recovery_answer']) ? cleanText($post['recovery_answer']) : "";

    if($username == "" || $question == "" || $answer == ""){
        return ['Please fill in your username, recovery question and answer.', null];
    }
    if(!preg_match('/^[A-Za-z0-9_.-]{3,50}$/', $username)){
        return ['The username must be 3 to 50 characters: letters, numbers, dot, dash or underscore.', null];
    }
    if(!array_key_exists($question, recoveryQuestionOptions())){
        return ['Please choose a valid recovery question.', null];
    }
    if(recoveryAnswerTooLong($answer)){
        return ['The recovery answer must not be longer than 72 characters.', null];
    }
    return [null, ['username' => $username, 'recovery_question' => $question, 'recovery_answer' => $answer]];
}

function validatePasswordRecovery($post){
    $new = (isset($post['new_password']) && is_string($post['new_password'])) ? $post['new_password'] : "";
    $confirm = (isset($post['confirm_password']) && is_string($post['confirm_password'])) ? $post['confirm_password'] : "";

    if($new == "" || $confirm == ""){
        return ['Please enter and confirm your new password.', null];
    }
    if(strlen($new) < MIN_PASSWORD_LENGTH || strlen($new) > 72){
        return ['The new password must be ' . MIN_PASSWORD_LENGTH . ' to 72 characters long.', null];
    }
    if($new !== $confirm){
        return ['The new password and the confirmation do not match.', null];
    }
    return [null, ['new_password' => $new]];
}

function validateRecoverySettings($post){
    $question = isset($post['recovery_question']) ? cleanText($post['recovery_question']) : "";
    $answer = isset($post['recovery_answer']) ? cleanText($post['recovery_answer']) : "";
    $current_password = (isset($post['current_password']) && is_string($post['current_password'])) ? $post['current_password'] : "";

    if($question == "" || $answer == "" || $current_password == ""){
        return ['Please choose a recovery question, enter its answer and confirm your current password.', null];
    }
    if(strlen($current_password) > 72){
        return ['The current password is not valid.', null];
    }
    if(!array_key_exists($question, recoveryQuestionOptions())){
        return ['Please choose a valid recovery question.', null];
    }
    if(recoveryAnswerTooLong($answer)){
        return ['The recovery answer must not be longer than 72 characters.', null];
    }
    return [null, ['recovery_question' => $question, 'recovery_answer' => $answer,
                   'current_password' => $current_password]];
}

// "my profile": full name, username, email and contact number for everyone (email and number are optional),
// the business name, address and tagline only for the administrator of a business
function validateProfile($post, $can_rename_business){
    $full_name = isset($post['full_name']) ? cleanText($post['full_name']) : "";
    $username = isset($post['username']) ? cleanText($post['username']) : "";
    $email = isset($post['email']) ? cleanText($post['email']) : "";
    $phone = isset($post['phone']) ? cleanText($post['phone']) : "";
    $business_name = isset($post['business_name']) ? cleanText($post['business_name']) : "";
    $address = isset($post['business_address']) ? cleanText($post['business_address']) : "";
    $tagline = isset($post['business_tagline']) ? cleanText($post['business_tagline']) : "";

    if($full_name == "" || $username == ""){
        return ['Please fill in your full name and username.', null];
    }
    if(mb_strlen($full_name) > 100){
        return ['The full name must not be longer than 100 characters.', null];
    }
    if(!preg_match('/^[A-Za-z0-9_.-]{3,50}$/', $username)){
        return ['The username must be 3 to 50 characters: letters, numbers, dot, dash or underscore.', null];
    }
    if($email != ""){
        if(mb_strlen($email) > 150 || !filter_var($email, FILTER_VALIDATE_EMAIL)){
            return ['Please enter a valid email address, or leave it empty.', null];
        }
    }
    if($phone != ""){
        if(!preg_match('/^[0-9+()\-. ]{7,30}$/', $phone)){
            return ['The contact number can only have digits, spaces, + ( ) - and a dot (7 to 30 characters).', null];
        }
    }
    if($can_rename_business){
        if($business_name == ""){
            return ['Please enter the name of your business.', null];
        }
        if(mb_strlen($business_name) > 100){
            return ['The business name must not be longer than 100 characters.', null];
        }
        if(mb_strlen($address) > 255){
            return ['The business address must not be longer than 255 characters.', null];
        }
        if(mb_strlen($tagline) > 150){
            return ['The tagline must not be longer than 150 characters.', null];
        }
    }
    return [null, ['full_name' => $full_name, 'username' => $username, 'email' => $email, 'phone' => $phone,
                   'business_name' => $business_name, 'business_address' => $address, 'business_tagline' => $tagline]];
}

function validatePasswordChange($post){
    $current = (isset($post['current_password']) && is_string($post['current_password'])) ? $post['current_password'] : "";
    $new = (isset($post['new_password']) && is_string($post['new_password'])) ? $post['new_password'] : "";
    $confirm = (isset($post['confirm_password']) && is_string($post['confirm_password'])) ? $post['confirm_password'] : "";

    if($current == "" || $new == "" || $confirm == ""){
        return ['Please fill in all the password fields.', null];
    }
    if(strlen($new) < MIN_PASSWORD_LENGTH || strlen($new) > 72){
        return ['The new password must be ' . MIN_PASSWORD_LENGTH . ' to 72 characters long.', null];
    }
    if($new !== $confirm){
        return ['The new password and the confirmation do not match.', null];
    }
    return [null, ['current' => $current, 'new' => $new]];
}

// deleting your own account asks for the password once more
function validateDeleteAccount($post){
    $password = (isset($post['password']) && is_string($post['password'])) ? $post['password'] : "";
    if($password == ""){
        return ['Please enter your password to delete the account.', null];
    }
    return [null, $password];
}
?>