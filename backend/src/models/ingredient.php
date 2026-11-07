<?php
// find an ingredient with its category name, only inside the given account
function findIngredientById($conn, $id, $account_id){
    $sql = "SELECT i.*, c.name AS category_name
            FROM ingredients i
            LEFT JOIN categories c ON c.id = i.category_id
            WHERE i.id = :id AND i.account_id = :account_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->execute();
    return $stmt->fetch();
}

// find and lock an ingredient row, used inside a transaction before changing the stock
function lockIngredient($conn, $id, $account_id){
    $sql = "SELECT * FROM ingredients WHERE id = :id AND account_id = :account_id FOR UPDATE";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->execute();
    return $stmt->fetch();
}

// same as above but by name (the name is not case sensitive)
function lockIngredientByName($conn, $name, $account_id){
    $sql = "SELECT * FROM ingredients WHERE name = :name AND account_id = :account_id FOR UPDATE";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->execute();
    return $stmt->fetch();
}

// the inventory list of one account, every filter is optional
// status: low, out, expired, expiring or alert (any of them)
function listIngredients($conn, $account_id, $search, $category_id, $status, $today, $soon){
    $sql = "SELECT i.*, c.name AS category_name
            FROM ingredients i
            LEFT JOIN categories c ON c.id = i.category_id
            WHERE i.account_id = :account_id";
    $params = [':account_id' => $account_id];

    if($search != ""){
        $sql .= " AND i.name LIKE :search ESCAPE '!'";
        $params[':search'] = '%' . escapeLike($search) . '%';
    }
    if($category_id !== null){
        $sql .= " AND i.category_id = :category_id";
        $params[':category_id'] = $category_id;
    }

    $out = "i.stock_qty <= 0";
    $low = "(i.stock_qty > 0 AND i.reorder_level > 0 AND i.stock_qty <= i.reorder_level)";

    // each placeholder is used once, so it also works when emulated prepares are off
    $expired = "(i.expiry_date IS NOT NULL AND i.expiry_date < :today_a)";
    $expiring = "(i.expiry_date IS NOT NULL AND i.expiry_date >= :today_b AND i.expiry_date <= :soon_b)";

    if($status == 'out'){
        $sql .= " AND " . $out;
    } else if($status == 'low'){
        $sql .= " AND " . $low;
    } else if($status == 'expired'){
        $sql .= " AND " . $expired;
        $params[':today_a'] = $today;
    } else if($status == 'expiring'){
        $sql .= " AND " . $expiring;
        $params[':today_b'] = $today;
        $params[':soon_b'] = $soon;
    } else if($status == 'alert'){
        $sql .= " AND (" . $out . " OR " . $low . " OR " . $expired . " OR " . $expiring . ")";
        $params[':today_a'] = $today;
        $params[':today_b'] = $today;
        $params[':soon_b'] = $soon;
    }

    $sql .= " ORDER BY i.name";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

// numbers for the dashboard
function inventoryCounts($conn, $account_id, $today, $soon){
    $sql = "SELECT COUNT(*) AS total,
                   COALESCE(SUM(stock_qty * unit_cost), 0) AS stock_value,
                   COALESCE(SUM(CASE WHEN stock_qty <= 0 THEN 1 ELSE 0 END), 0) AS out_count,
                   COALESCE(SUM(CASE WHEN stock_qty > 0 AND reorder_level > 0 AND stock_qty <= reorder_level THEN 1 ELSE 0 END), 0) AS low_count,
                   COALESCE(SUM(CASE WHEN expiry_date IS NOT NULL AND expiry_date < :today THEN 1 ELSE 0 END), 0) AS expired_count,
                   COALESCE(SUM(CASE WHEN expiry_date IS NOT NULL AND expiry_date >= :today2 AND expiry_date <= :soon THEN 1 ELSE 0 END), 0) AS expiring_count
            FROM ingredients
            WHERE account_id = :account_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':today', $today);
    $stmt->bindParam(':today2', $today);
    $stmt->bindParam(':soon', $soon);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->execute();
    return $stmt->fetch();
}

function insertIngredient($conn, $account_id, $name, $category_id, $base_unit, $reorder_level, $expiry_date){
    $sql = "INSERT INTO ingredients (account_id, name, category_id, base_unit, stock_qty, unit_cost, reorder_level, expiry_date)
            VALUES (:account_id, :name, :category_id, :base_unit, 0, 0, :reorder_level, :expiry_date)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':category_id', $category_id);
    $stmt->bindParam(':base_unit', $base_unit);
    $stmt->bindParam(':reorder_level', $reorder_level);
    $stmt->bindParam(':expiry_date', $expiry_date);
    $stmt->execute();
    return (int)$conn->lastInsertId();
}

// used only on a row that was locked before
function updateIngredientStock($conn, $id, $stock_qty, $unit_cost){
    $sql = "UPDATE ingredients SET stock_qty = :stock_qty, unit_cost = :unit_cost WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':stock_qty', $stock_qty);
    $stmt->bindParam(':unit_cost', $unit_cost);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
}

function updateIngredientExpiry($conn, $id, $expiry_date){
    $sql = "UPDATE ingredients SET expiry_date = :expiry_date WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':expiry_date', $expiry_date);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
}

function updateIngredientDetails($conn, $id, $account_id, $category_id, $reorder_level, $expiry_date){
    $sql = "UPDATE ingredients SET category_id = :category_id, reorder_level = :reorder_level, expiry_date = :expiry_date
            WHERE id = :id AND account_id = :account_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':category_id', $category_id);
    $stmt->bindParam(':reorder_level', $reorder_level);
    $stmt->bindParam(':expiry_date', $expiry_date);
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->execute();
}

function deleteIngredient($conn, $id, $account_id){
    $sql = "DELETE FROM ingredients WHERE id = :id AND account_id = :account_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->execute();
}

// how many recipes use the ingredient
function countRecipesUsing($conn, $ingredient_id){
    $sql = "SELECT COUNT(*) AS total FROM recipe_ingredients WHERE ingredient_id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $ingredient_id);
    $stmt->execute();
    $row = $stmt->fetch();
    return (int)$row['total'];
}
?>