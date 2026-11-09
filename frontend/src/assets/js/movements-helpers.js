// movements page: the page elements and small helper functions (needs to load first)

var movementRows = document.getElementById('movement-rows');
var pageMessage = document.getElementById('page-message');
var searchBox = document.getElementById('search');
var fromDate = document.getElementById('from-date');
var toDate = document.getElementById('to-date');
var typeFilter = document.getElementById('type-filter');
var itemFilter = document.getElementById('item-filter');
var pager = document.getElementById('pager');
var countText = document.getElementById('count-text');

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

// "2026-11-07 13:05:40" -> "Nov 7, 2026 1:05 PM"
function formatDateTime(text){
    if(!text){
        return '-';
    }
    var date = text.substring(0, 10).split('-');
    var time = text.substring(11, 16).split(':');
    var hour = parseInt(time[0], 10);
    var suffix = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if(hour == 0){
        hour = 12;
    }
    return MONTHS[parseInt(date[1], 10) - 1] + ' ' + parseInt(date[2], 10) + ', ' + date[0] + ' ' + hour + ':' + time[1] + ' ' + suffix;
}

// "2026-11-07 13:05:40" -> "Nov 7 · 1:05 PM" (for the phone list)
function formatShortDateTime(text){
    if(!text){
        return '-';
    }
    var date = text.substring(0, 10).split('-');
    var time = text.substring(11, 16).split(':');
    var hour = parseInt(time[0], 10);
    var suffix = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if(hour == 0){
        hour = 12;
    }
    return MONTHS[parseInt(date[1], 10) - 1] + ' ' + parseInt(date[2], 10) + ' · ' + hour + ':' + time[1] + ' ' + suffix;
}

function showMessage(text){
    pageMessage.textContent = text;
    pageMessage.className = 'alert alert-error';
    pageMessage.hidden = false;
}

function clearMessage(){
    pageMessage.hidden = true;
}

// the name, the tag color and the sign of each kind of movement
var MOVEMENT_KINDS = {
    stock_in: {label: 'Stock In', tag: 'tag tag-add', sign: '+'},
    stock_out: {label: 'Stock Out', tag: 'tag tag-out', sign: '-'},
    waste: {label: 'Waste', tag: 'tag tag-waste', sign: '-'},
    adjustment: {label: 'Adjustment', tag: 'tag tag-adjust', sign: ''}
};