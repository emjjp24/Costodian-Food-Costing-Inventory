// order calculator: in the recipe window, under "Cook this recipe"
// the person types how many servings are wanted (for example a bulk order of 53) and it shows the amount of
// every ingredient for that many servings, and the total price of the whole order
// (price per serving x servings, using the price already set in the recipe: no ingredient costs needed)
// needs recipes-helpers.js and recipes-draw.js loaded first

// 1250 g -> "1.25 kg", 0.5 pcs -> "0.5 pcs" (same way the backend writes quantities)
function orderQuantityText(qty, baseUnit){
    var unit = baseUnit;
    if(baseUnit == 'g' && Math.abs(qty) >= 1000){
        qty = qty / 1000;
        unit = 'kg';
    } else if(baseUnit == 'ml' && Math.abs(qty) >= 1000){
        qty = qty / 1000;
        unit = 'L';
    }
    var text = qty.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
    if(text == ''){
        text = '0';
    }
    return text + ' ' + unit;
}

// the price of one serving: the owner sees the suggested price, staff get the price per serving
function orderPricePerServing(costing){
    if(costing.suggested_price !== undefined && costing.suggested_price !== null){
        return Number(costing.suggested_price);
    }
    return Number(costing.price_per_serving);
}

// builds the calculator and puts it in the recipe window
function drawOrderCalculator(data){
    var body = document.getElementById('view-body');
    if(!body || !data.ingredients || !data.costing){
        return;
    }
    var recipeServings = Number(data.costing.servings);
    var pricePerServing = orderPricePerServing(data.costing);

    var box = h('div', 'order-calc');
    // the title with a little "?" button that opens the explanation
    var titleRow = h('div', 'order-title');
    titleRow.appendChild(h('h3', 'section-title', 'Order calculator'));
    var helpButton = h('button', 'help-btn', '?');
    helpButton.type = 'button';
    helpButton.setAttribute('aria-label', 'What is the order calculator?');
    helpButton.setAttribute('aria-expanded', 'false');
    helpButton.setAttribute('aria-controls', 'order-help');
    titleRow.appendChild(helpButton);

    var helpBox = h('div', 'help-box');
    helpBox.id = 'order-help';
    helpBox.setAttribute('role', 'dialog');
    helpBox.setAttribute('aria-label', 'About the order calculator');
    helpBox.hidden = true;
    helpBox.innerHTML = '<button type="button" class="help-close" aria-label="Close">&times;</button>' +
        '<p><strong>Order calculator</strong> works out a bigger (or smaller) order from this recipe.</p>' +
        '<p>Type how many servings are ordered. It multiplies every ingredient by <em>servings wanted &divide; servings of this recipe</em>. For example, a recipe for 5 servings with 250 g of flour needs 2.65 kg of flour for 53 servings.</p>' +
        '<p>The total price is <em>servings wanted &times; the price per serving</em> already set in this recipe, so the ingredient costs do not need to be added up again.</p>' +
        '<p class="help-note">It also checks your stock. This is only a calculation: nothing is taken out of the inventory until you press Cook.</p>';
    titleRow.appendChild(helpBox);
    box.appendChild(titleRow);

    function closeHelp(){
        helpBox.hidden = true;
        helpButton.setAttribute('aria-expanded', 'false');
    }
    helpButton.addEventListener('click', function(event){
        event.stopPropagation();
        helpBox.hidden = !helpBox.hidden;
        helpButton.setAttribute('aria-expanded', helpBox.hidden ? 'false' : 'true');
    });
    helpBox.querySelector('.help-close').addEventListener('click', function(event){
        event.stopPropagation();
        closeHelp();
        helpButton.focus();
    });
    // Esc closes only this little window, not the recipe window behind it
    box.addEventListener('keydown', function(event){
        if(event.key == 'Escape' && !helpBox.hidden){
            event.preventDefault();
            event.stopPropagation();
            closeHelp();
            helpButton.focus();
        }
    });
    // a click anywhere else closes it
    document.getElementById('view-dialog').addEventListener('click', function(event){
        if(!helpBox.hidden && !helpBox.contains(event.target) && event.target !== helpButton){
            closeHelp();
        }
    });

    box.appendChild(h('p', 'result-line', 'This recipe makes ' + recipeServings + (recipeServings == 1 ? ' serving' : ' servings') + '.'));

    var row = h('div', 'inline-form');
    var label = h('label', '', 'Servings wanted');
    var input = document.createElement('input');
    input.type = 'text';
    input.id = 'order-servings';
    input.inputMode = 'numeric';
    input.placeholder = 'e.g. 53';
    input.autocomplete = 'off';
    label.appendChild(input);
    row.appendChild(label);
    box.appendChild(row);

    // everything under the box is redrawn each time the number changes
    var result = h('div', 'order-result');
    result.setAttribute('aria-live', 'polite');
    box.appendChild(result);

    function showResult(){
        result.innerHTML = '';
        var text = input.value.trim();
        if(text == ''){
            return;
        }
        if(!/^\d+$/.test(text) || parseInt(text, 10) < 1 || parseInt(text, 10) > 100000){
            result.appendChild(h('p', 'hint', 'Type a whole number of servings, like 5 or 53.'));
            return;
        }
        var wanted = parseInt(text, 10);
        var times = wanted / recipeServings;

        // the total of the whole order
        var stats = h('div', 'stat-boxes');
        stats.appendChild(statBox('Total price for ' + wanted + (wanted == 1 ? ' serving' : ' servings'), money(wanted * pricePerServing), true));
        stats.appendChild(statBox('Price per serving', money(pricePerServing), false));
        result.appendChild(stats);

        var timesText = (Math.round(times * 100) / 100) + (times == 1 ? ' time' : ' times');
        result.appendChild(h('p', 'hint', wanted + ' servings is the recipe ' + timesText + '. Amounts needed:'));

        var wrap = h('div', 'table-wrap');
        var table = h('table', 'mini-table');
        var head = document.createElement('thead');
        var headRow = document.createElement('tr');
        ['Ingredient', 'Needed', 'In stock'].forEach(function(title){
            headRow.appendChild(h('th', '', title));
        });
        head.appendChild(headRow);
        table.appendChild(head);

        var tbody = document.createElement('tbody');
        var allEnough = true;
        data.ingredients.forEach(function(line){
            var needed = Number(line.qty_needed) * times;
            var stock = Number(line.stock_qty);
            var enough = stock - needed >= -0.0005;
            if(!enough){
                allEnough = false;
            }
            var tr = document.createElement('tr');
            tr.appendChild(h('td', '', line.name));
            tr.appendChild(h('td', '', orderQuantityText(needed, line.base_unit)));
            var stockCell = document.createElement('td');
            stockCell.appendChild(h('span', enough ? 'chip chip-ok' : 'chip chip-short', enough ? line.stock_text : 'Need ' + orderQuantityText(needed - stock, line.base_unit) + ' more'));
            tr.appendChild(stockCell);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        wrap.appendChild(table);
        result.appendChild(wrap);

        result.appendChild(h('p', allEnough ? 'result-line order-ok' : 'result-line order-short', allEnough ? 'Your stock is enough for this order.' : 'Your stock is not enough for this order. Restock the items marked first.'));
    }

    input.addEventListener('input', showResult);

    // it goes right after the hint that is under the cook button (before the notes and the buttons)
    var cookInput = document.getElementById('cook-batches');
    var anchor = null;
    if(cookInput){
        var cookRow = cookInput.closest('.inline-form');
        anchor = cookRow ? cookRow.nextElementSibling : null;
        if(anchor && !anchor.classList.contains('hint')){
            anchor = cookRow;
        } else if(!anchor){
            anchor = cookRow;
        }
    }
    if(anchor){
        anchor.insertAdjacentElement('afterend', box);
    } else {
        var actions = body.querySelector('.dialog-actions');
        body.insertBefore(box, actions);
    }
}

// every time the recipe window is drawn (also after cooking or checking a price), the calculator is added
var drawViewWithoutCalculator = drawView;
drawView = function(data, note, price){
    drawViewWithoutCalculator(data, note, price);
    drawOrderCalculator(data);
};