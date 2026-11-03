<?php
// save a person who signed up (always as staff, never as admin)
function insertSignupUser($conn, $full_name, $username, $password_hash, $account_type, $business_name){
    $role = 'staff';
    $sql = "INSERT INTO users (full_name, username, password, role, account_type, business_name)
            VALUES (:full_name, :username, :password, :role, :account_type, :business_name)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':full_name', $full_name);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':password', $password_hash);
    $stmt->bindParam(':role', $role);
    $stmt->bindParam(':account_type', $account_type);
    $stmt->bindParam(':business_name', $business_name);
    $stmt->execute();
    return (int)$conn->lastInsertId();
}
?>
