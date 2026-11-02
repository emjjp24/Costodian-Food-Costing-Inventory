<?php
function findRecipeById($conn, $id){
    $sql = "SELECT r.*, c.name AS category_name
            FROM recipes r
            LEFT JOIN categories c ON c.id = r.category_id
            WHERE r.id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    return $stmt->fetch();
}

function listRecipes($conn, $search, $category_id){
    $sql = "SELECT r.*, c.name AS category_name
            FROM recipes r
            LEFT JOIN categories c ON c.id = r.category_id
            WHERE 1 = 1";
    $params = [];

    if($search != ""){
        $sql .= " AND r.name LIKE :search ESCAPE '!'";
        $params[':search'] = '%' . escapeLike($search) . '%';
    }
    if($category_id !== null){
        $sql .= " AND r.category_id = :category_id";
        $params[':category_id'] = $category_id;
    }

    $sql .= " ORDER BY r.name";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

// ingredient cost of every recipe at today's prices: recipe_id => cost
function recipeIngredientCosts($conn){
    $sql = "SELECT ri.recipe_id, SUM(ri.qty_needed * i.unit_cost) AS ingredient_cost
            FROM recipe_ingredients ri
            JOIN ingredients i ON i.id = ri.ingredient_id
            GROUP BY ri.recipe_id";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $costs = [];
    foreach($stmt->fetchAll() as $row){
        $costs[(int)$row['recipe_id']] = (float)$row['ingredient_cost'];
    }
    return $costs;
}

function insertRecipe($conn, $name, $category_id, $servings, $other_costs, $target_pct, $notes, $user_id){
    $sql = "INSERT INTO recipes (name, category_id, servings, other_costs, target_food_cost_pct, notes, created_by)
            VALUES (:name, :category_id, :servings, :other_costs, :target_pct, :notes, :created_by)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':category_id', $category_id);
    $stmt->bindParam(':servings', $servings);
    $stmt->bindParam(':other_costs', $other_costs);
    $stmt->bindParam(':target_pct', $target_pct);
    $stmt->bindParam(':notes', $notes);
    $stmt->bindParam(':created_by', $user_id);
    $stmt->execute();
    return (int)$conn->lastInsertId();
}

function updateRecipe($conn, $id, $name, $category_id, $servings, $other_costs, $target_pct, $notes){
    $sql = "UPDATE recipes SET name = :name, category_id = :category_id, servings = :servings,
                   other_costs = :other_costs, target_food_cost_pct = :target_pct, notes = :notes
            WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':category_id', $category_id);
    $stmt->bindParam(':servings', $servings);
    $stmt->bindParam(':other_costs', $other_costs);
    $stmt->bindParam(':target_pct', $target_pct);
    $stmt->bindParam(':notes', $notes);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
}

function deleteRecipe($conn, $id){
    $sql = "DELETE FROM recipes WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
}
?>
