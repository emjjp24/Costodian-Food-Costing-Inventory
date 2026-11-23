<?php
// an account is one person (personal) or one small business (business)
function insertAccount($conn, $name, $type){
    $sql = "INSERT INTO accounts (name, type) VALUES (:name, :type)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':type', $type);
    $stmt->execute();
    return (int)$conn->lastInsertId();
}

// the name of the business (or of the person, for a personal account)
function updateAccountName($conn, $account_id, $name){
    $sql = "UPDATE accounts SET name = :name WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':id', $account_id);
    $stmt->execute();
}
?>