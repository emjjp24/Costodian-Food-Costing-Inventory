<?php
// the ingredients of a recipe with their current price and stock
function listRecipeIngredients($conn, $recipe_id){
    $sql = "SELECT ri.id, ri.ingredient_id, ri.qty_needed, ri.bought_qty, ri.bought_price,
                   i.name, i.base_unit, i.unit_cost, i.stock_qty
            FROM recipe_ingredients ri
            JOIN ingredients i ON i.id = ri.ingredient_id
            WHERE ri.recipe_id = :recipe_id
            ORDER BY ri.id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':recipe_id', $recipe_id);
    $stmt->execute();
    return $stmt->fetchAll();
}

// bought_qty and bought_price are what was bought for this line (both null when nothing was entered)
function insertRecipeIngredient($conn, $recipe_id, $ingredient_id, $qty_needed, $bought_qty = null, $bought_price = null){
    $sql = "INSERT INTO recipe_ingredients (recipe_id, ingredient_id, qty_needed, bought_qty, bought_price)
            VALUES (:recipe_id, :ingredient_id, :qty_needed, :bought_qty, :bought_price)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':recipe_id', $recipe_id);
    $stmt->bindParam(':ingredient_id', $ingredient_id);
    $stmt->bindParam(':qty_needed', $qty_needed);
    $stmt->bindParam(':bought_qty', $bought_qty);
    $stmt->bindParam(':bought_price', $bought_price);
    $stmt->execute();
}

// remember what was bought for a line that is already in the recipe
function updateRecipeIngredientPurchase($conn, $recipe_id, $ingredient_id, $bought_qty, $bought_price){
    $sql = "UPDATE recipe_ingredients SET bought_qty = :bought_qty, bought_price = :bought_price WHERE recipe_id = :recipe_id AND ingredient_id = :ingredient_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':bought_qty', $bought_qty);
    $stmt->bindParam(':bought_price', $bought_price);
    $stmt->bindParam(':recipe_id', $recipe_id);
    $stmt->bindParam(':ingredient_id', $ingredient_id);
    $stmt->execute();
}

function updateRecipeIngredientQty($conn, $recipe_id, $ingredient_id, $qty_needed){
    $sql = "UPDATE recipe_ingredients SET qty_needed = :qty_needed WHERE recipe_id = :recipe_id AND ingredient_id = :ingredient_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':qty_needed', $qty_needed);
    $stmt->bindParam(':recipe_id', $recipe_id);
    $stmt->bindParam(':ingredient_id', $ingredient_id);
    $stmt->execute();
}

function deleteRecipeIngredient($conn, $recipe_id, $ingredient_id){
    $sql = "DELETE FROM recipe_ingredients WHERE recipe_id = :recipe_id AND ingredient_id = :ingredient_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':recipe_id', $recipe_id);
    $stmt->bindParam(':ingredient_id', $ingredient_id);
    $stmt->execute();
}
?>