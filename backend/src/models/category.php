<?php
// the starter categories every new account gets
function defaultCategories(){
    return [
        ['Meat & Poultry', 'ingredient'], ['Seafood', 'ingredient'], ['Vegetables & Fruits', 'ingredient'],
        ['Dairy & Eggs', 'ingredient'], ['Dry Goods & Grains', 'ingredient'], ['Condiments & Sauces', 'ingredient'],
        ['Oils & Fats', 'ingredient'], ['Beverages', 'ingredient'], ['Packaging', 'ingredient'],
        ['Main Dish', 'recipe'], ['Appetizer', 'recipe'], ['Dessert', 'recipe'],
        ['Baked Goods', 'recipe'], ['Drinks', 'recipe'], ['Sauces & Sides', 'recipe']
    ];
}

function seedDefaultCategories($conn, $account_id){
    foreach(defaultCategories() as $category){
        insertCategory($conn, $account_id, $category[0], $category[1]);
    }
}

// find a category, only inside the given account
function findCategory($conn, $id, $account_id){
    $sql = "SELECT * FROM categories WHERE id = :id AND account_id = :account_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->execute();
    return $stmt->fetch();
}

// all categories of the account with how many items use each one
function listCategories($conn, $account_id, $type){
    $sql = "SELECT c.id, c.name, c.type,
                   (SELECT COUNT(*) FROM ingredients i WHERE i.category_id = c.id) +
                   (SELECT COUNT(*) FROM recipes r WHERE r.category_id = c.id) AS items
            FROM categories c
            WHERE c.account_id = :account_id";
    if($type != ""){
        $sql .= " AND c.type = :type";
    }
    $sql .= " ORDER BY c.type, c.name";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':account_id', $account_id);
    if($type != ""){
        $stmt->bindParam(':type', $type);
    }
    $stmt->execute();
    return $stmt->fetchAll();
}

// true when another category of the same type already has the name
function categoryNameTaken($conn, $account_id, $name, $type, $except_id){
    $sql = "SELECT id FROM categories WHERE account_id = :account_id AND name = :name AND type = :type AND id <> :except_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':type', $type);
    $stmt->bindParam(':except_id', $except_id);
    $stmt->execute();
    return $stmt->fetch() ? true : false;
}

function insertCategory($conn, $account_id, $name, $type){
    $sql = "INSERT INTO categories (account_id, name, type) VALUES (:account_id, :name, :type)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':type', $type);
    $stmt->execute();
    return (int)$conn->lastInsertId();
}

function renameCategory($conn, $id, $account_id, $name){
    $sql = "UPDATE categories SET name = :name WHERE id = :id AND account_id = :account_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->execute();
}

function deleteCategory($conn, $id, $account_id){
    $sql = "DELETE FROM categories WHERE id = :id AND account_id = :account_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->execute();
}
?>