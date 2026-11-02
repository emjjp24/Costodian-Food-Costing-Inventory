<?php
// the ingredients of a recipe with their current price and stock
function listRecipeIngredients($conn, $recipe_id){
    $sql = "SELECT ri.id, ri.ingredient_id, ri.qty_needed,
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

function insertRecipeIngredient($conn, $recipe_id, $ingredient_id, $qty_needed){
    $sql = "INSERT INTO recipe_ingredients (recipe_id, ingredient_id, qty_needed) VALUES (:recipe_id, :ingredient_id, :qty_needed)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':recipe_id', $recipe_id);
    $stmt->bindParam(':ingredient_id', $ingredient_id);
    $stmt->bindParam(':qty_needed', $qty_needed);
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
