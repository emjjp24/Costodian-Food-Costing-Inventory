<?php
// staff accounts: the administrator (owner) of a business account adds helpers
// every staff member belongs to the administrator's account, so they see the same recipes and inventory
// what a staff member may do is decided by permissionsFor() in middlewares/role.php

// what the frontend gets for one staff member (never the password)
function formatStaff($row){
    return [
        'id' => (int)$row['id'],
        'full_name' => $row['full_name'],
        'username' => $row['username'],
        'is_active' => (bool)$row['is_active'],
        'last_login_at' => $row['last_login_at'],
        'last_activity_at' => $row['last_activity_at'],
        'movement_count' => (int)$row['movement_count'],
        'created_at' => $row['created_at']
    ];
}

// a staff member of the logged-in administrator's account, or a 404 (other accounts look like "not found")
function loadStaffOr404($conn, $user, $source){
    $id = requestId(isset($source['id']) ? $source['id'] : 0);
    $member = $id > 0 ? findStaffMember($conn, $id, (int)$user['account_id']) : false;
    if(!$member){
        respond(false, 'Staff member not found.', null, 404);
    }
    return $member;
}

function staffList($conn, $user){
    $can_add = ($user['account_type'] == 'business');

    $members = [];
    foreach(listStaff($conn, (int)$user['account_id']) as $row){
        $members[] = formatStaff($row);
    }

    respond(true, 'OK', [
        'can_add_staff' => $can_add,
        'max_staff' => MAX_STAFF_PER_ACCOUNT,
        'staff_count' => count($members),
        'note' => $can_add ? '' : 'A personal account has only one user. Sign up with a business account to add staff.',
        'members' => $members
    ]);
}

// one staff member with the last things they did
function staffView($conn, $user){
    $member = loadStaffOr404($conn, $user, $_GET);

    $filters = ['account_id' => (int)$user['account_id'], 'user_id' => (int)$member['id'], 'ingredient_id' => null, 'type' => "", 'from' => "", 'to' => ""];
    $recent = [];
    foreach(listMovements($conn, $filters, 20, 0) as $row){
        $recent[] = formatMovement($row);
    }

    $data = formatStaff($member);
    $data['recent_activity'] = $recent;
    respond(true, 'OK', $data);
}

// everything one staff member (or all staff) did, paged and filterable like stock/movements
// user_id is optional: leave it out to see the actions of all users of the account
function staffActivity($conn, $user){

    list($error, $filters) = validateMovementFilters($_GET);
    if($error){
        respond(false, $error, null, 400);
    }

    $filters['account_id'] = (int)$user['account_id'];
    $filters['user_id'] = null;
    if(isset($_GET['user_id']) && $_GET['user_id'] !== ""){
        $member = loadStaffOr404($conn, $user, ['id' => $_GET['user_id']]);
        $filters['user_id'] = (int)$member['id'];
    }

    $total = countMovements($conn, $filters);
    $offset = ($filters['page'] - 1) * $filters['per_page'];

    $items = [];
    foreach(listMovements($conn, $filters, $filters['per_page'], $offset) as $row){
        $items[] = formatMovement($row);
    }

    respond(true, 'OK', [
        'items' => $items,
        'page' => $filters['page'],
        'per_page' => $filters['per_page'],
        'total' => $total,
        'pages' => (int)ceil($total / $filters['per_page'])
    ]);
}

function staffCreate($conn, $user){

    if($user['account_type'] != 'business'){
        respond(false, 'A personal account has only one user. Sign up with a business account to add staff.', null, 400);
    }

    if(!isset($_POST['username'])){
        respond(false, 'Please fill in the staff details.', null, 400);
    }

    list($error, $data) = validateStaff($_POST, true);
    if($error){
        respond(false, $error, null, 400);
    }

    $account_id = (int)$user['account_id'];
    if(countStaff($conn, $account_id) >= MAX_STAFF_PER_ACCOUNT){
        respond(false, 'You can add up to ' . MAX_STAFF_PER_ACCOUNT . ' staff accounts.', null, 400);
    }
    if(usernameTaken($conn, $data['username'], 0)){
        respond(false, 'That username is already taken.', null, 400);
    }

    // the role is always staff here, only sign up makes an administrator
    try{
        $id = insertUser($conn, $account_id, $data['full_name'], $data['username'], password_hash($data['password'], PASSWORD_DEFAULT), 'staff');
    } catch(PDOException $e){
        // two people picked the same username at the same moment
        if($e->getCode() == '23000'){
            respond(false, 'That username is already taken.', null, 400);
        }
        throw $e;
    }

    respond(true, 'Staff account added for ' . $data['full_name'] . '.', formatStaff(findStaffMember($conn, $id, $account_id)), 201);
}

// change the name or the username (the password has its own route)
function staffUpdate($conn, $user){
    $member = loadStaffOr404($conn, $user, $_POST);

    list($error, $data) = validateStaff($_POST, false);
    if($error){
        respond(false, $error, null, 400);
    }
    if(usernameTaken($conn, $data['username'], (int)$member['id'])){
        respond(false, 'That username is already taken.', null, 400);
    }

    updateStaffDetails($conn, (int)$member['id'], $data['full_name'], $data['username']);
    respond(true, 'Staff account updated.', formatStaff(findStaffMember($conn, (int)$member['id'], (int)$user['account_id'])));
}

// the administrator sets a new password for a staff member
function staffPassword($conn, $user){
    $member = loadStaffOr404($conn, $user, $_POST);

    list($error, $password) = validateStaffPassword($_POST);
    if($error){
        respond(false, $error, null, 400);
    }

    updateUserPassword($conn, (int)$member['id'], password_hash($password, PASSWORD_DEFAULT));
    respond(true, 'The password of ' . $member['full_name'] . ' was changed.');
}

// turn a staff login on or off, their history stays
// a turned-off person is logged out on their next request
function staffStatus($conn, $user){
    $member = loadStaffOr404($conn, $user, $_POST);

    list($error, $active) = validateStaffStatus($_POST);
    if($error){
        respond(false, $error, null, 400);
    }

    setUserActive($conn, (int)$member['id'], $active);
    respond(true, $active ? $member['full_name'] . ' can log in again.' : $member['full_name'] . ' can no longer log in.');
}

// delete a staff account for good
// their lines in the stock history stay, but without a name (turning the account off keeps the name)
function staffDelete($conn, $user){
    $member = loadStaffOr404($conn, $user, $_POST);

    deleteUser($conn, (int)$member['id']);
    respond(true, 'Staff account deleted.');
}
?>