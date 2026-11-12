<?php
// adding a new ingredient to the inventory together with what was bought
// (this is how an ingredient gets its cost, recipes only use the ingredients that are already here)
function validateNewIngredient($post){
    $name = isset($post['name']) ? cleanText($post['name']) : "";
    if($name == ""){
        return ['Please enter the ingredient name.', null];
    }
    if(mb_strlen($name) > 100){
        return ['The ingredient name must not be longer than 100 characters.', null];
    }

    $category_id = optionalId(isset($post['category_id']) ? $post['category_id'] : null);
    if($category_id === false){
        return ['The category is not valid.', null];
    }

    $unit = isset($post['unit']) ? normalizeUnit($post['unit']) : null;
    $qty = isset($post['qty']) ? parseQuantity($post['qty']) : null;
    if($qty === null){
        return ['The quantity is not valid. Use a number like 2, 0.5, 1/2 or 1 1/2.', null];
    }
    if($unit === null){
        return ['Please choose a unit (kg, g, L, ml, pcs or dozen).', null];
    }
    $base_unit = baseUnitOf($unit);
    $qty_base = round(toBaseQuantity($qty, $unit), 3);
    if($qty_base <= 0 || $qty_base > MAX_BASE_QUANTITY){
        return ['The quantity is too small or too large.', null];
    }

    $price = isset($post['price_paid']) ? parseAmount($post['price_paid']) : null;
    if($price === null || $price > 10000000){
        return ['The price paid is not valid.', null];
    }

    $expiry = null;
    if(isset($post['expiry_date']) && !isBlank($post['expiry_date'])){
        if(!validDate($post['expiry_date'])){
            return ['The expiry date must be written as YYYY-MM-DD.', null];
        }
        $expiry = $post['expiry_date'];
    }

    // the reorder level is optional, it uses the same unit unless reorder_unit is sent
    $reorder_base = 0;
    if(isset($post['reorder_level']) && !isBlank($post['reorder_level'])){
        $reorder_unit = $unit;
        if(isset($post['reorder_unit']) && !isBlank($post['reorder_unit'])){
            $reorder_unit = normalizeUnit($post['reorder_unit']);
            if($reorder_unit === null || baseUnitOf($reorder_unit) !== $base_unit){
                return ['Use ' . unitsFor($base_unit) . ' for the reorder level of this ingredient.', null];
            }
        }
        $reorder = parseQuantity($post['reorder_level'], true);
        if($reorder === null){
            return ['The reorder level is not valid. Use a number like 500, 0.5 or 1/2.', null];
        }
        $reorder_base = round(toBaseQuantity($reorder, $reorder_unit), 3);
        if($reorder_base > MAX_BASE_QUANTITY){
            return ['The reorder level is too large.', null];
        }
    }

    return [null, [
        'name' => $name,
        'category_id' => $category_id,
        'base_unit' => $base_unit,
        'qty_base' => $qty_base,
        'price_paid' => $price,
        'expiry_date' => $expiry,
        'reorder_base' => $reorder_base
    ]];
}

// editing the details of an inventory item
// only the fields that were sent are changed, the others keep their value
function validateIngredientDetails($post, $ingredient){
    $category_id = $ingredient['category_id'];
    $reorder_level = (float)$ingredient['reorder_level'];
    $expiry_date = $ingredient['expiry_date'];

    if(array_key_exists('category_id', $post)){
        $category_id = optionalId($post['category_id']);
        if($category_id === false){
            return ['The category is not valid.', null];
        }
    }

    if(array_key_exists('reorder_level', $post)){
        if(isBlank($post['reorder_level'])){
            $reorder_level = 0;
        } else {
            $unit = $ingredient['base_unit'];
            if(isset($post['reorder_unit']) && !isBlank($post['reorder_unit'])){
                $unit = normalizeUnit($post['reorder_unit']);
                if($unit === null || baseUnitOf($unit) !== $ingredient['base_unit']){
                    return ['Use ' . unitsFor($ingredient['base_unit']) . ' for the reorder level of this ingredient.', null];
                }
            }
            $qty = parseQuantity($post['reorder_level'], true);
            if($qty === null){
                return ['The reorder level is not valid. Use a number like 2, 0.5 or 1/2.', null];
            }
            $reorder_level = round(toBaseQuantity($qty, $unit), 3);
            if($reorder_level > MAX_BASE_QUANTITY){
                return ['The reorder level is too large.', null];
            }
        }
    }

    if(array_key_exists('expiry_date', $post)){
        if(isBlank($post['expiry_date'])){
            $expiry_date = null;
        } else if(validDate($post['expiry_date'])){
            $expiry_date = $post['expiry_date'];
        } else {
            return ['The expiry date must be written as YYYY-MM-DD.', null];
        }
    }

    return [null, ['category_id' => $category_id, 'reorder_level' => $reorder_level, 'expiry_date' => $expiry_date]];
}
?>