<?php
// the date the system starts warning about expiry
function soonDate(){
    return date('Y-m-d', strtotime('+' . EXPIRY_WARNING_DAYS . ' days'));
}

// one inventory row ready to send to the frontend
function formatIngredient($row){
    $today = date('Y-m-d');
    $soon = soonDate();

    $stock = (float)$row['stock_qty'];
    $reorder = (float)$row['reorder_level'];
    $unit_cost = (float)$row['unit_cost'];
    $base = $row['base_unit'];
    $expiry = $row['expiry_date'];

    $out = $stock <= 0;
    $low = !$out && $reorder > 0 && $stock <= $reorder;
    $expired = $expiry !== null && $expiry < $today;
    $expiring = $expiry !== null && $expiry >= $today && $expiry <= $soon;

    // price shown per kg, per L or per piece
    $shown_unit = $base == 'g' ? 'kg' : ($base == 'ml' ? 'L' : 'pc');
    $shown_cost = ($base == 'pcs') ? $unit_cost : $unit_cost * 1000;

    $days_left = null;
    if($expiry !== null){
        $days_left = (int)round((strtotime($expiry) - strtotime($today)) / 86400);
    }

    return [
        'id' => (int)$row['id'],
        'name' => $row['name'],
        'category_id' => $row['category_id'] !== null ? (int)$row['category_id'] : null,
        'category_name' => isset($row['category_name']) ? $row['category_name'] : null,
        'base_unit' => $base,
        'stock_qty' => $stock,
        'stock_text' => formatQuantity($stock, $base),
        'unit_cost' => $unit_cost,
        'cost_per' => round($shown_cost, 2),
        'cost_per_unit' => $shown_unit,
        'stock_value' => round($stock * $unit_cost, 2),
        'reorder_level' => $reorder,
        'reorder_text' => formatQuantity($reorder, $base),
        'expiry_date' => $expiry,
        'days_to_expiry' => $days_left,
        'status' => [
            'out' => $out,
            'low' => $low,
            'expired' => $expired,
            'expiring' => $expiring
        ],
        'updated_at' => isset($row['updated_at']) ? $row['updated_at'] : null
    ];
}

// one history line ready to send to the frontend
function formatMovement($row){
    return [
        'id' => (int)$row['id'],
        'type' => $row['type'],
        'ingredient_id' => (int)$row['ingredient_id'],
        'ingredient_name' => $row['ingredient_name'],
        'qty' => (float)$row['qty'],
        'qty_text' => formatQuantity($row['qty'], $row['base_unit']),
        'unit_cost' => $row['unit_cost'] !== null ? (float)$row['unit_cost'] : null,
        'reference' => $row['reference'],
        'user_name' => $row['user_name'],
        'created_at' => $row['created_at']
    ];
}

// add stock to a locked ingredient row, the unit cost becomes the weighted average
// call it inside a transaction
function addStockToIngredient($conn, $ingredient, $qty_base, $price_paid, $expiry_date, $reference, $user_id){

    $old_qty = (float)$ingredient['stock_qty'];
    $old_cost = (float)$ingredient['unit_cost'];
    $added_cost = $price_paid / $qty_base;

    $new_qty = round($old_qty + $qty_base, 3);
    if($new_qty > MAX_BASE_QUANTITY){
        throw new Exception('The stock of ' . $ingredient['name'] . ' would be too large.');
    }
    $new_cost = round(weightedAverageCost($old_qty, $old_cost, $qty_base, $added_cost), 5);

    updateIngredientStock($conn, $ingredient['id'], decimalString($new_qty, 3), decimalString($new_cost, 5));
    if($expiry_date !== null){
        updateIngredientExpiry($conn, $ingredient['id'], $expiry_date);
    }
    insertMovement($conn, $ingredient['id'], 'stock_in', decimalString($qty_base, 3), decimalString($added_cost, 5), $reference, $user_id);

    return ['stock_qty' => $new_qty, 'unit_cost' => $new_cost];
}
?>
