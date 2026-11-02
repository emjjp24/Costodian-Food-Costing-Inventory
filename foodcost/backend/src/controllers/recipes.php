<?php
function recipesList($conn, $user){

    $search = isset($_GET['search']) ? cleanText($_GET['search']) : "";
    $category_id = optionalId(isset($_GET['category_id']) ? $_GET['category_id'] : null);
    if($category_id === false){
        respond(false, 'The category is not valid.', null, 400);
    }

    $costs = recipeIngredientCosts($conn);
    $items = [];
    foreach(listRecipes($conn, $search, $category_id) as $row){
        $ingredient_cost = isset($costs[(int)$row['id']]) ? $costs[(int)$row['id']] : 0;
        $items[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'category_id' => $row['category_id'] !== null ? (int)$row['category_id'] : null,
            'category_name' => $row['category_name'],
            'costing' => computeCosting($ingredient_cost, (float)$row['other_costs'], (int)$row['servings'], (float)$row['target_food_cost_pct'], null)
        ];
    }
    respond(true, 'OK', $items);
}

function recipesView($conn, $user){

    $id = requestId(isset($_GET['id']) ? $_GET['id'] : 0);
    $recipe = $id > 0 ? findRecipeById($conn, $id) : false;
    if(!$recipe){
        respond(false, 'Recipe not found.', null, 404);
    }

    $selling_price = null;
    if(isset($_GET['selling_price']) && !isBlank($_GET['selling_price'])){
        $selling_price = parseAmount($_GET['selling_price'], false);
        if($selling_price === null){
            respond(false, 'The selling price is not valid.', null, 400);
        }
    }

    respond(true, 'OK', recipeDetails($conn, $recipe, $selling_price));
}

function recipesCreate($conn, $user){

    if(isset($_POST['name'])){
        list($error, $data) = validateRecipe($_POST);
        if($error){
            respond(false, $error, null, 400);
        }
        $result = saveRecipe($conn, null, $data, $user['id']);
        respond(true, 'Recipe saved. Its ingredients are now in the inventory.', $result, 201);
    }
    respond(false, 'Please enter the recipe name.', null, 400);
}

function recipesUpdate($conn, $user){

    $id = requestId(isset($_POST['id']) ? $_POST['id'] : 0);
    if($id == 0 || !findRecipeById($conn, $id)){
        respond(false, 'Recipe not found.', null, 404);
    }

    list($error, $data) = validateRecipe($_POST);
    if($error){
        respond(false, $error, null, 400);
    }
    $result = saveRecipe($conn, $id, $data, $user['id']);
    respond(true, 'Recipe updated.', $result);
}

function recipesDelete($conn, $user){

    $id = requestId(isset($_POST['id']) ? $_POST['id'] : 0);
    if($id == 0 || !findRecipeById($conn, $id)){
        respond(false, 'Recipe not found.', null, 404);
    }

    deleteRecipe($conn, $id);
    respond(true, 'Recipe deleted. The inventory was not changed.');
}
?>
