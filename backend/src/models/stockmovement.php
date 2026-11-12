<?php
// write one line in the stock history
// qty is always a positive number, the type tells if it went in or out
function insertMovement($conn, $ingredient_id, $type, $qty, $unit_cost, $reference, $user_id){
    $sql = "INSERT INTO stock_movements (ingredient_id, type, qty, unit_cost, reference, user_id)
            VALUES (:ingredient_id, :type, :qty, :unit_cost, :reference, :user_id)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':ingredient_id', $ingredient_id);
    $stmt->bindParam(':type', $type);
    $stmt->bindParam(':qty', $qty);
    $stmt->bindParam(':unit_cost', $unit_cost);
    $stmt->bindParam(':reference', $reference);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
}

// build the filter part shared by the list and the count
// the account filter is always there, so one account never sees another account's history
function movementFilter($filters, &$params){
    $where = " WHERE i.account_id = :account_id";
    $params[':account_id'] = $filters['account_id'];
    if($filters['ingredient_id'] !== null){
        $where .= " AND m.ingredient_id = :ingredient_id";
        $params[':ingredient_id'] = $filters['ingredient_id'];
    }
    // only the actions of one user (the staff page uses this)
    if(isset($filters['user_id']) && $filters['user_id'] !== null){
        $where .= " AND m.user_id = :user_id";
        $params[':user_id'] = $filters['user_id'];
    }
    if($filters['type'] != ""){
        $where .= " AND m.type = :type";
        $params[':type'] = $filters['type'];
    }
    if($filters['from'] != ""){
        $where .= " AND m.created_at >= :from_date";
        $params[':from_date'] = $filters['from'] . " 00:00:00";
    }
    if($filters['to'] != ""){
        $where .= " AND m.created_at <= :to_date";
        $params[':to_date'] = $filters['to'] . " 23:59:59";
    }
    return $where;
}

function listMovements($conn, $filters, $limit, $offset){
    $params = [];
    $sql = "SELECT m.id, m.type, m.qty, m.unit_cost, m.reference, m.created_at,
                   i.id AS ingredient_id, i.name AS ingredient_name, i.base_unit,
                   u.full_name AS user_name
            FROM stock_movements m
            JOIN ingredients i ON i.id = m.ingredient_id
            LEFT JOIN users u ON u.id = m.user_id" . movementFilter($filters, $params) . "
            ORDER BY m.created_at DESC, m.id DESC
            LIMIT :limit OFFSET :offset";
    $stmt = $conn->prepare($sql);
    foreach($params as $key => $value){
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll();
}

function countMovements($conn, $filters){
    $params = [];
    $sql = "SELECT COUNT(*) AS total
            FROM stock_movements m
            JOIN ingredients i ON i.id = m.ingredient_id" . movementFilter($filters, $params);
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $row = $stmt->fetch();
    return (int)$row['total'];
}
?>