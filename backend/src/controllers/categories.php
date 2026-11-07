<?php
function categoriesList($conn, $user){

    $type = isset($_GET['type']) ? cleanText($_GET['type']) : "";
    if($type != "" && $type != 'ingredient' && $type != 'recipe'){
        respond(false, 'The type must be ingredient or recipe.', null, 400);
    }

    $items = [];
    foreach(listCategories($conn, (int)$user['account_id'], $type) as $row){
        $items[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'type' => $row['type'],
            'items' => (int)$row['items']
        ];
    }
    respond(true, 'OK', $items);
}

function categoriesCreate($conn, $user){

    $account_id = (int)$user['account_id'];
    $name = isset($_POST['name']) ? cleanText($_POST['name']) : "";
    $type = isset($_POST['type']) ? cleanText($_POST['type']) : "";

    if($name == "" || $type == ""){
        respond(false, 'Please enter the category name and type.', null, 400);
    }
    if(mb_strlen($name) > 80){
        respond(false, 'The name must not be longer than 80 characters.', null, 400);
    }
    if($type != 'ingredient' && $type != 'recipe'){
        respond(false, 'The type must be ingredient or recipe.', null, 400);
    }
    if(categoryNameTaken($conn, $account_id, $name, $type, 0)){
        respond(false, 'That category already exists.', null, 400);
    }

    $id = insertCategory($conn, $account_id, $name, $type);
    respond(true, 'Category added.', ['id' => $id, 'name' => $name, 'type' => $type], 201);
}

function categoriesUpdate($conn, $user){

    $account_id = (int)$user['account_id'];
    $id = requestId(isset($_POST['id']) ? $_POST['id'] : 0);
    $category = $id > 0 ? findCategory($conn, $id, $account_id) : false;
    if(!$category){
        respond(false, 'Category not found.', null, 404);
    }

    $name = isset($_POST['name']) ? cleanText($_POST['name']) : "";
    if($name == ""){
        respond(false, 'Please enter the category name.', null, 400);
    }
    if(mb_strlen($name) > 80){
        respond(false, 'The name must not be longer than 80 characters.', null, 400);
    }
    if(categoryNameTaken($conn, $account_id, $name, $category['type'], $id)){
        respond(false, 'That category already exists.', null, 400);
    }

    renameCategory($conn, $id, $account_id, $name);
    respond(true, 'Category updated.');
}

function categoriesDelete($conn, $user){

    $account_id = (int)$user['account_id'];
    $id = requestId(isset($_POST['id']) ? $_POST['id'] : 0);
    if($id == 0 || !findCategory($conn, $id, $account_id)){
        respond(false, 'Category not found.', null, 404);
    }

    // items in the category are kept and become uncategorized
    deleteCategory($conn, $id, $account_id);
    respond(true, 'Category deleted. Items in it are now uncategorized.');
}
?>