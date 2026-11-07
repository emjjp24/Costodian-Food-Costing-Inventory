// calls to the backend for recipes (costing), categories and the ingredient list
// needs client.js loaded first

// the list of recipes, with their costing (search and category_id are optional)
function getRecipes(search, categoryId){
    var query = {};
    if(search){
        query.search = search;
    }
    if(categoryId){
        query.category_id = categoryId;
    }
    return apiGet('recipes/list', query);
}

// one recipe with its ingredients and costing (sellingPrice is optional, to check your own price)
function getRecipe(id, sellingPrice){
    var query = {id: id};
    if(sellingPrice){
        query.selling_price = sellingPrice;
    }
    return apiGet('recipes/view', query);
}

function createRecipe(data){
    return apiPost('recipes/create', data);
}

function updateRecipe(id, data){
    data.id = id;
    return apiPost('recipes/update', data);
}

function deleteRecipe(id){
    return apiPost('recipes/delete', {id: id});
}

// cook a recipe: the ingredients are taken out of the inventory (batches can be 1/2, 2, 1 1/2 ...)
function cookRecipe(id, batches){
    return apiPost('stock/cook', {recipe_id: id, batches: batches});
}

// categories for the recipe form and the filter (gives both kinds, each has a type)
function getCategories(){
    return apiGet('categories/list');
}

// the ingredients that are already in the inventory
function getIngredientList(){
    return apiGet('inventory/list');
}