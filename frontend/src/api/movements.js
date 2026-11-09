// calls to the backend for the stock movements (needs client.js loaded first)

// filters (all optional): type, ingredient_id, from, to (YYYY-MM-DD), page
function getMovements(filters){
    var query = {per_page: 15};
    ['type', 'ingredient_id', 'from', 'to', 'page'].forEach(function(key){
        if(filters[key]){
            query[key] = filters[key];
        }
    });
    return apiGet('stock/movements', query);
}

// the ingredient names for the Item filter
function getMovementItems(){
    return apiGet('inventory/list', {});
}