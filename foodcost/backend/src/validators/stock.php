<?php
// quantity + unit, used by use, restock and waste
function validateQuantityAndUnit($post){
    $ingredient_id = requestId(isset($post['ingredient_id']) ? $post['ingredient_id'] : 0);
    if($ingredient_id == 0){
        return ['Please choose an ingredient.', null];
    }

    $qty = isset($post['qty']) ? parseQuantity($post['qty']) : null;
    if($qty === null){
        return ['The quantity is not valid. Use a number like 2, 0.5, 1/2, 3/4 or 1 1/2.', null];
    }
    $unit = isset($post['unit']) ? normalizeUnit($post['unit']) : null;
    if($unit === null){
        return ['Please choose a unit (kg, g, L, ml, pcs or dozen).', null];
    }
    if(toBaseQuantity($qty, $unit) > MAX_BASE_QUANTITY){
        return ['The quantity is too large.', null];
    }

    return [null, ['ingredient_id' => $ingredient_id, 'qty' => $qty, 'unit' => $unit]];
}

function validateUseStock($post){
    list($error, $data) = validateQuantityAndUnit($post);
    if($error){
        return [$error, null];
    }
    $note = isset($post['note']) ? cleanText($post['note']) : "";
    if(mb_strlen($note) > 100){
        return ['The note must not be longer than 100 characters.', null];
    }
    $data['note'] = $note;
    return [null, $data];
}

function validateWaste($post){
    list($error, $data) = validateQuantityAndUnit($post);
    if($error){
        return [$error, null];
    }
    $reason = isset($post['reason']) ? cleanText($post['reason']) : "";
    if(mb_strlen($reason) > 100){
        return ['The reason must not be longer than 100 characters.', null];
    }
    $data['reason'] = $reason;
    return [null, $data];
}

function validateRestock($post){
    list($error, $data) = validateQuantityAndUnit($post);
    if($error){
        return [$error, null];
    }

    $price = isset($post['price_paid']) ? parseAmount($post['price_paid']) : null;
    if($price === null || $price > 10000000){
        return ['The price paid is not valid.', null];
    }
    $data['price_paid'] = $price;

    $data['expiry_date'] = null;
    if(isset($post['expiry_date']) && !isBlank($post['expiry_date'])){
        if(!validDate($post['expiry_date'])){
            return ['The expiry date must be written as YYYY-MM-DD.', null];
        }
        $data['expiry_date'] = $post['expiry_date'];
    }

    $note = isset($post['note']) ? cleanText($post['note']) : "";
    if(mb_strlen($note) > 100){
        return ['The note must not be longer than 100 characters.', null];
    }
    $data['note'] = $note;
    return [null, $data];
}

function validateCook($post){
    $recipe_id = requestId(isset($post['recipe_id']) ? $post['recipe_id'] : 0);
    if($recipe_id == 0){
        return ['Please choose a recipe.', null];
    }
    $batches = 1;
    if(isset($post['batches']) && !isBlank($post['batches'])){
        $batches = parseQuantity($post['batches']);
        if($batches === null || $batches > 1000){
            return ['The number of batches must be more than 0 and not more than 1000. You can use 1/2, 1 1/2 and so on.', null];
        }
    }
    return [null, ['recipe_id' => $recipe_id, 'batches' => $batches]];
}

// filters of the stock history, all optional
function validateMovementFilters($get){
    $ingredient_id = optionalId(isset($get['ingredient_id']) ? $get['ingredient_id'] : null);
    if($ingredient_id === false){
        return ['The ingredient is not valid.', null];
    }

    $type = isset($get['type']) ? cleanText($get['type']) : "";
    if($type != "" && !in_array($type, ['stock_in', 'stock_out', 'waste', 'adjustment'], true)){
        return ['The type must be stock_in, stock_out or waste.', null];
    }

    $from = isset($get['from']) ? cleanText($get['from']) : "";
    $to = isset($get['to']) ? cleanText($get['to']) : "";
    if(($from != "" && !validDate($from)) || ($to != "" && !validDate($to))){
        return ['Dates must be written as YYYY-MM-DD.', null];
    }

    $page = requestId(isset($get['page']) ? $get['page'] : 1);
    if($page == 0){
        $page = 1;
    }
    $per_page = requestId(isset($get['per_page']) ? $get['per_page'] : 20);
    if($per_page == 0){
        $per_page = 20;
    }
    if($per_page > 100){
        $per_page = 100;
    }

    return [null, ['ingredient_id' => $ingredient_id, 'type' => $type, 'from' => $from, 'to' => $to, 'page' => $page, 'per_page' => $per_page]];
}
?>
