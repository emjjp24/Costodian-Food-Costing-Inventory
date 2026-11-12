<?php
// find a user by id (without the password), with the account the user belongs to
function findUserById($conn, $id){
    $sql = "SELECT u.id, u.account_id, u.full_name, u.username, u.role, u.is_active, u.last_login_at, u.created_at,
                   a.name AS account_name, a.type AS account_type
            FROM users u
            JOIN accounts a ON a.id = u.account_id
            WHERE u.id = :id";
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

// true when the username is used by someone else (usernames are unique for everyone)
function usernameTaken($conn, $username, $except_id){
    $sql = "SELECT id FROM users WHERE username = :username AND id <> :except_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':except_id', $except_id);
    $stmt->execute();
    return $stmt->fetch() ? true : false;
}

// the staff of one account, with how much each one has done
function listStaff($conn, $account_id){
    $sql = "SELECT u.id, u.full_name, u.username, u.role, u.is_active, u.last_login_at, u.created_at,
                   (SELECT COUNT(*) FROM stock_movements m WHERE m.user_id = u.id) AS movement_count,
                   (SELECT MAX(m.created_at) FROM stock_movements m WHERE m.user_id = u.id) AS last_activity_at
            FROM users u
            WHERE u.account_id = :account_id AND u.role = 'staff'
            ORDER BY u.full_name";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->execute();
    return $stmt->fetchAll();
}

function countStaff($conn, $account_id){
    $sql = "SELECT COUNT(*) AS total FROM users WHERE role = 'staff' AND account_id = :account_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->execute();
    $row = $stmt->fetch();
    return (int)$row['total'];
}

// one staff member of this account (false when it is somebody else's user or not staff)
function findStaffMember($conn, $id, $account_id){
    $sql = "SELECT u.id, u.full_name, u.username, u.role, u.is_active, u.last_login_at, u.created_at,
                   (SELECT COUNT(*) FROM stock_movements m WHERE m.user_id = u.id) AS movement_count,
                   (SELECT MAX(m.created_at) FROM stock_movements m WHERE m.user_id = u.id) AS last_activity_at
            FROM users u
            WHERE u.id = :id AND u.account_id = :account_id AND u.role = 'staff'";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->execute();
    return $stmt->fetch();
}

function insertUser($conn, $account_id, $full_name, $username, $password_hash, $role){
    $sql = "INSERT INTO users (account_id, full_name, username, password, role) VALUES (:account_id, :full_name, :username, :password, :role)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->bindParam(':full_name', $full_name);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':password', $password_hash);
    $stmt->bindParam(':role', $role);
    $stmt->execute();
    return (int)$conn->lastInsertId();
}

function updateStaffDetails($conn, $id, $full_name, $username){
    $sql = "UPDATE users SET full_name = :full_name, username = :username WHERE id = :id AND role = 'staff'";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':full_name', $full_name);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
}

// turn a login on (1) or off (0), the history of that user is kept
function setUserActive($conn, $id, $active){
    $sql = "UPDATE users SET is_active = :active WHERE id = :id AND role = 'staff'";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':active', $active, PDO::PARAM_INT);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
}

function touchLastLogin($conn, $id){
    $now = date('Y-m-d H:i:s');
    $sql = "UPDATE users SET last_login_at = :now WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':now', $now);
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
    $sql = "DELETE FROM users WHERE id = :id AND role = 'staff'";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
}
?>