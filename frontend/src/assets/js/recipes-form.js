// recipes page: the "add recipe" and "edit recipe" window

var formTitle = document.getElementById('form-title');
var formError = document.getElementById('form-error');
var recipeForm = document.getElementById('recipe-form');
var ingredientRows = document.getElementById('ingredient-rows');
var saveBtn = document.getElementById('save-btn');

// the recipe being edited, or null when a new one is added
var editingId = null;

function showFormError(text){
    formError.textContent = text;
    formError.hidden = false;
    // the window scrolls, so bring the message into view
    formError.scrollIntoView({block: 'nearest'});
}

// one small box with a label and an input
function field(labelText, input, extraClass){
    var label = h('label', 'field ' + (extraClass || ''));
    label.appendChild(document.createTextNode(labelText));
    label.appendChild(input);
    return label;
}

function textInput(placeholder, mode){
    var input = document.createElement('input');
    input.type = 'text';
    if(placeholder){
        input.placeholder = placeholder;
    }
    if(mode){
        input.inputMode = mode;
    }
    return input;
}

// one ingredient line of the recipe (line is given when a recipe is edited)
function addIngredientRow(line){
    var row = h('div', 'ing-row');

    var nameInput = textInput('e.g. Flour', null);
    nameInput.setAttribute('list', 'ingredient-names');
    nameInput.autocomplete = 'off';
    nameInput.className = 'in-name';

    var amountInput = textInput('1/2', 'text');
    amountInput.className = 'in-amount';

    var unitSelect = document.createElement('select');
    unitSelect.className = 'in-unit';
    setUnitOptions(unitSelect, null);

    var removeBtn = h('button', 'ing-remove', '×');
    removeBtn.type = 'button';
    removeBtn.setAttribute('aria-label', 'Remove this ingredient');

    var main = h('div', 'ing-main');
    main.appendChild(field('Ingredient', nameInput, 'f-name'));
    main.appendChild(field('Amount needed', amountInput, 'f-amount'));
    main.appendChild(field('Unit', unitSelect, 'f-unit'));
    main.appendChild(removeBtn);
    row.appendChild(main);

    var hint = h('p', 'ing-hint');
    row.appendChild(hint);

    // what was bought: needed for an ingredient that is not in the inventory yet
    var more = document.createElement('details');
    more.className = 'ing-more';
    more.appendChild(h('summary', '', 'What I bought (needed for a new ingredient)'));
    var buy = h('div', 'ing-buy');

    var boughtInput = textInput('1', 'text');
    boughtInput.className = 'in-bought';
    var boughtUnit = document.createElement('select');
    boughtUnit.className = 'in-bought-unit';
    setUnitOptions(boughtUnit, null);
    var priceInput = textInput('0.00', 'decimal');
    priceInput.className = 'in-price';
    var expiryInput = document.createElement('input');
    expiryInput.type = 'date';
    expiryInput.className = 'in-expiry';
    var categorySelect = document.createElement('select');
    categorySelect.className = 'in-category';
    fillCategorySelect(categorySelect, ingredientCategories, 'No category');

    buy.appendChild(field('Quantity bought', boughtInput, ''));
    buy.appendChild(field('Unit', boughtUnit, ''));
    buy.appendChild(field('Price paid (₱)', priceInput, ''));
    buy.appendChild(field('Expiry date (optional)', expiryInput, ''));
    buy.appendChild(field('Category', categorySelect, ''));
    more.appendChild(buy);
    row.appendChild(more);

    // the name: an ingredient that is already in the inventory only needs its amount
    function checkName(opening){
        var key = nameInput.value.trim().toLowerCase();
        var known = key != "" ? inventoryByName[key] : null;

        if(known){
            hint.textContent = 'In your inventory: ' + known.stock_text + '. Use ' + UNIT_FAMILIES[known.base_unit].join(' or ') + ' here.';
            setUnitOptions(unitSelect, known.base_unit);
            setUnitOptions(boughtUnit, known.base_unit);
        } else if(key != ""){
            hint.textContent = 'New ingredient. Open "What I bought" and enter the quantity and the price, so it can be costed.';
            setUnitOptions(unitSelect, null);
            setUnitOptions(boughtUnit, null);
            if(opening){
                more.open = true;
            }
        } else {
            hint.textContent = '';
        }
    }
    nameInput.addEventListener('input', function(){
        checkName(false);
    });
    nameInput.addEventListener('change', function(){
        checkName(true);
    });

    removeBtn.addEventListener('click', function(){
        row.remove();
    });

    if(line){
        nameInput.value = line.name;
        setUnitOptions(unitSelect, line.base_unit);
        setUnitOptions(boughtUnit, line.base_unit);
        var parts = splitQuantity(line.qty_text);
        amountInput.value = parts.amount;
        unitSelect.value = parts.unit;
        hint.textContent = 'In your inventory: ' + line.stock_text + '.';
    }

    ingredientRows.appendChild(row);
    return row;
}

// reads everything that was typed
function readForm(){
    var values = {
        name: document.getElementById('f-name').value.trim(),
        category_id: document.getElementById('f-category').value,
        servings: document.getElementById('f-servings').value.trim(),
        other_costs: document.getElementById('f-other').value.trim(),
        target: document.getElementById('f-target').value.trim(),
        notes: document.getElementById('f-notes').value.trim(),
        lines: []
    };

    ingredientRows.querySelectorAll('.ing-row').forEach(function(row){
        values.lines.push({
            name: row.querySelector('.in-name').value.trim(),
            qty_needed: row.querySelector('.in-amount').value.trim(),
            needed_unit: row.querySelector('.in-unit').value,
            qty_bought: row.querySelector('.in-bought').value.trim(),
            bought_unit: row.querySelector('.in-bought-unit').value,
            price_paid: row.querySelector('.in-price').value.trim(),
            expiry_date: row.querySelector('.in-expiry').value,
            category_id: row.querySelector('.in-category').value
        });
    });
    return values;
}

// what is sent to the backend (empty things are left out)
function buildPayload(values){
    var data = {
        name: values.name,
        ingredients: []
    };
    if(values.category_id != ""){
        data.category_id = values.category_id;
    }
    if(values.servings != ""){
        data.servings = values.servings;
    }
    if(values.other_costs != ""){
        data.other_costs = values.other_costs;
    }
    if(values.target != ""){
        data.target_food_cost_pct = values.target;
    }
    data.notes = values.notes;

    values.lines.forEach(function(line){
        var item = {name: line.name, qty_needed: line.qty_needed, needed_unit: line.needed_unit};
        if(line.qty_bought != ""){
            item.qty_bought = line.qty_bought;
            item.bought_unit = line.bought_unit;
            item.price_paid = line.price_paid;
        }
        if(line.expiry_date != ""){
            item.expiry_date = line.expiry_date;
        }
        if(line.category_id != ""){
            item.category_id = line.category_id;
        }
        data.ingredients.push(item);
    });
    return data;
}

// opens the window: with an id it edits that recipe, without it adds a new one
function openForm(id){
    editingId = id;
    recipeForm.reset();
    ingredientRows.innerHTML = '';
    formError.hidden = true;
    saveBtn.disabled = false;
    fillCategorySelect(document.getElementById('f-category'), recipeCategories, 'No category');

    if(id === null){
        formTitle.textContent = 'Add Recipe';
        document.getElementById('f-servings').value = '1';
        document.getElementById('f-target').value = '35';
        addIngredientRow(null);
        formDialog.showModal();
        document.getElementById('f-name').focus();
        return;
    }

    formTitle.textContent = 'Edit Recipe';
    formDialog.showModal();
    getRecipe(id, null).then(function(reply){
        if(!reply.success){
            formDialog.close();
            showMessage(reply.message, false);
            return;
        }
        var data = reply.data;
        document.getElementById('f-name').value = data.name;
        document.getElementById('f-category').value = data.category_id !== null ? data.category_id : '';
        document.getElementById('f-servings').value = data.costing.servings;
        document.getElementById('f-other').value = data.costing.other_costs;
        document.getElementById('f-target').value = data.costing.target_food_cost_pct;
        document.getElementById('f-notes').value = data.notes ? data.notes : '';
        data.ingredients.forEach(function(line){
            addIngredientRow(line);
        });
    });
}

recipeForm.addEventListener('submit', function(event){
    event.preventDefault();
    formError.hidden = true;

    var values = readForm();
    var error = validateRecipeForm(values);
    if(error != ""){
        showFormError(error);
        return;
    }

    saveBtn.disabled = true;
    var payload = buildPayload(values);
    var request = (editingId === null) ? createRecipe(payload) : updateRecipe(editingId, payload);

    request.then(function(reply){
        if(reply.success){
            formDialog.close();
            var text = reply.message;
            if(reply.data && reply.data.notes && reply.data.notes.length > 0){
                text += ' ' + reply.data.notes.join(' ');
            }
            showMessage(text, true);
            // new ingredients may have been added to the inventory
            loadIngredientNames();
            loadRecipes();
        } else {
            showFormError(reply.message);
            saveBtn.disabled = false;
        }
    });
});

document.getElementById('add-ingredient').addEventListener('click', function(){
    var row = addIngredientRow(null);
    row.querySelector('.in-name').focus();
});

// the X button and the Cancel button both close the window
['form-cancel', 'form-cancel-2'].forEach(function(id){
    document.getElementById(id).addEventListener('click', function(){
        formDialog.close();
    });
});