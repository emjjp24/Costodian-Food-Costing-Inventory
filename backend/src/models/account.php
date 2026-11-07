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
?>