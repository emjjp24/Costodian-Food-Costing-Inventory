<?php
function inventoryList($conn, $user){

    $account_id = (int)$user['account_id'];
    $search = isset($_GET['search']) ? cleanText($_GET['search']) : "";
    $category_id = optionalId(isset($_GET['category_id']) ? $_GET['category_id'] : null);
    if($category_id === false){
        respond(false, 'The category is not valid.', null, 400);
    }

    $status = isset($_GET['status']) ? cleanText($_GET['status']) : "";
    if($status != "" && !in_array($status, ['low', 'out', 'expired', 'expiring', 'alert'], true)){
        respond(false, 'The status must be low, out, expired, expiring or alert.', null, 400);
    }

    $items = [];
    foreach(listIngredients($conn, $account_id, $search, $category_id, $status, date('Y-m-d'), soonDate()) as $row){
        $items[] = formatIngredient($row);
    }
    respond(true, 'OK', $items);
}

function inventoryView($conn, $user){

    $account_id = (int)$user['account_id'];
    $id = requestId(isset($_GET['id']) ? $_GET['id'] : 0);
    $row = $id > 0 ? findIngredientById($conn, $id, $account_id) : false;
    if(!$row){
        respond(false, 'Ingredient not found.', null, 404);
    }

    $filters = ['account_id' => $account_id, 'ingredient_id' => $id, 'type' => '', 'from' => '', 'to' => ''];
    $history = [];
    foreach(listMovements($conn, $filters, 20, 0) as $move){
        $history[] = formatMovement($move);
    }

    $data = formatIngredient($row);
    $data['used_in_recipes'] = countRecipesUsing($conn, $id);
    $data['history'] = $history;
    respond(true, 'OK', $data);
}

function inventoryUpdate($conn, $user){

    $account_id = (int)$user['account_id'];
    $id = requestId(isset($_POST['id']) ? $_POST['id'] : 0);
    $row = $id > 0 ? findIngredientById($conn, $id, $account_id) : false;
    if(!$row){
        respond(false, 'Ingredient not found.', null, 404);
    }

    list($error, $data) = validateIngredientDetails($_POST, $row);
    if($error){
        respond(false, $error, null, 400);
    }

    if($data['category_id'] !== null){
        $category = findCategory($conn, $data['category_id'], $account_id);
        if(!$category || $category['type'] != 'ingredient'){
            respond(false, 'The ingredient category does not exist.', null, 400);
        }
    }

    updateIngredientDetails($conn, $id, $account_id, $data['category_id'], decimalString($data['reorder_level'], 3), $data['expiry_date']);
    respond(true, 'Ingredient updated.', formatIngredient(findIngredientById($conn, $id, $account_id)));
}

function inventoryDelete($conn, $user){

    $account_id = (int)$user['account_id'];
    $id = requestId(isset($_POST['id']) ? $_POST['id'] : 0);
    if($id == 0 || !findIngredientById($conn, $id, $account_id)){
        respond(false, 'Ingredient not found.', null, 404);
    }

    $used = countRecipesUsing($conn, $id);
    if($used > 0){
        respond(false, 'This ingredient is used in ' . $used . ' recipe(s). Remove it from them first.', null, 400);
    }

    deleteIngredient($conn, $id, $account_id);
    respond(true, 'Ingredient deleted.');
}
?>