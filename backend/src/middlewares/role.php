<?php
// make sure the logged-in user has the needed role
function requireRole($user, $role){

    if($user['role'] !== $role){
        respond(false, 'You do not have access to this action.', null, 403);
    }
}

// what each role may do, in one place
// the routes (routes/api.php) enforce it, the frontend only uses this list to hide buttons
// admin = the owner of the account, staff = a helper the owner added (business accounts only)
function permissionsFor($role, $account_type){
    $admin = ($role == 'admin');
    return [
        'view_dashboard' => true,
        'view_recipes' => true,
        'cook_recipe' => true,
        'manage_recipes' => $admin,           // create, edit and delete recipes
        'view_inventory' => true,
        'restock' => true,
        'use_stock' => true,
        'record_waste' => true,
        'add_ingredient' => $admin,
        'edit_ingredient' => $admin,          // category, reorder level, expiry
        'delete_ingredient' => $admin,
        'view_movements' => true,
        'manage_categories' => $admin,
        'manage_staff' => ($admin && $account_type == 'business')
    ];
}
?>