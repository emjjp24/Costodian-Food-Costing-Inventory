// inventory page: draws the number cards, the table and the details window

function setStat(id, text){
    document.getElementById(id).textContent = text;
}

// the four cards at the top (always counted from the whole inventory, not from the filters)
function drawSummary(list){
    var needRestock = 0;
    var needAttention = 0;
    var value = 0;
    list.forEach(function(item){
        if(item.status.low || item.status.out){
            needRestock++;
        }
        if(item.status.expiring || item.status.expired){
            needAttention++;
        }
        value += item.stock_value;
    });
    setStat('stat-total', list.length);
    setStat('stat-low', needRestock);
    setStat('stat-expiry', needAttention);
    setStat('stat-value', money(value));
}

// a table cell that also knows its column name (the phone layout shows it)
function cell(label, className){
    var td = document.createElement('td');
    td.setAttribute('data-label', label);
    if(className){
        td.className = className;
    }
    return td;
}

function expiryText(item){
    if(!item.expiry_date){
        return '-';
    }
    var text = formatDate(item.expiry_date);
    if(item.status.expired){
        return text + ' (expired)';
    }
    if(item.days_to_expiry == 0){
        return text + ' (today)';
    }
    if(item.status.expiring){
        return text + ' (' + item.days_to_expiry + (item.days_to_expiry == 1 ? ' day' : ' days') + ')';
    }
    return text;
}

function drawTable(list, filtering){
    inventoryRows.innerHTML = '';

    if(list.length == 0){
        var row = document.createElement('tr');
        var td = h('td', 'empty');
        td.colSpan = 8;
        if(filtering){
            td.textContent = 'No ingredient matches your search.';
        } else {
            td.textContent = 'Your inventory is empty. Ingredients are added when you save a recipe or buy stock.';
        }
        row.appendChild(td);
        inventoryRows.appendChild(row);
        return;
    }

    list.forEach(function(item){
        var row = document.createElement('tr');

        var name = cell('Ingredient', 'item');
        name.appendChild(h('strong', '', item.name));
        if(item.category_name){
            name.appendChild(h('small', '', item.category_name));
        }
        row.appendChild(name);

        row.appendChild(cell('In stock')).textContent = item.stock_text;
        row.appendChild(cell('Cost')).textContent = money(item.cost_per) + ' / ' + item.cost_per_unit;
        row.appendChild(cell('Value')).textContent = money(item.stock_value);
        row.appendChild(cell('Reorder at')).textContent = item.reorder_level > 0 ? item.reorder_text : '-';
        row.appendChild(cell('Expiry', 'when')).textContent = expiryText(item);

        var state = cell('Status');
        var tags = h('div', 'tag-stack');
        statusTags(item.status).forEach(function(tag){
            tags.appendChild(h('span', tag[1], tag[0]));
        });
        state.appendChild(tags);
        row.appendChild(state);

        var actions = cell('', 'row-actions');
        var restock = h('button', 'btn btn-fill btn-sm', 'Restock');
        restock.type = 'button';
        restock.addEventListener('click', function(){
            openStock('restock', item);
        });
        var use = h('button', 'btn btn-line btn-sm', 'Use');
        use.type = 'button';
        use.addEventListener('click', function(){
            openStock('use', item);
        });
        var more = h('button', 'btn btn-line btn-sm', 'Details');
        more.type = 'button';
        more.addEventListener('click', function(){
            openDetails(item.id);
        });
        actions.appendChild(restock);
        actions.appendChild(use);
        actions.appendChild(more);
        row.appendChild(actions);

        inventoryRows.appendChild(row);
    });
}

// ---------- the details window ----------

function statBox(label, value){
    var box = h('div', 'stat-box');
    box.appendChild(h('span', 'stat-box-label', label));
    box.appendChild(h('span', 'stat-box-value', value));
    return box;
}

function field(labelText, input){
    var label = h('label', 'field');
    label.appendChild(document.createTextNode(labelText));
    label.appendChild(input);
    return label;
}

function historyTag(type){
    if(type == 'stock_in'){
        return ['Added', 'tag tag-add'];
    }
    if(type == 'stock_out'){
        return ['Used', 'tag tag-out'];
    }
    if(type == 'waste'){
        return ['Waste', 'tag tag-waste'];
    }
    return ['Adjusted', 'tag tag-adjust'];
}

function drawDetails(item){
    document.getElementById('detail-title').textContent = item.name;
    var sub = document.getElementById('detail-sub');
    sub.innerHTML = '';
    if(item.category_name){
        sub.appendChild(h('span', 'chip', item.category_name));
    }
    statusTags(item.status).forEach(function(tag){
        sub.appendChild(h('span', tag[1], tag[0]));
    });

    var body = document.getElementById('detail-body');
    body.innerHTML = '';

    var stats = h('div', 'stat-boxes');
    stats.appendChild(statBox('In stock', item.stock_text));
    stats.appendChild(statBox('Cost per ' + item.cost_per_unit, money(item.cost_per)));
    stats.appendChild(statBox('Stock value', money(item.stock_value)));
    stats.appendChild(statBox('Used in', item.used_in_recipes + (item.used_in_recipes == 1 ? ' recipe' : ' recipes')));
    body.appendChild(stats);

    // change the category, reorder level and expiry date
    body.appendChild(h('h3', 'section-title', 'Details'));
    var detailError = h('div', 'alert alert-error');
    detailError.hidden = true;
    body.appendChild(detailError);

    var grid = h('div', 'form-grid');

    var categorySelect = document.createElement('select');
    fillCategorySelect(categorySelect, ingredientCategories, 'No category');
    categorySelect.value = item.category_id !== null ? item.category_id : '';
    grid.appendChild(field('Category', categorySelect));

    var expiryInput = document.createElement('input');
    expiryInput.type = 'date';
    expiryInput.value = item.expiry_date ? item.expiry_date : '';
    grid.appendChild(field('Expiry date (optional)', expiryInput));

    var reorderLabel = h('label', 'field span-2');
    reorderLabel.appendChild(document.createTextNode('Warn me when the stock is at or below'));
    var reorderRow = h('div', 'amount-row');
    var reorderInput = document.createElement('input');
    reorderInput.type = 'text';
    reorderInput.setAttribute('inputmode', 'decimal');
    reorderInput.placeholder = 'For example 500';
    var reorderUnit = document.createElement('select');
    var chosenUnit = null;
    if(item.reorder_level > 0){
        var parts = splitQuantity(item.reorder_text);
        reorderInput.value = parts.amount;
        chosenUnit = parts.unit;
    }
    setUnitOptions(reorderUnit, item.base_unit, chosenUnit);
    reorderRow.appendChild(reorderInput);
    reorderRow.appendChild(reorderUnit);
    reorderLabel.appendChild(reorderRow);
    grid.appendChild(reorderLabel);
    body.appendChild(grid);

    var saveRow = h('div', 'save-row');
    var saveBtn = h('button', 'btn btn-fill btn-sm', 'Save details');
    saveBtn.type = 'button';
    saveRow.appendChild(saveBtn);
    body.appendChild(saveRow);

    saveBtn.addEventListener('click', function(){
        saveDetails(item, {
            category: categorySelect.value,
            reorder: reorderInput.value.trim(),
            reorder_unit: reorderUnit.value,
            expiry: expiryInput.value
        }, detailError, saveBtn);
    });

    // the buttons that change the stock
    body.appendChild(h('h3', 'section-title', 'Change the stock'));
    var actions = h('div', 'detail-actions');
    [['restock', 'Restock', 'btn btn-fill btn-sm'], ['use', 'Use', 'btn btn-line btn-sm'], ['waste', 'Record waste', 'btn btn-line btn-sm']].forEach(function(entry){
        var button = h('button', entry[2], entry[1]);
        button.type = 'button';
        button.addEventListener('click', function(){
            detailDialog.close();
            openStock(entry[0], item);
        });
        actions.appendChild(button);
    });
    body.appendChild(actions);

    // the history
    body.appendChild(h('h3', 'section-title', 'Recent history'));
    if(item.history.length == 0){
        body.appendChild(h('p', 'hint', 'No history yet.'));
    } else {
        var wrap = h('div', 'table-wrap');
        var table = h('table', 'mini-table');
        var head = document.createElement('thead');
        var headRow = document.createElement('tr');
        ['When', 'Type', 'Amount', 'Note', 'By'].forEach(function(title){
            headRow.appendChild(h('th', '', title));
        });
        head.appendChild(headRow);
        table.appendChild(head);
        var tbody = document.createElement('tbody');
        item.history.forEach(function(move){
            var tr = document.createElement('tr');
            tr.appendChild(h('td', 'when', formatDateTime(move.created_at)));
            var typeCell = document.createElement('td');
            var tag = historyTag(move.type);
            typeCell.appendChild(h('span', tag[1], tag[0]));
            tr.appendChild(typeCell);
            tr.appendChild(h('td', '', move.qty_text));
            tr.appendChild(h('td', '', move.reference ? move.reference : '-'));
            tr.appendChild(h('td', '', move.user_name ? move.user_name : '-'));
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        wrap.appendChild(table);
        body.appendChild(wrap);
    }

    // delete (administrators only)
    if(currentUser && currentUser.role == 'admin'){
        var actionsRow = h('div', 'dialog-actions');
        var deleteBtn = h('button', 'btn btn-danger btn-sm', 'Delete ingredient');
        deleteBtn.type = 'button';
        actionsRow.appendChild(deleteBtn);
        body.appendChild(actionsRow);

        deleteBtn.addEventListener('click', function(){
            actionsRow.innerHTML = '';
            actionsRow.appendChild(h('span', 'confirm-text', 'Delete ' + item.name + '?'));
            var no = h('button', 'btn btn-line btn-sm', 'Cancel');
            no.type = 'button';
            var yes = h('button', 'btn btn-danger btn-sm', 'Yes, delete');
            yes.type = 'button';
            actionsRow.appendChild(no);
            actionsRow.appendChild(yes);
            no.addEventListener('click', function(){
                drawDetails(item);
            });
            yes.addEventListener('click', function(){
                yes.disabled = true;
                deleteIngredient(item.id).then(function(reply){
                    if(reply.success){
                        detailDialog.close();
                        showMessage(reply.message, true);
                        refreshInventory();
                    } else {
                        detailError.textContent = reply.message;
                        detailError.hidden = false;
                        drawDetailsKeepError(item, reply.message);
                    }
                });
            });
        });
    }
}

// after a failed delete: draw the window again with the reason on top
function drawDetailsKeepError(item, message){
    drawDetails(item);
    var box = document.querySelector('#detail-body .alert-error');
    box.textContent = message;
    box.hidden = false;
}

function openDetails(id){
    clearMessage();
    getIngredient(id).then(function(reply){
        if(!reply.success){
            showMessage(reply.message, false);
            return;
        }
        drawDetails(reply.data);
        if(!detailDialog.open){
            detailDialog.showModal();
        }
    });
}