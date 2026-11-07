<?php
function stockUse($conn, $user){

    if(isset($_POST['ingredient_id'])){
        list($error, $data) = validateUseStock($_POST);
        if($error){
            respond(false, $error, null, 400);
        }
        $reference = $data['note'] != "" ? "Used: " . $data['note'] : "Used";
        $result = removeStock($conn, $data['ingredient_id'], $data['qty'], $data['unit'], 'stock_out', $reference, $user);
        respond(true, 'Used ' . $result['removed'] . ' of ' . $result['ingredient'] . '. ' . $result['remaining'] . ' left.', $result);
    }
    respond(false, 'Please choose an ingredient.', null, 400);
}

function stockWaste($conn, $user){

    if(isset($_POST['ingredient_id'])){
        list($error, $data) = validateWaste($_POST);
        if($error){
            respond(false, $error, null, 400);
        }
        $reference = $data['reason'] != "" ? "Waste: " . $data['reason'] : "Waste";
        $result = removeStock($conn, $data['ingredient_id'], $data['qty'], $data['unit'], 'waste', $reference, $user);
        respond(true, 'Recorded ' . $result['removed'] . ' of ' . $result['ingredient'] . ' as waste. ' . $result['remaining'] . ' left.', $result);
    }
    respond(false, 'Please choose an ingredient.', null, 400);
}

function stockRestock($conn, $user){

    if(isset($_POST['ingredient_id'])){
        list($error, $data) = validateRestock($_POST);
        if($error){
            respond(false, $error, null, 400);
        }
        $result = restockIngredient($conn, $data, $user);
        respond(true, 'Added ' . $result['added'] . ' of ' . $result['ingredient'] . '. Now ' . $result['stock_text'] . ' in stock.', $result);
    }
    respond(false, 'Please choose an ingredient.', null, 400);
}

function stockCook($conn, $user){

    if(isset($_POST['recipe_id'])){
        list($error, $data) = validateCook($_POST);
        if($error){
            respond(false, $error, null, 400);
        }
        $result = cookRecipe($conn, $data['recipe_id'], $data['batches'], $user);
        respond(true, 'Cooked ' . $result['recipe'] . '. The ingredients were taken out of the inventory.', $result);
    }
    respond(false, 'Please choose a recipe.', null, 400);
}

function stockMovements($conn, $user){

    list($error, $filters) = validateMovementFilters($_GET);
    if($error){
        respond(false, $error, null, 400);
    }

    $filters['account_id'] = (int)$user['account_id'];
    $total = countMovements($conn, $filters);
    $offset = ($filters['page'] - 1) * $filters['per_page'];

    $items = [];
    foreach(listMovements($conn, $filters, $filters['per_page'], $offset) as $row){
        $items[] = formatMovement($row);
    }

    respond(true, 'OK', [
        'items' => $items,
        'page' => $filters['page'],
        'per_page' => $filters['per_page'],
        'total' => $total,
        'pages' => (int)ceil($total / $filters['per_page'])
    ]);
}
?>