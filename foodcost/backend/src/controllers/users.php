<?php
function usersList($conn, $user){
    respond(true, 'OK', listUsers($conn));
}

function usersCreate($conn, $user){

    if(isset($_POST['username'])){
        list($error, $data) = validateUser($_POST, true);
        if($error){
            respond(false, $error, null, 400);
        }
        if(usernameTaken($conn, $data['username'], 0)){
            respond(false, 'That username is already taken.', null, 400);
        }

        $id = insertUser($conn, $data['full_name'], $data['username'], password_hash($data['password'], PASSWORD_DEFAULT), $data['role']);
        respond(true, 'User added.', ['id' => $id], 201);
    }
    respond(false, 'Please fill in the user details.', null, 400);
}

function usersUpdate($conn, $user){

    $id = requestId(isset($_POST['id']) ? $_POST['id'] : 0);
    $target = $id > 0 ? findUserById($conn, $id) : false;
    if(!$target){
        respond(false, 'User not found.', null, 404);
    }

    list($error, $data) = validateUser($_POST, false);
    if($error){
        respond(false, $error, null, 400);
    }
    if(usernameTaken($conn, $data['username'], $id)){
        respond(false, 'That username is already taken.', null, 400);
    }

    // there must always be one administrator left
    if($target['role'] == 'admin' && $data['role'] != 'admin' && countAdmins($conn) <= 1){
        respond(false, 'This is the only administrator, so it cannot be changed to staff.', null, 400);
    }

    updateUser($conn, $id, $data['full_name'], $data['username'], $data['role']);
    if($data['password'] != ""){
        updateUserPassword($conn, $id, password_hash($data['password'], PASSWORD_DEFAULT));
    }
    respond(true, 'User updated.');
}

function usersDelete($conn, $user){

    $id = requestId(isset($_POST['id']) ? $_POST['id'] : 0);
    $target = $id > 0 ? findUserById($conn, $id) : false;
    if(!$target){
        respond(false, 'User not found.', null, 404);
    }
    if($id == (int)$user['id']){
        respond(false, 'You cannot delete your own account.', null, 400);
    }
    if($target['role'] == 'admin' && countAdmins($conn) <= 1){
        respond(false, 'This is the only administrator, so it cannot be deleted.', null, 400);
    }

    deleteUser($conn, $id);
    respond(true, 'User deleted.');
}
?>
