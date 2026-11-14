<?php
// find a recipe, only inside the given account
function findRecipeById($conn, $id, $account_id){
    $sql = "SELECT r.*, c.name AS category_name
            FROM recipes r
            LEFT JOIN categories c ON c.id = r.category_id
            WHERE r.id = :id AND r.account_id = :account_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->execute();
    return $stmt->fetch();
}

function listRecipes($conn, $account_id, $search, $category_id){
    $sql = "SELECT r.*, c.name AS category_name
            FROM recipes r
            LEFT JOIN categories c ON c.id = r.category_id
            WHERE r.account_id = :account_id";
    $params = [':account_id' => $account_id];

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

function countRecipes($conn, $account_id){
    $sql = "SELECT COUNT(*) AS total FROM recipes WHERE account_id = :account_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->execute();
    $row = $stmt->fetch();
    return (int)$row['total'];
}

// ingredient cost of every recipe of the account at today's prices: recipe_id => cost
function recipeIngredientCosts($conn, $account_id){
    $sql = "SELECT ri.recipe_id, SUM(ri.qty_needed * i.unit_cost) AS ingredient_cost
            FROM recipe_ingredients ri
            JOIN recipes r ON r.id = ri.recipe_id
            JOIN ingredients i ON i.id = ri.ingredient_id
            WHERE r.account_id = :account_id
            GROUP BY ri.recipe_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->execute();
    $costs = [];
    foreach($stmt->fetchAll() as $row){
        $costs[(int)$row['recipe_id']] = (float)$row['ingredient_cost'];
    }
    return $costs;
}

function insertRecipe($conn, $account_id, $name, $category_id, $servings, $other_costs, $target_pct, $markup_pct, $notes, $user_id){
    $sql = "INSERT INTO recipes (account_id, name, category_id, servings, other_costs, target_food_cost_pct, markup_pct, notes, created_by)
            VALUES (:account_id, :name, :category_id, :servings, :other_costs, :target_pct, :markup_pct, :notes, :created_by)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':category_id', $category_id);
    $stmt->bindParam(':servings', $servings);
    $stmt->bindParam(':other_costs', $other_costs);
    $stmt->bindParam(':target_pct', $target_pct);
    $stmt->bindParam(':markup_pct', $markup_pct);
    $stmt->bindParam(':notes', $notes);
    $stmt->bindParam(':created_by', $user_id);
    $stmt->execute();
    return (int)$conn->lastInsertId();
}

function updateRecipe($conn, $id, $account_id, $name, $category_id, $servings, $other_costs, $target_pct, $markup_pct, $notes){
    $sql = "UPDATE recipes SET name = :name, category_id = :category_id, servings = :servings,
                   other_costs = :other_costs, target_food_cost_pct = :target_pct, markup_pct = :markup_pct, notes = :notes
            WHERE id = :id AND account_id = :account_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':category_id', $category_id);
    $stmt->bindParam(':servings', $servings);
    $stmt->bindParam(':other_costs', $other_costs);
    $stmt->bindParam(':target_pct', $target_pct);
    $stmt->bindParam(':markup_pct', $markup_pct);
    $stmt->bindParam(':notes', $notes);
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->execute();
}

function deleteRecipe($conn, $id, $account_id){
    $sql = "DELETE FROM recipes WHERE id = :id AND account_id = :account_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':account_id', $account_id);
    $stmt->execute();
}
?>