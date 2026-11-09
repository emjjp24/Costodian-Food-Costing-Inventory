// checks the inventory windows before they are sent
// gives an error message, or "" when everything is fine
// needs validators/recipe.js (isQuantity and isMoney are in there)

// kind is restock, use or waste
function validateStockForm(kind, values){

    if(values.qty == ""){
        return 'Please enter the amount.';
    }
    if(!isQuantity(values.qty)){
        return 'The amount is not valid. Use a number like 2, 0.5, 1/2 or 1 1/2.';
    }
    if(kind == 'restock'){
        if(values.price == ""){
            return 'Please enter the price you paid.';
        }
        if(!isMoney(values.price)){
            return 'The price must be an amount like 25 or 12.50.';
        }
    }
    if(values.note.length > 100){
        return 'The note must not be longer than 100 characters.';
    }
    return "";
}

// the edit part of the details window
function validateDetailsForm(values){

    if(values.reorder != "" && !isQuantity(values.reorder) && !/^0+(\.0+)?$/.test(values.reorder)){
        return 'The reorder level is not valid. Use a number like 500, 0.5 or 1/2.';
    }
    if(values.expiry != "" && !/^\d{4}-\d{2}-\d{2}$/.test(values.expiry)){
        return 'The expiry date must look like 2026-12-31.';
    }
    return "";
}