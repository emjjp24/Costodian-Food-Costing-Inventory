<?php
function findCategory($conn, $id){
    $sql = "SELECT * FROM categories WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    return $stmt->fetch();
}

// all categories with how many items use each one
function listCategories($conn, $type){
    $sql = "SELECT c.id, c.name, c.type,
                   (SELECT COUNT(*) FROM ingredients i WHERE i.category_id = c.id) +
                   (SELECT COUNT(*) FROM recipes r WHERE r.category_id = c.id) AS items
            FROM categories c";
    if($type != ""){
        $sql .= " WHERE c.type = :type";
    }
    $sql .= " ORDER BY c.type, c.name";
    $stmt = $conn->prepare($sql);
    if($type != ""){
        $stmt->bindParam(':type', $type);
    }
    $stmt->execute();
    return $stmt->fetchAll();
}

// true when another category of the same type already has the name
function categoryNameTaken($conn, $name, $type, $except_id){
    $sql = "SELECT id FROM categories WHERE name = :name AND type = :type AND id <> :except_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':type', $type);
    $stmt->bindParam(':except_id', $except_id);
    $stmt->execute();
    return $stmt->fetch() ? true : false;
}

function insertCategory($conn, $name, $type){
    $sql = "INSERT INTO categories (name, type) VALUES (:name, :type)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':type', $type);
    $stmt->execute();
    return (int)$conn->lastInsertId();
}

function renameCategory($conn, $id, $name){
    $sql = "UPDATE categories SET name = :name WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
}

function deleteCategory($conn, $id){
    $sql = "DELETE FROM categories WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
}
?>
