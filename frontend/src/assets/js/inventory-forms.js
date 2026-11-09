// inventory page: the window to restock, use or waste an ingredient, and saving the details

var stockForm = document.getElementById('stock-form');
var stockError = document.getElementById('stock-error');
var stockQty = document.getElementById('s-qty');
var stockUnit = document.getElementById('s-unit');
var stockPrice = document.getElementById('s-price');
var stockExpiry = document.getElementById('s-expiry');
var stockNote = document.getElementById('s-note');

var stockKind = 'restock';
var stockItem = null;

// kind is restock, use or waste
function openStock(kind, item){
    clearMessage();
    stockKind = kind;
    stockItem = item;

    var titles = {restock: 'Restock', use: 'Use', waste: 'Record waste'};
    document.getElementById('stock-title').textContent = titles[kind] + ': ' + item.name;
    document.getElementById('stock-hint').textContent = 'In stock now: ' + item.stock_text;

    // the price and the expiry date are only for new stock you bought
    document.getElementById('restock-fields').hidden = (kind != 'restock');
    document.getElementById('s-note-label').textContent = kind == 'waste' ? 'Reason (optional)' : 'Note (optional)';

    stockQty.value = '';
    stockPrice.value = '';
    stockExpiry.value = '';
    stockNote.value = '';
    stockError.hidden = true;
    setUnitOptions(stockUnit, item.base_unit, item.base_unit);

    stockDialog.showModal();
    stockQty.focus();
}

stockForm.addEventListener('submit', function(event){
    event.preventDefault();

    var values = {
        qty: stockQty.value.trim(),
        price: stockPrice.value.trim(),
        note: stockNote.value.trim()
    };
    var problem = validateStockForm(stockKind, values);
    if(problem != ""){
        stockError.textContent = problem;
        stockError.hidden = false;
        return;
    }

    var data = {ingredient_id: stockItem.id, qty: values.qty, unit: stockUnit.value};
    var send;
    if(stockKind == 'restock'){
        data.price_paid = values.price;
        data.expiry_date = stockExpiry.value;
        data.note = values.note;
        send = restockIngredient;
    } else if(stockKind == 'use'){
        data.note = values.note;
        send = useIngredient;
    } else {
        data.reason = values.note;
        send = wasteIngredient;
    }

    var saveButton = document.getElementById('stock-save');
    saveButton.disabled = true;
    send(data).then(function(reply){
        saveButton.disabled = false;
        if(reply.success){
            stockDialog.close();
            showMessage(reply.message, true);
            refreshInventory();
        } else {
            stockError.textContent = reply.message;
            stockError.hidden = false;
        }
    });
});

document.getElementById('stock-cancel').addEventListener('click', function(){
    stockDialog.close();
});
document.getElementById('stock-cancel-2').addEventListener('click', function(){
    stockDialog.close();
});

// the category, reorder level and expiry date in the details window
function saveDetails(item, values, errorBox, button){
    errorBox.hidden = true;
    var problem = validateDetailsForm(values);
    if(problem != ""){
        errorBox.textContent = problem;
        errorBox.hidden = false;
        return;
    }

    var data = {
        category_id: values.category,
        reorder_level: values.reorder,
        expiry_date: values.expiry
    };
    if(values.reorder != ""){
        data.reorder_unit = values.reorder_unit;
    }

    button.disabled = true;
    updateIngredient(item.id, data).then(function(reply){
        button.disabled = false;
        if(reply.success){
            detailDialog.close();
            showMessage(reply.message, true);
            refreshInventory();
        } else {
            errorBox.textContent = reply.message;
            errorBox.hidden = false;
        }
    });
}  