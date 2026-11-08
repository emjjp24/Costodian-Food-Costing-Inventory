// inventory page: the page elements and small helper functions (needs to load first)

var inventoryRows = document.getElementById('inventory-rows');
var pageMessage = document.getElementById('page-message');
var searchBox = document.getElementById('search');
var statusFilter = document.getElementById('status-filter');
var categoryFilter = document.getElementById('category-filter');
var stockDialog = document.getElementById('stock-dialog');
var detailDialog = document.getElementById('detail-dialog');

// filled when the page starts
var ingredientCategories = [];
var currentUser = null;

// which units go together (grams with kilograms, and so on)
var ALL_UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'dozen'];
var UNIT_FAMILIES = {
    g: ['kg', 'g'],
    ml: ['L', 'ml'],
    pcs: ['pcs', 'dozen']
};

var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// makes an element with a class and a text (textContent keeps typed characters from running as HTML)
function h(tag, className, text){
    var node = document.createElement(tag);
    if(className){
        node.className = className;
    }
    if(text !== undefined && text !== null){
        node.textContent = text;
    }
    return node;
}

// 18.5 -> "₱18.50"
function money(amount){
    return '₱' + Number(amount).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

// "2026-11-07" -> "Nov 7, 2026"
function formatDate(text){
    if(!text){
        return '-';
    }
    var parts = text.substring(0, 10).split('-');
    return MONTHS[parseInt(parts[1], 10) - 1] + ' ' + parseInt(parts[2], 10) + ', ' + parts[0];
}

// "2026-11-07 13:05:40" -> "Nov 7, 2026 1:05 PM"
function formatDateTime(text){
    if(!text){
        return '-';
    }
    var time = text.substring(11, 16).split(':');
    var hour = parseInt(time[0], 10);
    var suffix = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if(hour == 0){
        hour = 12;
    }
    return formatDate(text) + ' ' + hour + ':' + time[1] + ' ' + suffix;
}

// show a message in the alert box at the top of the page
function showMessage(text, ok){
    pageMessage.textContent = text;
    pageMessage.className = ok ? 'alert alert-ok' : 'alert alert-error';
    pageMessage.hidden = false;
}

function clearMessage(){
    pageMessage.hidden = true;
}

// "1.5 kg" -> {amount: "1.5", unit: "kg"}
function splitQuantity(text){
    var parts = text.trim().split(' ');
    var unit = parts.pop();
    return {amount: parts.join(' '), unit: unit};
}

// fill a <select> with the units that fit the ingredient
function setUnitOptions(select, baseUnit, chosen){
    var allowed = baseUnit ? UNIT_FAMILIES[baseUnit] : ALL_UNITS;
    select.innerHTML = '';
    allowed.forEach(function(unit){
        var option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        select.appendChild(option);
    });
    if(chosen && allowed.indexOf(chosen) != -1){
        select.value = chosen;
    }
}

// fill a <select> with categories (first option is the empty choice)
function fillCategorySelect(select, list, emptyText){
    select.innerHTML = '';
    var none = document.createElement('option');
    none.value = '';
    none.textContent = emptyText;
    select.appendChild(none);
    list.forEach(function(category){
        var option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

// the colored tags of an ingredient (can be more than one)
function statusTags(status){
    var tags = [];
    if(status.out){
        tags.push(['Out of stock', 'tag tag-waste']);
    }
    if(status.low){
        tags.push(['Low stock', 'tag tag-out']);
    }
    if(status.expired){
        tags.push(['Expired', 'tag tag-waste']);
    }
    if(status.expiring){
        tags.push(['Expiring soon', 'tag tag-out']);
    }
    if(tags.length == 0){
        tags.push(['In stock', 'tag tag-add']);
    }
    return tags;
}