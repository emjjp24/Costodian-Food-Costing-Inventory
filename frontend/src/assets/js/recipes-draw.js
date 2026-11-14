// recipes page: draws the recipe cards and the "view recipe" window

// the picture part of a card (the backend has no photos yet, so it is a colored box with an icon)
var PLATE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 2v20M4 2v6a3 3 0 0 0 6 0V2"/><path d="M17 22V2c-3 2-4 5-4 9h4"/></svg>';

function drawCards(list, searching){
    recipesBox.innerHTML = '';

    if(list.length == 0){
        var empty = h('div', 'empty-state');
        empty.appendChild(h('strong', '', searching ? 'No recipes match your search.' : 'No recipes yet.'));
        empty.appendChild(h('span', '', searching ? 'Try another name or category.' : 'Click Add Recipe to cost your first dish.'));
        recipesBox.appendChild(empty);
        return;
    }

    list.forEach(function(recipe){
        var costing = recipe.costing;
        var card = h('article', 'card');

        var picture = h('div', 'card-img img-' + (recipe.id % 3));
        if(recipe.image_url){
            var photo = document.createElement('img');
            photo.src = recipe.image_url;
            photo.alt = recipe.name;
            picture.appendChild(photo);
        } else {
            picture.innerHTML = PLATE_ICON;
        }
        card.appendChild(picture);

        var body = h('div', 'card-body');
        var top = h('div', 'card-top');
        top.appendChild(h('h2', 'card-name', recipe.name));
        top.appendChild(h('span', 'cost-badge', money(costing.total_cost)));
        body.appendChild(top);

        body.appendChild(h('p', 'card-label', 'Total Recipe Cost'));
        body.appendChild(h('p', 'card-sub', money(costing.cost_per_serving) + ' per serving · sell at ' + money(costing.suggested_price)));

        var tags = h('div', 'card-tags');
        if(recipe.category_name){
            tags.appendChild(h('span', 'chip', recipe.category_name));
        }
        tags.appendChild(h('span', 'chip', costing.servings + (costing.servings == 1 ? ' serving' : ' servings')));
        body.appendChild(tags);

        var actions = h('div', 'card-actions');
        var viewBtn = h('button', 'btn btn-line btn-sm', 'View');
        viewBtn.type = 'button';
        viewBtn.addEventListener('click', function(){
            openView(recipe.id);
        });
        var editBtn = h('button', 'btn btn-fill btn-sm', 'Edit');
        editBtn.type = 'button';
        editBtn.addEventListener('click', function(){
            openForm(recipe.id);
        });
        actions.appendChild(viewBtn);
        actions.appendChild(editBtn);
        body.appendChild(actions);

        card.appendChild(body);
        recipesBox.appendChild(card);
    });
}

// ---------- the "view recipe" window ----------

// a small box with a number and a label
function statBox(label, value, strong){
    var box = h('div', strong ? 'stat-box strong' : 'stat-box');
    box.appendChild(h('span', 'stat-box-label', label));
    box.appendChild(h('span', 'stat-box-value', value));
    return box;
}

function costRow(label, value){
    var row = h('div', 'cost-row');
    row.appendChild(h('span', '', label));
    row.appendChild(h('span', '', value));
    return row;
}

// note = a message to show at the top (for example after cooking), price = the price the person is checking
function drawView(data, note, price){
    var costing = data.costing;
    var body = document.getElementById('view-body');
    body.innerHTML = '';

    document.getElementById('view-title').textContent = data.name;
    var sub = document.getElementById('view-sub');
    sub.innerHTML = '';
    if(data.category_name){
        sub.appendChild(h('span', 'chip', data.category_name));
    }
    sub.appendChild(h('span', 'chip', costing.servings + (costing.servings == 1 ? ' serving' : ' servings')));

    if(note){
        var noteBox = h('div', note.ok ? 'alert alert-ok' : 'alert alert-error', note.text);
        noteBox.setAttribute('role', 'alert');
        body.appendChild(noteBox);
    }

    // the main numbers
    var stats = h('div', 'stat-boxes');
    stats.appendChild(statBox('Total cost', money(costing.total_cost), false));
    stats.appendChild(statBox('Cost per serving', money(costing.cost_per_serving), false));
    // with a markup chosen, the suggested price is the price with that markup
    var suggestedLabel = costing.price_basis == 'markup' ? 'Suggested price (' + costing.markup_pct + '% markup)' : 'Suggested price';
    stats.appendChild(statBox(suggestedLabel, money(costing.suggested_price), true));
    stats.appendChild(statBox('Profit per serving', money(costing.profit_per_serving), false));
    body.appendChild(stats);

    // the ingredients
    body.appendChild(h('h3', 'section-title', 'Ingredients'));
    var wrap = h('div', 'table-wrap');
    var table = h('table', 'mini-table');
    var head = document.createElement('thead');
    var headRow = document.createElement('tr');
    ['Ingredient', 'Amount', 'Cost', 'In stock'].forEach(function(text){
        headRow.appendChild(h('th', '', text));
    });
    head.appendChild(headRow);
    table.appendChild(head);

    var tbody = document.createElement('tbody');
    data.ingredients.forEach(function(line){
        var row = document.createElement('tr');
        row.appendChild(h('td', '', line.name));
        row.appendChild(h('td', '', line.qty_text));
        row.appendChild(h('td', '', money(line.line_cost)));
        var stockCell = document.createElement('td');
        stockCell.appendChild(h('span', line.enough ? 'chip chip-ok' : 'chip chip-short', line.enough ? line.stock_text : 'Short: ' + line.stock_text));
        row.appendChild(stockCell);
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    body.appendChild(wrap);

    // the costing
    body.appendChild(h('h3', 'section-title', 'Costing'));
    var rows = h('div', 'cost-rows');
    rows.appendChild(costRow('Ingredients', money(costing.ingredient_cost)));
    rows.appendChild(costRow('Other costs (packaging, gas, labor)', money(costing.other_costs)));
    rows.appendChild(costRow('Total cost of the whole recipe', money(costing.total_cost)));
    rows.appendChild(costRow('Target food cost', costing.target_food_cost_pct + '%'));
    // the owner's own markup (only when the recipe has one): the suggested price above already follows it
    if(costing.price_basis == 'markup'){
        rows.appendChild(costRow('Markup', costing.markup_pct + '%'));
        rows.appendChild(costRow('Price if only the target food cost is used', money(costing.target_price)));
        rows.appendChild(costRow('Food cost at the suggested price', costing.markup_food_cost_pct + '%'));
    }
    body.appendChild(rows);

    // check your own selling price
    body.appendChild(h('h3', 'section-title', 'Check your own price'));
    var priceRow = h('div', 'inline-form');
    var priceLabel = h('label', '', 'Selling price per serving');
    var priceInput = document.createElement('input');
    priceInput.type = 'text';
    priceInput.id = 'own-price';
    priceInput.inputMode = 'decimal';
    priceInput.placeholder = String(costing.suggested_price);
    if(price){
        priceInput.value = price;
    }
    priceLabel.appendChild(priceInput);
    var priceBtn = h('button', 'btn btn-line', 'Check');
    priceBtn.type = 'button';
    priceRow.appendChild(priceLabel);
    priceRow.appendChild(priceBtn);
    body.appendChild(priceRow);

    var priceResult = h('p', 'result-line');
    priceResult.id = 'price-result';
    if(costing.selling_price){
        var over = costing.food_cost_pct > costing.target_food_cost_pct;
        priceResult.textContent = 'At ' + money(costing.selling_price) + ', ingredients are ' + costing.food_cost_pct + '% of the price and you earn ' + money(costing.selling_profit_per_serving) + ' per serving.' + (over ? ' That is higher than your target of ' + costing.target_food_cost_pct + '%.' : ' That is within your target of ' + costing.target_food_cost_pct + '%.');
    }
    body.appendChild(priceResult);

    function checkPrice(){
        var value = priceInput.value.trim();
        if(!isMoney(value) || parseFloat(value) <= 0){
            priceResult.textContent = 'Please enter a price like 45 or 52.50.';
            return;
        }
        getRecipe(data.id, value).then(function(reply){
            if(reply.success){
                drawView(reply.data, null, value);
            } else {
                priceResult.textContent = reply.message;
            }
        });
    }
    priceBtn.addEventListener('click', checkPrice);
    priceInput.addEventListener('keydown', function(event){
        if(event.key == 'Enter'){
            event.preventDefault();
            checkPrice();
        }
    });

    // cook the recipe: takes the ingredients out of the inventory
    body.appendChild(h('h3', 'section-title', 'Cook this recipe'));
    body.appendChild(h('p', 'result-line', 'Your stock can make ' + data.can_cook_batches + (data.can_cook_batches == 1 ? ' whole batch.' : ' whole batches.')));
    var cookRow = h('div', 'inline-form');
    var cookLabel = h('label', '', 'Batches');
    var cookInput = document.createElement('input');
    cookInput.type = 'text';
    cookInput.id = 'cook-batches';
    cookInput.value = '1';
    cookLabel.appendChild(cookInput);
    var cookBtn = h('button', 'btn btn-fill', 'Cook');
    cookBtn.type = 'button';
    cookRow.appendChild(cookLabel);
    cookRow.appendChild(cookBtn);
    body.appendChild(cookRow);
    body.appendChild(h('p', 'hint', 'You can type 1/2 for half a batch. The ingredients are taken out of your inventory.'));

    cookBtn.addEventListener('click', function(){
        var batches = cookInput.value.trim();
        if(!isQuantity(batches)){
            drawView(data, {ok: false, text: 'The batches must be a number like 1, 2 or 1/2.'}, priceInput.value.trim());
            return;
        }
        cookBtn.disabled = true;
        cookRecipe(data.id, batches).then(function(reply){
            getRecipe(data.id, priceInput.value.trim() || null).then(function(fresh){
                if(fresh.success){
                    drawView(fresh.data, {ok: reply.success, text: reply.message}, priceInput.value.trim());
                } else {
                    cookBtn.disabled = false;
                    drawView(data, {ok: false, text: reply.message}, priceInput.value.trim());
                }
                // the cards and the bell do not show stock, but the list stays in step
                loadRecipes();
            });
        });
    });

    if(data.notes){
        body.appendChild(h('h3', 'section-title', 'Notes'));
        body.appendChild(h('p', 'notes-text', data.notes));
    }

    // edit and delete
    var actions = h('div', 'dialog-actions');
    var deleteBtn = h('button', 'btn btn-danger', 'Delete');
    deleteBtn.type = 'button';
    var editBtn = h('button', 'btn btn-fill', 'Edit');
    editBtn.type = 'button';
    actions.appendChild(deleteBtn);
    actions.appendChild(editBtn);
    body.appendChild(actions);

    editBtn.addEventListener('click', function(){
        viewDialog.close();
        openForm(data.id);
    });

    // asks "are you sure" in the same place before it deletes
    deleteBtn.addEventListener('click', function(){
        actions.innerHTML = '';
        actions.appendChild(h('span', 'confirm-text', 'Delete this recipe? The inventory is not changed.'));
        var yes = h('button', 'btn btn-danger', 'Yes, delete');
        yes.type = 'button';
        var no = h('button', 'btn btn-line', 'Cancel');
        no.type = 'button';
        actions.appendChild(no);
        actions.appendChild(yes);
        no.addEventListener('click', function(){
            drawView(data, null, priceInput.value.trim());
        });
        yes.addEventListener('click', function(){
            yes.disabled = true;
            deleteRecipe(data.id).then(function(reply){
                viewDialog.close();
                showMessage(reply.message, reply.success);
                loadRecipes();
            });
        });
    });
}

function openView(id){
    document.getElementById('view-title').textContent = 'Loading...';
    document.getElementById('view-sub').innerHTML = '';
    document.getElementById('view-body').innerHTML = '';
    viewDialog.showModal();
    getRecipe(id, null).then(function(reply){
        if(reply.success){
            drawView(reply.data, null, '');
        } else {
            viewDialog.close();
            showMessage(reply.message, false);
        }
    });
}