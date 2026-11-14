<?php
// one ingredient line of a recipe
function validateRecipeLine($line, $number){
    $label = "Ingredient " . $number;

    if(!is_array($line)){
        return [$label . " is not valid.", null];
    }

    $name = isset($line['name']) ? cleanText($line['name']) : "";
    if($name == ""){
        return [$label . " needs a name.", null];
    }
    if(mb_strlen($name) > 100){
        return [$label . ": the name must not be longer than 100 characters.", null];
    }
    $label = $name;

    // how much the recipe needs
    $needed_unit = isset($line['needed_unit']) ? normalizeUnit($line['needed_unit']) : null;
    $qty_needed = isset($line['qty_needed']) ? parseQuantity($line['qty_needed']) : null;
    if($qty_needed === null){
        return [$label . ": the amount needed is not valid. Use a number like 2, 0.5, 1/2 or 1 1/2.", null];
    }
    if($needed_unit === null){
        return [$label . ": choose a unit for the amount needed (kg, g, L, ml, pcs or dozen).", null];
    }
    $base_unit = baseUnitOf($needed_unit);
    $needed_base = round(toBaseQuantity($qty_needed, $needed_unit), 3);
    if($needed_base <= 0 || $needed_base > MAX_BASE_QUANTITY){
        return [$label . ": the amount needed is too small or too large.", null];
    }

    $category_id = optionalId(isset($line['category_id']) ? $line['category_id'] : null);
    if($category_id === false){
        return [$label . ": the category is not valid.", null];
    }

    // what was bought (optional for an ingredient that is already in the inventory)
    $purchase = null;
    $has_qty = isset($line['qty_bought']) && !isBlank($line['qty_bought']);
    $has_price = isset($line['price_paid']) && !isBlank($line['price_paid']);
    if($has_qty || $has_price){
        if(!$has_qty || !$has_price){
            return [$label . ": enter both the quantity bought and the price paid.", null];
        }
        $bought_unit = isset($line['bought_unit']) ? normalizeUnit($line['bought_unit']) : null;
        $qty_bought = parseQuantity($line['qty_bought']);
        $price_paid = parseAmount($line['price_paid']);
        if($qty_bought === null){
            return [$label . ": the quantity bought is not valid.", null];
        }
        if($bought_unit === null){
            return [$label . ": choose a unit for the quantity bought.", null];
        }
        if($price_paid === null || $price_paid > 10000000){
            return [$label . ": the price paid is not valid.", null];
        }
        if(baseUnitOf($bought_unit) !== $base_unit){
            return [$label . ": the unit bought (" . $bought_unit . ") does not match the unit needed (" . $needed_unit . ").", null];
        }
        $bought_base = round(toBaseQuantity($qty_bought, $bought_unit), 3);
        if($bought_base <= 0 || $bought_base > MAX_BASE_QUANTITY){
            return [$label . ": the quantity bought is too small or too large.", null];
        }
        $expiry = null;
        if(isset($line['expiry_date']) && !isBlank($line['expiry_date'])){
            if(!validDate($line['expiry_date'])){
                return [$label . ": the expiry date must be written as YYYY-MM-DD.", null];
            }
            $expiry = $line['expiry_date'];
        }
        $purchase = ['qty_base' => $bought_base, 'price_paid' => $price_paid, 'expiry_date' => $expiry];
    }

    return [null, [
        'name' => $name,
        'category_id' => $category_id,
        'base_unit' => $base_unit,
        'qty_needed' => $needed_base,
        'purchase' => $purchase
    ]];
}

// the whole recipe form
function validateRecipe($post){
    $name = isset($post['name']) ? cleanText($post['name']) : "";
    if($name == ""){
        return ['Please enter the recipe name.', null];
    }
    if(mb_strlen($name) > 100){
        return ['The recipe name must not be longer than 100 characters.', null];
    }

    $category_id = optionalId(isset($post['category_id']) ? $post['category_id'] : null);
    if($category_id === false){
        return ['The category is not valid.', null];
    }

    $servings = 1;
    if(isset($post['servings']) && !isBlank($post['servings'])){
        $servings = requestId($post['servings']);
        if($servings < 1 || $servings > 10000){
            return ['Servings must be a whole number from 1 to 10000.', null];
        }
    }

    $other_costs = 0;
    if(isset($post['other_costs']) && !isBlank($post['other_costs'])){
        $other_costs = parseAmount($post['other_costs']);
        if($other_costs === null || $other_costs > 10000000){
            return ['Other costs must be a valid amount.', null];
        }
    }

    $target = 35;
    if(isset($post['target_food_cost_pct']) && !isBlank($post['target_food_cost_pct'])){
        $target = parseAmount($post['target_food_cost_pct'], false);
        if($target === null || $target > 100){
            return ['The target food cost must be more than 0 and not more than 100 percent.', null];
        }
    }

    // the markup is optional: left empty it is not used. 25, 50, 75, 100 or the owner's own number such as 33
    $markup = null;
    if(isset($post['markup_pct']) && !isBlank($post['markup_pct'])){
        $markup = parseAmount($post['markup_pct'], false);
        if($markup === null || $markup > 1000){
            return ['The markup must be more than 0 and not more than 1000 percent. Leave it empty if you do not use one.', null];
        }
    }

    $notes = "";
    if(isset($post['notes']) && is_string($post['notes'])){
        $notes = trim($post['notes']);
        if(mb_strlen($notes) > 2000){
            return ['The notes must not be longer than 2000 characters.', null];
        }
    }

    if(!isset($post['ingredients']) || !is_array($post['ingredients']) || count($post['ingredients']) == 0){
        return ['Please add at least one ingredient.', null];
    }
    if(count($post['ingredients']) > 60){
        return ['A recipe can have up to 60 ingredients.', null];
    }

    $lines = [];
    $seen = [];
    $number = 0;
    foreach($post['ingredients'] as $line){
        $number++;
        list($error, $clean) = validateRecipeLine($line, $number);
        if($error){
            return [$error, null];
        }
        $key = mb_strtolower($clean['name']);
        if(isset($seen[$key])){
            return [$clean['name'] . " is listed twice. Combine them into one line.", null];
        }
        $seen[$key] = true;
        $lines[] = $clean;
    }

    return [null, [
        'name' => $name,
        'category_id' => $category_id,
        'servings' => $servings,
        'other_costs' => $other_costs,
        'target_pct' => $target,
        'markup_pct' => $markup,
        'notes' => $notes,
        'lines' => $lines
    ]];
}
?>