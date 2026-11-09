// movements page: loads the list, the filters, the details panel and the page buttons (loads last)

var currentPage = 1;
var moveDialog = document.getElementById('move-dialog');

// the table: one row for every movement
function drawMovements(items){
    movementRows.innerHTML = '';

    if(items.length == 0){
        var emptyRow = document.createElement('tr');
        var td = h('td', 'empty', 'No stock movements found.');
        td.colSpan = 6;
        emptyRow.appendChild(td);
        movementRows.appendChild(emptyRow);
        return;
    }

    items.forEach(function(move){
        var kind = MOVEMENT_KINDS[move.type];
        var row = document.createElement('tr');

        function cell(label, text, className){
            var td = h('td', className, text);
            td.setAttribute('data-label', label);
            row.appendChild(td);
            return td;
        }

        // the date has a long text (table) and a short one (phone)
        var dateCell = cell('Date', '', 'when');
        dateCell.appendChild(h('span', 'd-full', formatDateTime(move.created_at)));
        dateCell.appendChild(h('span', 'd-short', formatShortDateTime(move.created_at)));

        cell('Item Name', move.ingredient_name, 'item-name');

        var typeCell = cell('Movement Type', '', 'type-cell');
        typeCell.appendChild(h('span', kind.tag, kind.label));

        cell('Quantity Changed', kind.sign + move.qty_text, 'qty qty-' + move.type);
        cell('Performed By', move.user_name ? move.user_name : '-', 'extra');
        cell('Notes', move.reference ? move.reference : '-', 'extra');

        // a tap (or Enter) on the row opens the small panel with everything
        row.className = 'mov-row';
        row.tabIndex = 0;
        row.setAttribute('role', 'button');
        row.setAttribute('aria-label', 'Details of ' + move.ingredient_name);
        row.addEventListener('click', function(){
            openMovement(move);
        });
        row.addEventListener('keydown', function(event){
            if(event.key == 'Enter' || event.key == ' '){
                event.preventDefault();
                openMovement(move);
            }
        });

        movementRows.appendChild(row);
    });
}

// the small panel with the details of one movement
function openMovement(move){
    var kind = MOVEMENT_KINDS[move.type];
    document.getElementById('move-title').textContent = move.ingredient_name;
    var tag = document.getElementById('move-tag');
    tag.innerHTML = '';
    tag.appendChild(h('span', kind.tag, kind.label));

    var qty = document.getElementById('move-qty');
    qty.textContent = kind.sign + move.qty_text;
    qty.className = 'sheet-qty qty-' + move.type;

    var list = document.getElementById('move-list');
    list.innerHTML = '';
    [['Date', formatDateTime(move.created_at)],
     ['Performed by', move.user_name ? move.user_name : '-'],
     ['Notes', move.reference ? move.reference : '-']].forEach(function(pair){
        var box = h('div', 'sheet-row');
        box.appendChild(h('dt', '', pair[0]));
        box.appendChild(h('dd', '', pair[1]));
        list.appendChild(box);
    });
    moveDialog.showModal();
}

document.getElementById('move-close').addEventListener('click', function(){
    moveDialog.close();
});
moveDialog.addEventListener('click', function(event){
    if(event.target === moveDialog){
        moveDialog.close();
    }
});

// the page buttons under the table: previous, a few numbers, next
function drawPager(data){
    pager.innerHTML = '';
    countText.textContent = data.total == 0 ? '' : data.total + (data.total == 1 ? ' movement' : ' movements');
    if(data.pages <= 1){
        return;
    }

    function button(label, page, disabled, active){
        var b = h('button', 'page-btn' + (active ? ' page-btn-on' : ''), label);
        b.type = 'button';
        b.disabled = disabled;
        if(active){
            b.setAttribute('aria-current', 'page');
        }
        b.addEventListener('click', function(){
            currentPage = page;
            loadMovements();
        });
        pager.appendChild(b);
    }

    button('«', data.page - 1, data.page <= 1, false);
    var first = Math.max(1, data.page - 2);
    var last = Math.min(data.pages, first + 4);
    first = Math.max(1, last - 4);
    for(var n = first; n <= last; n++){
        button(String(n), n, false, n == data.page);
    }
    button('»', data.page + 1, data.page >= data.pages, false);
}

function loadMovements(){
    clearMessage();
    getMovements({
        type: typeFilter.value,
        ingredient_id: itemFilter.value,
        from: fromDate.value,
        to: toDate.value,
        page: currentPage
    }).then(function(reply){
        if(!reply.success){
            showMessage(reply.message);
            movementRows.innerHTML = '';
            pager.innerHTML = '';
            return;
        }
        drawMovements(reply.data.items);
        drawPager(reply.data);
    });
}

// a changed filter starts again from page 1
function filterChanged(){
    currentPage = 1;
    loadMovements();
}

[fromDate, toDate, typeFilter, itemFilter].forEach(function(control){
    control.addEventListener('change', filterChanged);
});

document.getElementById('clear-filters').addEventListener('click', function(){
    fromDate.value = '';
    toDate.value = '';
    typeFilter.value = '';
    itemFilter.value = '';
    filterChanged();
});

// the quick date choices: today, last 7 days, last 30 days
function dateText(date){
    var month = String(date.getMonth() + 1);
    var day = String(date.getDate());
    return date.getFullYear() + '-' + (month.length < 2 ? '0' : '') + month + '-' + (day.length < 2 ? '0' : '') + day;
}

document.querySelectorAll('.preset').forEach(function(button){
    button.addEventListener('click', function(){
        var days = parseInt(button.getAttribute('data-days'), 10);
        var start = new Date();
        start.setDate(start.getDate() - days);
        fromDate.value = dateText(start);
        toDate.value = dateText(new Date());
        filterChanged();
    });
});

// the top search box looks for an item name in the Item filter
searchBox.addEventListener('input', function(){
    var text = searchBox.value.trim().toLowerCase();
    if(text == ""){
        itemFilter.value = '';
        filterChanged();
        return;
    }
    for(var i = 0; i < itemFilter.options.length; i++){
        if(itemFilter.options[i].textContent.toLowerCase().indexOf(text) != -1 && itemFilter.options[i].value != ""){
            itemFilter.value = itemFilter.options[i].value;
            filterChanged();
            return;
        }
    }
});

// ---------- start ----------

startShell().then(function(user){
    if(!user){
        return;
    }
    getMovementItems().then(function(reply){
        if(reply.success){
            reply.data.forEach(function(item){
                var option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.name;
                itemFilter.appendChild(option);
            });
        }
    });
    loadMovements();
});