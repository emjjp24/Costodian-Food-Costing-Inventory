// calls to the backend for the inventory (needs client.js loaded first)

// the ingredients, search / categoryId / status are all optional
// status: low, out, expired, expiring or alert
function getInventory(search, categoryId, status){
    var query = {};
    if(search){
        query.search = search;
    }
    if(categoryId){
        query.category_id = categoryId;
    }
    if(status){
        query.status = status;
    }
    return apiGet('inventory/list', query);
}

// one ingredient with its latest stock history
function getIngredient(id){
    return apiGet('inventory/view', {id: id});
}

// change the category, the reorder level or the expiry date
function updateIngredient(id, data){
    data.id = id;
    return apiPost('inventory/update', data);
}

function deleteIngredient(id){
    return apiPost('inventory/delete', {id: id});
}

// add stock you bought: ingredient_id, qty, unit, price_paid, expiry_date, note
function restockIngredient(data){
    return apiPost('stock/restock', data);
}

// take stock out because you used it: ingredient_id, qty, unit, note
function useIngredient(data){
    return apiPost('stock/use', data);
}

// take stock out because it was spoiled or lost: ingredient_id, qty, unit, reason
function wasteIngredient(data){
    return apiPost('stock/waste', data);
}

function getIngredientCategories(){
    return apiGet('categories/list', {type: 'ingredient'});
}