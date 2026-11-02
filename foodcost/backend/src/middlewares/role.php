<?php
// make sure the logged-in user has the needed role
function requireRole($user, $role){

    if($user['role'] !== $role){
        respond(false, 'You do not have access to this action.', null, 403);
    }
}
?>
