// dashboard: the page elements and small helper functions (needs to load first)
// loaded by pages/dashboard.html, after client.js, auth.js and dashboard.js (in the api folder)

// where a person who is not logged in is sent
var LOGIN_PAGE = "../../index.html";

var sidebar = document.getElementById('sidebar');
var scrim = document.getElementById('scrim');
var settingsMenu = document.getElementById('settings-menu');
var settingsBtn = document.getElementById('settings-btn');
var notifMenu = document.getElementById('notif-menu');
var bellBtn = document.getElementById('bell-btn');
var searchBox = document.getElementById('search');
var changesBody = document.getElementById('changes');
var pageMessage = document.getElementById('page-message');

// ---------- small helpers ----------

// show a message in the alert box (textContent keeps typed characters from running as HTML)
function showMessage(text, ok){
    pageMessage.textContent = text;
    pageMessage.className = ok ? 'alert alert-ok' : 'alert alert-error';
    pageMessage.hidden = false;
}

// "Maria Santos" -> "MS"
function initials(name){
    var parts = name.trim().split(/\s+/);
    var letters = parts[0].charAt(0);
    if(parts.length > 1){
        letters += parts[parts.length - 1].charAt(0);
    }
    return letters.toUpperCase();
}

// "2026-11-04 14:30:00" -> "3 days ago"
function timeAgo(text){
    var then = new Date(text.replace(' ', 'T'));
    if(isNaN(then.getTime())){
        return text;
    }
    var minutes = Math.floor((new Date() - then) / 60000);
    if(minutes < 1){
        return 'just now';
    }
    if(minutes < 60){
        return minutes + (minutes == 1 ? ' minute ago' : ' minutes ago');
    }
    var hours = Math.floor(minutes / 60);
    if(hours < 24){
        return hours + (hours == 1 ? ' hour ago' : ' hours ago');
    }
    var days = Math.floor(hours / 24);
    return days + (days == 1 ? ' day ago' : ' days ago');
}

// the colored tag for each kind of change
var TAGS = {
    stock_in: ['Addition', 'tag-add'],
    stock_out: ['Deducted', 'tag-out'],
    waste: ['Waste', 'tag-waste'],
    adjustment: ['Adjusted', 'tag-adjust']
};

// why an item is in the "needs attention" list
function reasonText(item){
    if(item.status.expired){
        return 'Expired';
    }
    if(item.status.out){
        return 'Out of stock';
    }
    if(item.status.low){
        return 'Low stock: ' + item.stock_text + ' left';
    }
    if(item.status.expiring){
        if(item.days_to_expiry == 0){
            return 'Expires today';
        }
        return 'Expires in ' + item.days_to_expiry + (item.days_to_expiry == 1 ? ' day' : ' days');
    }
    return '';
}
