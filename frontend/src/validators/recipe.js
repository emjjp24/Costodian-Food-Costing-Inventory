// checks the recipe form before it is sent
// gives an error message, or "" when everything is fine
// the backend checks everything again, this only saves a trip to the server

// 2, 0.5, 1/2 or 1 1/2
function isQuantity(text){
    text = text.trim();
    if(/^\d+\s+\d+\s*\/\s*\d+$/.test(text)){
        return !/\/\s*0+$/.test(text);
    }
    if(/^\d+\s*\/\s*\d+$/.test(text)){
        return !/\/\s*0+$/.test(text);
    }
    return /^(\d+(\.\d+)?|\.\d+)$/.test(text) && parseFloat(text) > 0;
}

function isMoney(text){
    return /^(\d+(\.\d+)?|\.\d+)$/.test(text.trim());
}

function validateRecipeForm(values){

    if(values.name == ""){
        return 'Please enter the recipe name.';
    }
    if(values.servings != "" && !/^\d+$/.test(values.servings)){
        return 'Servings must be a whole number.';
    }
    if(values.servings != "" && parseInt(values.servings, 10) < 1){
        return 'Servings must be at least 1.';
    }
    if(values.other_costs != "" && !isMoney(values.other_costs)){
        return 'Other costs must be an amount like 25 or 12.50.';
    }
    if(values.target != ""){
        if(!isMoney(values.target) || parseFloat(values.target) <= 0 || parseFloat(values.target) > 100){
            return 'The target food cost must be more than 0 and not more than 100 percent.';
        }
    }
    if(values.lines.length == 0){
        return 'Please add at least one ingredient.';
    }

    for(var i = 0; i < values.lines.length; i++){
        var line = values.lines[i];
        var label = line.name != "" ? line.name : 'Ingredient ' + (i + 1);

        if(line.name == ""){
            return label + ' needs a name.';
        }
        if(line.qty_needed == "" || !isQuantity(line.qty_needed)){
            return label + ': the amount needed is not valid. Use a number like 2, 0.5, 1/2 or 1 1/2.';
        }
        var hasQty = (line.qty_bought != "");
        var hasPrice = (line.price_paid != "");
        if(hasQty != hasPrice){
            return label + ': enter both the quantity bought and the price paid.';
        }
        if(hasQty && !isQuantity(line.qty_bought)){
            return label + ': the quantity bought is not valid.';
        }
        if(hasPrice && !isMoney(line.price_paid)){
            return label + ': the price paid is not valid.';
        }
    }
    return "";
}