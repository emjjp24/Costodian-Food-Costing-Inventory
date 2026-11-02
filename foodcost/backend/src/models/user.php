<?php
// find a user by id (without the password)
function findUserById($conn, $id){
    $sql = "SELECT id, full_name, username, role, created_at FROM users WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    return $stmt->fetch();
}

// find a user by username (with the password, used for login only)
function findUserByUsername($conn, $username){
    $sql = "SELECT * FROM users WHERE username = :username";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $username);
    $stmt->execute();
    return $stmt->fetch();
}

// true when the username is used by someone else
function usernameTaken($conn, $username, $except_id){
    $sql = "SELECT id FROM users WHERE username = :username AND id <> :except_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':except_id', $except_id);
    $stmt->execute();
    return $stmt->fetch() ? true : false;
}

function listUsers($conn){
    $sql = "SELECT id, full_name, username, role, created_at FROM users ORDER BY full_name";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll();
}

function countAdmins($conn){
    $sql = "SELECT COUNT(*) AS total FROM users WHERE role = 'admin'";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $row = $stmt->fetch();
    return (int)$row['total'];
}

function insertUser($conn, $full_name, $username, $password_hash, $role){
    $sql = "INSERT INTO users (full_name, username, password, role) VALUES (:full_name, :username, :password, :role)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':full_name', $full_name);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':password', $password_hash);
    $stmt->bindParam(':role', $role);
    $stmt->execute();
    return (int)$conn->lastInsertId();
}

function updateUser($conn, $id, $full_name, $username, $role){
    $sql = "UPDATE users SET full_name = :full_name, username = :username, role = :role WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':full_name', $full_name);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':role', $role);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
}

function updateUserPassword($conn, $id, $password_hash){
    $sql = "UPDATE users SET password = :password WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':password', $password_hash);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
}

function deleteUser($conn, $id){
    $sql = "DELETE FROM users WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
}
?>
