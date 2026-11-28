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

// the optional address and tagline of a business (they can head printed reports)
function updateAccountDetails($conn, $account_id, $address, $tagline){
    $address = ($address == "") ? null : $address;
    $tagline = ($tagline == "") ? null : $tagline;
    $sql = "UPDATE accounts SET address = :address, tagline = :tagline WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':address', $address);
    $stmt->bindParam(':tagline', $tagline);
    $stmt->bindParam(':id', $account_id);
    $stmt->execute();
}

// delete an account with everything in it: recipes, ingredients, stock history, categories and all users
// recipes go first because a recipe line holds on to its ingredient
function deleteAccountWithData($conn, $account_id){
    $stmt = $conn->prepare("DELETE FROM recipes WHERE account_id = :id");
    $stmt->bindParam(':id', $account_id);
    $stmt->execute();

    $stmt = $conn->prepare("DELETE FROM accounts WHERE id = :id");
    $stmt->bindParam(':id', $account_id);
    $stmt->execute();
}
?>