// what a staff member sees (the Recipes and Inventory pages)
// staff can look at recipes, cook, use the order calculator, restock, use stock and record waste,
// but they do not see what things cost or earn, and they cannot add, edit or delete anything.
// the backend already sends staff only the price per serving, and refuses the admin actions: this file just
// makes the screens match that.
// load it after shell.js and after the draw files of the page (recipes-draw.js, order-calc.js, inventory-draw.js)

var STAFF_ROLE_KEY = 'costodian-role';

// the buttons only an administrator may use are hidden with a style file (assets/css/staff-view.css)
(function(){
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../assets/css/staff-view.css';
    document.head.appendChild(link);

    // the browser remembers the last role, so the buttons are hidden from the first picture
    try {
        if(localStorage.getItem(STAFF_ROLE_KEY) == 'staff'){
            document.documentElement.classList.add('staff-view');
        }
    } catch(e){
        // private mode: they are hidden when the server answers
    }
})();

// when the server tells who is logged in, the class and the remembered role are made right
var startShellForEveryone = startShell;
startShell = function(){
    return startShellForEveryone().then(function(user){
        if(user){
            var isStaff = user.role == 'staff';
            document.documentElement.classList.toggle('staff-view', isStaff);
            try {
                localStorage.setItem(STAFF_ROLE_KEY, user.role);
            } catch(e){
                // nothing to do
            }
        }
        return user;
    });
};

// ---------- Recipes page ----------

if(typeof drawCards == 'function' && typeof drawView == 'function'){

    // a staff login always gets the staff screen (even if an old backend still sends the costs)
    function isStaffScreen(costing){
        return !!costing.staff_view || document.documentElement.classList.contains('staff-view');
    }

    // the price per serving: the backend gives it to staff as price_per_serving, the owner's number is suggested_price
    function staffPrice(costing){
        return costing.price_per_serving !== undefined ? costing.price_per_serving : costing.suggested_price;
    }

    // the cards: only the price per serving (no cost badge, no Edit button)
    var drawCardsForOwner = drawCards;
    drawCards = function(list, searching){
        drawCardsForOwner(list, searching);

        var cards = recipesBox.querySelectorAll('.card');
        list.forEach(function(recipe, i){
            if(!isStaffScreen(recipe.costing) || !cards[i]){
                return;
            }
            var card = cards[i];
            var badge = card.querySelector('.cost-badge');
            var label = card.querySelector('.card-label');
            var sub = card.querySelector('.card-sub');
            var edit = card.querySelector('.card-actions .btn-fill');
            if(badge){
                badge.remove();
            }
            if(label){
                label.textContent = 'Price per serving';
            }
            if(sub){
                sub.textContent = money(staffPrice(recipe.costing));
            }
            if(edit){
                edit.remove();
            }
        });
    };

    // the recipe window for staff: ingredients and amounts, the price, cook, the order calculator
    function drawStaffView(data, note){
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

        var stats = h('div', 'stat-boxes');
        stats.appendChild(statBox('Price per serving', money(staffPrice(costing)), true));
        stats.appendChild(statBox('This recipe makes', costing.servings + (costing.servings == 1 ? ' serving' : ' servings'), false));
        body.appendChild(stats);

        // the ingredients (no costs)
        body.appendChild(h('h3', 'section-title', 'Ingredients'));
        var wrap = h('div', 'table-wrap');
        var table = h('table', 'mini-table');
        var head = document.createElement('thead');
        var headRow = document.createElement('tr');
        ['Ingredient', 'Amount', 'In stock'].forEach(function(text){
            headRow.appendChild(h('th', '', text));
        });
        head.appendChild(headRow);
        table.appendChild(head);

        var tbody = document.createElement('tbody');
        data.ingredients.forEach(function(line){
            var row = document.createElement('tr');
            row.appendChild(h('td', '', line.name));
            row.appendChild(h('td', '', line.qty_text));
            var stockCell = document.createElement('td');
            stockCell.appendChild(h('span', line.enough ? 'chip chip-ok' : 'chip chip-short', line.enough ? line.stock_text : 'Short: ' + line.stock_text));
            row.appendChild(stockCell);
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        wrap.appendChild(table);
        body.appendChild(wrap);

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
                drawView(data, {ok: false, text: 'The batches must be a number like 1, 2 or 1/2.'}, '');
                return;
            }
            cookBtn.disabled = true;
            cookRecipe(data.id, batches).then(function(reply){
                getRecipe(data.id, null).then(function(fresh){
                    if(fresh.success){
                        drawView(fresh.data, {ok: reply.success, text: reply.message}, '');
                    } else {
                        cookBtn.disabled = false;
                        drawView(data, {ok: false, text: reply.message}, '');
                    }
                    loadRecipes();
                });
            });
        });

        // the order calculator (order-calc.js) goes under the cook button
        if(typeof drawOrderCalculator == 'function'){
            drawOrderCalculator(data);
        }

        if(data.notes){
            body.appendChild(h('h3', 'section-title', 'Notes'));
            body.appendChild(h('p', 'notes-text', data.notes));
        }
    }

    var drawViewForOwner = drawView;
    drawView = function(data, note, price){
        if(data.costing && isStaffScreen(data.costing)){
            drawStaffView(data, note);
        } else {
            drawViewForOwner(data, note, price);
        }
    };
}

// ---------- Inventory page ----------

if(typeof drawDetails == 'function'){

    // the ingredient window: staff can restock, use and record waste, but not change the details
    var drawDetailsForOwner = drawDetails;
    drawDetails = function(item){
        drawDetailsForOwner(item);
        if(!document.documentElement.classList.contains('staff-view')){
            return;
        }
        var body = document.getElementById('detail-body');
        var titles = body.querySelectorAll('.section-title');
        for(var i = 0; i < titles.length; i++){
            if(titles[i].textContent.trim() == 'Details'){
                // the title, the error box, the fields and the Save button
                var node = titles[i];
                while(node){
                    var next = node.nextElementSibling;
                    var isLast = node.classList.contains('save-row');
                    node.remove();
                    if(isLast){
                        break;
                    }
                    node = next;
                }
                break;
            }
        }
    };
}