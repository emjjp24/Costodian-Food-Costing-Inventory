// the bell and the profile in the top bar
//  1. a personal account shows no role ("Admin") under the name: roles are only for small business accounts
//  2. the bell: every item can be clicked (it opens that ingredient in the Inventory), "Mark all as read" at the top
//     marks everything as read, and the red dot only shows while something is unread
// load it as the LAST script of every page that has the bell (after shell.js or dashboard-page.js)

var READ_ALERTS_KEY = 'costodian-read-alerts-';
var ACCOUNT_TYPE_KEY = 'costodian-account-type';

// the little style file for this (assets/css/notif-center.css)
(function(){
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../assets/css/notif-center.css';
    document.head.appendChild(link);

    // the browser remembers the account type, so "Admin" is never drawn for a personal account
    try {
        if(localStorage.getItem(ACCOUNT_TYPE_KEY) == 'personal'){
            document.documentElement.classList.add('personal-account');
        }
    } catch(e){
        // private mode: it is hidden when the server answers
    }
})();

// who is logged in (asked once for this file)
var notifUserRequest = getMe().then(function(reply){
    if(!reply.success){
        return null;
    }
    var isPersonal = reply.data.account_type == 'personal';
    document.documentElement.classList.toggle('personal-account', isPersonal);
    try {
        localStorage.setItem(ACCOUNT_TYPE_KEY, reply.data.account_type);
    } catch(e){
        // nothing to do
    }
    return reply.data;
});

// ---------- what was marked as read (kept in this browser, for each person) ----------

function loadReadAlerts(userId){
    try {
        var saved = JSON.parse(localStorage.getItem(READ_ALERTS_KEY + userId));
        return saved && typeof saved == 'object' ? saved : {};
    } catch(e){
        return {};
    }
}

function saveReadAlerts(userId, read){
    try {
        localStorage.setItem(READ_ALERTS_KEY + userId, JSON.stringify(read));
    } catch(e){
        // private mode: it is only kept until the page is closed
    }
}

// the same ingredient with another problem (for example it was low, now it is expired) counts as new
function alertKey(item){
    return item.id + ':' + reasonText(item);
}

// open the ingredient: in the Inventory page it opens the window, from another page it goes there
function openAlertItem(id){
    closeBell();
    if(typeof window.navigateApp == 'function'){
        window.navigateApp('inventory.html?open=' + id);
    } else if(typeof openDetails == 'function'){
        openDetails(id);
    } else {
        window.location.href = 'inventory.html?open=' + id;
    }
}

// ---------- the list ----------

// makes an element with a class and a text (the dashboard has no h() helper, so this file has its own)
function notifEl(tag, className, text){
    var node = document.createElement(tag);
    if(className){
        node.className = className;
    }
    if(text !== undefined && text !== null){
        node.textContent = text;
    }
    return node;
}

var shownAlerts = [];

function renderAlerts(alerts, userId){
    shownAlerts = alerts;
    var list = document.getElementById('notif-list');
    var menu = document.getElementById('notif-menu');
    list.innerHTML = '';

    var oldTools = menu.querySelector('.notif-tools');
    if(oldTools){
        oldTools.remove();
    }

    var read = loadReadAlerts(userId);
    var items = alerts.map(function(item){
        return {item: item, key: alertKey(item)};
    });

    // forget the marks of alerts that are gone
    var stillThere = {};
    items.forEach(function(entry){
        if(read[entry.key]){
            stillThere[entry.key] = true;
        }
    });
    if(Object.keys(stillThere).length != Object.keys(read).length){
        read = stillThere;
        saveReadAlerts(userId, read);
    }

    var unread = items.filter(function(entry){ return !read[entry.key]; });
    var done = items.filter(function(entry){ return read[entry.key]; });

    // the dot is only for unread alerts
    document.getElementById('notif-dot').hidden = unread.length == 0;

    var tools = notifEl('div', 'notif-tools');
    var allBtn = notifEl('button', 'notif-link', 'Mark all as read');
    allBtn.type = 'button';
    allBtn.disabled = unread.length == 0;
    allBtn.addEventListener('click', function(event){
        event.stopPropagation();
        items.forEach(function(entry){
            read[entry.key] = true;
        });
        saveReadAlerts(userId, read);
        renderAlerts(alerts, userId);
    });
    tools.appendChild(allBtn);
    menu.insertBefore(tools, list);

    if(items.length == 0){
        var none = document.createElement('li');
        none.className = 'notif-empty';
        none.textContent = 'Everything looks good.';
        list.appendChild(none);
        return;
    }

    function addRow(entry, isRead){
        var li = document.createElement('li');
        li.className = isRead ? 'notif-item is-read' : 'notif-item';
        li.tabIndex = 0;
        li.setAttribute('role', 'link');
        li.setAttribute('aria-label', 'Open ' + entry.item.name);

        var text = notifEl('div', 'notif-text');
        text.appendChild(notifEl('span', 'notif-name', entry.item.name));
        text.appendChild(notifEl('small', '', reasonText(entry.item)));
        li.appendChild(text);

        function go(){
            openAlertItem(entry.item.id);
        }
        li.addEventListener('click', go);
        li.addEventListener('keydown', function(event){
            if(event.target === li && (event.key == 'Enter' || event.key == ' ')){
                event.preventDefault();
                go();
            }
        });
        list.appendChild(li);
    }

    unread.forEach(function(entry){ addRow(entry, false); });
    done.forEach(function(entry){ addRow(entry, true); });
}

// the pages draw the bell with drawAlerts: it is replaced here
drawAlerts = function(alerts){
    notifUserRequest.then(function(user){
        if(user){
            renderAlerts(alerts, user.id);
        }
    });
};

// ---------- the Inventory page: open the ingredient that was clicked in the bell (inventory.html?open=5) ----------

(function(){
    var match = /[?&]open=(\d+)/.exec(window.location.search);
    if(!match || typeof openDetails != 'function'){
        return;
    }
    var id = parseInt(match[1], 10);
    try {
        window.history.replaceState(null, '', window.location.pathname);
    } catch(e){
        // nothing to do
    }
    // the window needs the categories, so it waits for them (but not for long)
    var tries = 0;
    var wait = setInterval(function(){
        tries++;
        if((typeof ingredientCategories != 'undefined' && ingredientCategories.length > 0) || tries > 20){
            clearInterval(wait);
            openDetails(id);
        }
    }, 100);
})();

// ---------- keeping the bell up to date on every page and every open browser tab ----------

// asks the server again and draws the list
function refreshAlerts(){
    getDashboardSummary().then(function(summary){
        if(summary.success){
            drawAlerts(summary.data.alerts);
        }
    });
}

// "Mark all as read" in one browser tab shows in the other open tabs at once
window.addEventListener('storage', function(event){
    if(event.key && event.key.indexOf(READ_ALERTS_KEY) == 0){
        notifUserRequest.then(function(user){
            if(user){
                renderAlerts(shownAlerts, user.id);
            }
        });
    }
});

// when the stock changes (restock, use, waste, cook, a new or deleted ingredient or recipe) the bell is updated right away
var apiPostWithoutBell = apiPost;
apiPost = function(route, data){
    return apiPostWithoutBell(route, data).then(function(reply){
        if(reply.success && /^(stock|inventory|recipes)\//.test(route)){
            refreshAlerts();
            if(window.parent !== window){
                window.parent.postMessage({type: 'costodian-refresh-alerts'}, window.location.origin);
            }
        }
        return reply;
    });
};

// and it is checked again when coming back to the tab, and once a minute
if(!document.documentElement.classList.contains('app-embedded')){
    document.addEventListener('visibilitychange', function(){
        if(!document.hidden){
            refreshAlerts();
        }
    });
    setInterval(function(){
        if(!document.hidden){
            refreshAlerts();
        }
    }, 60000);
}
