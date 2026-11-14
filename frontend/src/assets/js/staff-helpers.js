// staff page: the page elements and small helper functions (needs to load first)

var staffRows = document.getElementById('staff-rows');
var pageMessage = document.getElementById('page-message');
var searchBox = document.getElementById('search');
var addButton = document.getElementById('add-staff');
var formDialog = document.getElementById('staff-dialog');
var passDialog = document.getElementById('pass-dialog');
var confirmDialog = document.getElementById('confirm-dialog');
var activityDialog = document.getElementById('activity-dialog');

// filled when the page starts
var currentUser = null;
var staffInfo = null;      // the whole answer of staff/list
var staffMembers = [];

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

// show an error inside a window
function showError(box, text){
    box.textContent = text;
    box.hidden = false;
}

// the colored tag of a stock movement
var MOVE_TYPES = {
    stock_in: {label: 'Stock In', tag: 'tag tag-add', sign: '+'},
    stock_out: {label: 'Stock Out', tag: 'tag tag-out', sign: '-'},
    waste: {label: 'Waste', tag: 'tag tag-waste', sign: '-'},
    adjustment: {label: 'Adjustment', tag: 'tag tag-adjust', sign: ''}
};

// find a staff member in the list we already have
function memberById(id){
    for(var i = 0; i < staffMembers.length; i++){
        if(staffMembers[i].id == id){
            return staffMembers[i];
        }
    }
    return null;
}