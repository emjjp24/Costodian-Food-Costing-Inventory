// recipes page: the page elements and small helper functions (needs to load first)

var recipesBox = document.getElementById('recipes');
var pageMessage = document.getElementById('page-message');
var searchBox = document.getElementById('search');
var categoryFilter = document.getElementById('category-filter');
var viewDialog = document.getElementById('view-dialog');
var formDialog = document.getElementById('form-dialog');

// filled when the page starts
var recipeCategories = [];
var ingredientCategories = [];
var inventoryByName = {};

// the units, and which ones go together (grams with kilograms, and so on)
var ALL_UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'dozen'];
var UNIT_FAMILIES = {
    g: ['kg', 'g'],
    ml: ['L', 'ml'],
    pcs: ['pcs', 'dozen']
};

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

// fill a <select> with units, keeping the chosen one when it is still allowed
function setUnitOptions(select, baseUnit){
    var allowed = baseUnit ? UNIT_FAMILIES[baseUnit] : ALL_UNITS;
    var current = select.value;
    select.innerHTML = '';
    allowed.forEach(function(unit){
        var option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        select.appendChild(option);
    });
    if(allowed.indexOf(current) != -1){
        select.value = current;
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