<?php
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
