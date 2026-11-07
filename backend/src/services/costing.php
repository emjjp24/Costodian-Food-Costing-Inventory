<?php
// new unit cost after adding stock: (old stock x old cost + new stock x new cost) / total stock
function weightedAverageCost($old_qty, $old_cost, $added_qty, $added_cost){
    $total = $old_qty + $added_qty;
    if($total <= 0){
        return $added_cost;
    }
    return (($old_qty * $old_cost) + ($added_qty * $added_cost)) / $total;
}

// the costing of a recipe
// selling_price is optional, when given the real food cost % and profit are added
function computeCosting($ingredient_cost, $other_costs, $servings, $target_pct, $selling_price){
    $total = $ingredient_cost + $other_costs;
    $per_serving = $total / $servings;
    $suggested = $per_serving / ($target_pct / 100);

    $costing = [
        'ingredient_cost' => round($ingredient_cost, 2),
        'other_costs' => round($other_costs, 2),
        'total_cost' => round($total, 2),
        'servings' => (int)$servings,
        'cost_per_serving' => round($per_serving, 2),
        'target_food_cost_pct' => round($target_pct, 2),
        'suggested_price' => round($suggested, 2),
        'profit_per_serving' => round($suggested - $per_serving, 2)
    ];

    if($selling_price !== null && $selling_price > 0){
        $costing['selling_price'] = round($selling_price, 2);
        $costing['food_cost_pct'] = round(($per_serving / $selling_price) * 100, 2);
        $costing['selling_profit_per_serving'] = round($selling_price - $per_serving, 2);
    }
    return $costing;
}

// the recipe with its ingredient lines, costing and how many batches the stock can make
function recipeDetails($conn, $recipe, $selling_price){
    $lines = listRecipeIngredients($conn, $recipe['id']);

    $items = [];
    $ingredient_cost = 0;
    $max_batches = null;

    foreach($lines as $line){
        $qty = (float)$line['qty_needed'];
        $stock = (float)$line['stock_qty'];
        $unit_cost = (float)$line['unit_cost'];
        $line_cost = $qty * $unit_cost;
        $ingredient_cost += $line_cost;

        $batches = (int)floor(round($stock / $qty, 6));
        if($max_batches === null || $batches < $max_batches){
            $max_batches = $batches;
        }

        $items[] = [
            'ingredient_id' => (int)$line['ingredient_id'],
            'name' => $line['name'],
            'base_unit' => $line['base_unit'],
            'qty_needed' => $qty,
            'qty_text' => formatQuantity($qty, $line['base_unit']),
            'unit_cost' => $unit_cost,
            'line_cost' => round($line_cost, 2),
            'stock_qty' => $stock,
            'stock_text' => formatQuantity($stock, $line['base_unit']),
            'enough' => round($stock - $qty, 3) >= 0
        ];
    }

    return [
        'id' => (int)$recipe['id'],
        'name' => $recipe['name'],
        'category_id' => $recipe['category_id'] !== null ? (int)$recipe['category_id'] : null,
        'category_name' => $recipe['category_name'],
        'notes' => $recipe['notes'],
        'created_at' => $recipe['created_at'],
        'ingredients' => $items,
        'can_cook_batches' => $max_batches === null ? 0 : $max_batches,
        'costing' => computeCosting($ingredient_cost, (float)$recipe['other_costs'], (int)$recipe['servings'], (float)$recipe['target_food_cost_pct'], $selling_price)
    ];
}

// save a recipe (create when $recipe_id is null) and load its ingredients into the inventory
// an ingredient that is not in the inventory yet is created with the purchase that was entered
// a purchase is counted only the first time an ingredient is added to the recipe
function saveRecipe($conn, $recipe_id, $data, $user){

    $account_id = (int)$user['account_id'];
    $user_id = (int)$user['id'];
    $notes = [];
    $conn->beginTransaction();
    try{
        if($data['category_id'] !== null){
            $category = findCategory($conn, $data['category_id'], $account_id);
            if(!$category || $category['type'] != 'recipe'){
                throw new Exception('The recipe category does not exist.');
            }
        }

        $servings = $data['servings'];
        $other = decimalString($data['other_costs'], 2);
        $target = decimalString($data['target_pct'], 2);

        $linked = [];
        if($recipe_id === null){
            $recipe_id = insertRecipe($conn, $account_id, $data['name'], $data['category_id'], $servings, $other, $target, $data['notes'], $user_id);
        } else {
            if(!findRecipeById($conn, $recipe_id, $account_id)){
                throw new Exception('Recipe not found.');
            }
            updateRecipe($conn, $recipe_id, $account_id, $data['name'], $data['category_id'], $servings, $other, $target, $data['notes']);
            foreach(listRecipeIngredients($conn, $recipe_id) as $old){
                $linked[(int)$old['ingredient_id']] = true;
            }
        }

        $reference = "Costing: " . $data['name'];
        $kept = [];

        foreach($data['lines'] as $line){
            $ingredient = lockIngredientByName($conn, $line['name'], $account_id);
            $qty_needed = decimalString($line['qty_needed'], 3);

            if($ingredient){
                if($ingredient['base_unit'] !== $line['base_unit']){
                    throw new Exception($ingredient['name'] . ' is kept in ' . unitsFor($ingredient['base_unit']) . '. Please use the same kind of unit.');
                }
                $id = (int)$ingredient['id'];

                if(isset($linked[$id])){
                    // already in this recipe, only the amount can change
                    updateRecipeIngredientQty($conn, $recipe_id, $id, $qty_needed);
                    if($line['purchase'] !== null){
                        $notes[] = $ingredient['name'] . ' is already in this recipe, so the purchase was not added again. Use Restock to add more stock.';
                    }
                } else {
                    if($line['purchase'] !== null){
                        addStockToIngredient($conn, $ingredient, $line['purchase']['qty_base'], $line['purchase']['price_paid'], $line['purchase']['expiry_date'], $reference, $user_id);
                    }
                    insertRecipeIngredient($conn, $recipe_id, $id, $qty_needed);
                }
            } else {
                // a new ingredient needs a purchase so that its cost is known
                if($line['purchase'] === null){
                    throw new Exception($line['name'] . ' is not in the inventory yet. Enter the quantity bought and the price paid so it can be costed.');
                }
                if($line['category_id'] !== null){
                    $category = findCategory($conn, $line['category_id'], $account_id);
                    if(!$category || $category['type'] != 'ingredient'){
                        throw new Exception($line['name'] . ': the ingredient category does not exist.');
                    }
                }
                $id = insertIngredient($conn, $account_id, $line['name'], $line['category_id'], $line['base_unit'], '0', null);
                $ingredient = lockIngredient($conn, $id, $account_id);
                addStockToIngredient($conn, $ingredient, $line['purchase']['qty_base'], $line['purchase']['price_paid'], $line['purchase']['expiry_date'], $reference, $user_id);
                insertRecipeIngredient($conn, $recipe_id, $id, $qty_needed);
            }
            $kept[$id] = true;
        }

        // ingredients that were taken out of the recipe (the inventory is not changed)
        foreach($linked as $id => $yes){
            if(!isset($kept[$id])){
                deleteRecipeIngredient($conn, $recipe_id, $id);
            }
        }

        $conn->commit();
    } catch(Throwable $e){
        if($conn->inTransaction()){
            $conn->rollBack();
        }
        throw $e;
    }

    return ['id' => $recipe_id, 'notes' => $notes];
}
?>