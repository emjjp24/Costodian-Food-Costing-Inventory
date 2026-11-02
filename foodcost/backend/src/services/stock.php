<?php
// take stock out of one ingredient (type: stock_out for use, waste for spoiled or dropped food)
// the stock can never go below zero
function removeStock($conn, $ingredient_id, $qty, $unit, $type, $reference, $user_id){

    $conn->beginTransaction();
    try{
        $ingredient = lockIngredient($conn, $ingredient_id);
        if(!$ingredient){
            throw new Exception('Ingredient not found.');
        }

        $qty_base = convertToBase($qty, $unit, $ingredient['base_unit']);
        if($qty_base === null){
            throw new Exception($ingredient['name'] . ' is kept in ' . unitsFor($ingredient['base_unit']) . '. Please use the same kind of unit.');
        }
        $qty_base = round($qty_base, 3);
        if($qty_base <= 0){
            throw new Exception('That quantity is too small.');
        }

        $stock = (float)$ingredient['stock_qty'];
        $left = round($stock - $qty_base, 3);
        if($left < 0){
            throw new Exception('Not enough ' . $ingredient['name'] . ' in stock. You have ' . formatQuantity($stock, $ingredient['base_unit']) . ' and tried to take out ' . formatQuantity($qty_base, $ingredient['base_unit']) . '.');
        }

        updateIngredientStock($conn, $ingredient['id'], decimalString($left, 3), $ingredient['unit_cost']);
        insertMovement($conn, $ingredient['id'], $type, decimalString($qty_base, 3), $ingredient['unit_cost'], $reference, $user_id);
        $conn->commit();
    } catch(Throwable $e){
        if($conn->inTransaction()){
            $conn->rollBack();
        }
        throw $e;
    }

    return [
        'ingredient' => $ingredient['name'],
        'removed' => formatQuantity($qty_base, $ingredient['base_unit']),
        'remaining' => formatQuantity($left, $ingredient['base_unit']),
        'remaining_qty' => $left,
        'cost' => round($qty_base * (float)$ingredient['unit_cost'], 2)
    ];
}

// add stock to an existing ingredient (restock)
function restockIngredient($conn, $data, $user_id){

    $conn->beginTransaction();
    try{
        $ingredient = lockIngredient($conn, $data['ingredient_id']);
        if(!$ingredient){
            throw new Exception('Ingredient not found.');
        }

        $qty_base = convertToBase($data['qty'], $data['unit'], $ingredient['base_unit']);
        if($qty_base === null){
            throw new Exception($ingredient['name'] . ' is kept in ' . unitsFor($ingredient['base_unit']) . '. Please use the same kind of unit.');
        }
        $qty_base = round($qty_base, 3);
        if($qty_base <= 0){
            throw new Exception('That quantity is too small.');
        }

        $reference = "Restock";
        if($data['note'] != ""){
            $reference = "Restock: " . $data['note'];
        }
        $result = addStockToIngredient($conn, $ingredient, $qty_base, $data['price_paid'], $data['expiry_date'], $reference, $user_id);
        $conn->commit();
    } catch(Throwable $e){
        if($conn->inTransaction()){
            $conn->rollBack();
        }
        throw $e;
    }

    return [
        'ingredient' => $ingredient['name'],
        'added' => formatQuantity($qty_base, $ingredient['base_unit']),
        'stock_qty' => $result['stock_qty'],
        'stock_text' => formatQuantity($result['stock_qty'], $ingredient['base_unit']),
        'unit_cost' => $result['unit_cost']
    ];
}

// cook a recipe: every ingredient is taken out of the stock together
// if even one ingredient is short, nothing is taken out
function cookRecipe($conn, $recipe_id, $batches, $user_id){

    $conn->beginTransaction();
    try{
        $recipe = findRecipeById($conn, $recipe_id);
        if(!$recipe){
            throw new Exception('Recipe not found.');
        }
        $lines = listRecipeIngredients($conn, $recipe_id);
        if(count($lines) == 0){
            throw new Exception('This recipe has no ingredients.');
        }

        // lock in the same order every time so two cooks cannot block each other
        usort($lines, function($a, $b){
            return (int)$a['ingredient_id'] - (int)$b['ingredient_id'];
        });

        $plan = [];
        $short = [];
        foreach($lines as $line){
            $ingredient = lockIngredient($conn, $line['ingredient_id']);
            $need = round((float)$line['qty_needed'] * $batches, 3);
            $stock = (float)$ingredient['stock_qty'];
            if(round($stock - $need, 3) < 0){
                $short[] = $ingredient['name'] . ' (needs ' . formatQuantity($need, $ingredient['base_unit']) . ', has ' . formatQuantity($stock, $ingredient['base_unit']) . ')';
            }
            $plan[] = ['ingredient' => $ingredient, 'need' => $need];
        }

        if(count($short) > 0){
            throw new Exception('Not enough stock to cook ' . $recipe['name'] . '. Short: ' . implode('; ', $short) . '.');
        }

        $batch_text = rtrim(rtrim(number_format($batches, 3, '.', ''), '0'), '.');
        $reference = "Cooked: " . $recipe['name'] . " x" . $batch_text;
        $used = [];
        $total_cost = 0;

        foreach($plan as $step){
            $ingredient = $step['ingredient'];
            $left = round((float)$ingredient['stock_qty'] - $step['need'], 3);
            updateIngredientStock($conn, $ingredient['id'], decimalString($left, 3), $ingredient['unit_cost']);
            insertMovement($conn, $ingredient['id'], 'stock_out', decimalString($step['need'], 3), $ingredient['unit_cost'], $reference, $user_id);
            $cost = $step['need'] * (float)$ingredient['unit_cost'];
            $total_cost += $cost;
            $used[] = [
                'ingredient' => $ingredient['name'],
                'used' => formatQuantity($step['need'], $ingredient['base_unit']),
                'remaining' => formatQuantity($left, $ingredient['base_unit']),
                'remaining_qty' => $left
            ];
        }

        $conn->commit();
    } catch(Throwable $e){
        if($conn->inTransaction()){
            $conn->rollBack();
        }
        throw $e;
    }

    return [
        'recipe' => $recipe['name'],
        'batches' => (float)$batches,
        'ingredient_cost' => round($total_cost, 2),
        'used' => $used
    ];
}
?>
