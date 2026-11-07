// the left panel and the top bar, shared by the pages that have them
// needs client.js, auth.js and dashboard.js (in the api folder) loaded first

// where a person who is not logged in is sent
var LOGIN_PAGE = "../../index.html";

var sidebar = document.getElementById('sidebar');
var scrim = document.getElementById('scrim');
var settingsMenu = document.getElementById('settings-menu');
var settingsBtn = document.getElementById('settings-btn');
var notifMenu = document.getElementById('notif-menu');
var bellBtn = document.getElementById('bell-btn');

// the panel works in two ways:
// on a computer it is closed and opened (and remembered), on a phone it slides in over the page
var onComputer = window.matchMedia('(min-width: 861px)');
var htmlTag = document.documentElement;

function closeSettings(){
    settingsMenu.classList.remove('open');
    settingsBtn.setAttribute('aria-expanded', 'false');
}

function closeBell(){
    notifMenu.classList.remove('open');
    bellBtn.setAttribute('aria-expanded', 'false');
}

function setSidebar(open){
    sidebar.classList.toggle('open', open);
    scrim.classList.toggle('open', open);
}

function setCollapsed(closed){
    htmlTag.classList.toggle('sidebar-collapsed', closed);
    try{
        localStorage.setItem('costodian-sidebar', closed ? 'closed' : 'open');
    } catch(e){
        // private mode: it just is not remembered
    }
}

// open = true shows the panel, false hides it, no value flips it
function toggleSidebar(open){
    if(onComputer.matches){
        var wantOpen = (open === undefined) ? htmlTag.classList.contains('sidebar-collapsed') : open;
        setCollapsed(!wantOpen);
    } else {
        setSidebar((open === undefined) ? !sidebar.classList.contains('open') : open);
    }
}

onComputer.addEventListener('change', function(){
    setSidebar(false);
});

settingsBtn.addEventListener('click', function(event){
    event.stopPropagation();
    closeBell();
    var open = !settingsMenu.classList.contains('open');
    settingsMenu.classList.toggle('open', open);
    settingsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
});

bellBtn.addEventListener('click', function(event){
    event.stopPropagation();
    closeSettings();
    var open = !notifMenu.classList.contains('open');
    notifMenu.classList.toggle('open', open);
    bellBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
});

// a click anywhere else closes the small menus
document.addEventListener('click', function(event){
    if(!settingsMenu.contains(event.target)){
        closeSettings();
    }
    if(!notifMenu.contains(event.target)){
        closeBell();
    }
});

document.addEventListener('keydown', function(event){
    if(event.key == 'Escape'){
        closeSettings();
        closeBell();
        setSidebar(false);
    }
});

document.getElementById('menu-btn').addEventListener('click', function(){
    toggleSidebar();
});
document.getElementById('side-close').addEventListener('click', function(){
    toggleSidebar(false);
});
scrim.addEventListener('click', function(){
    setSidebar(false);
});

document.getElementById('logout-btn').addEventListener('click', function(){
    logoutUser().then(function(){
        window.location.href = LOGIN_PAGE;
    });
});

// "Maria Santos" -> "MS"
function initials(name){
    var parts = name.trim().split(/\s+/);
    var letters = parts[0].charAt(0);
    if(parts.length > 1){
        letters += parts[parts.length - 1].charAt(0);
    }
    return letters.toUpperCase();
}

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

function drawAlerts(alerts){
    var list = document.getElementById('notif-list');
    list.innerHTML = '';

    if(alerts.length == 0){
        var none = document.createElement('li');
        none.className = 'notif-empty';
        none.textContent = 'Everything looks good.';
        list.appendChild(none);
        return;
    }
    alerts.forEach(function(item){
        var li = document.createElement('li');
        li.textContent = item.name;
        var why = document.createElement('small');
        why.textContent = reasonText(item);
        li.appendChild(why);
        list.appendChild(li);
    });
    document.getElementById('notif-dot').hidden = false;
}

// who is logged in? nobody: go to the login page. Gives the user, or null when it is leaving
function startShell(){
    return getMe().then(function(reply){
        if(!reply.success){
            window.location.href = LOGIN_PAGE;
            return null;
        }

        var user = reply.data;
        document.getElementById('avatar').textContent = initials(user.full_name);
        document.getElementById('user-name').textContent = user.full_name;
        document.getElementById('user-role').textContent = user.role;

        // the bell: items that need attention
        getDashboardSummary().then(function(summary){
            if(summary.success){
                drawAlerts(summary.data.alerts);
            }
        });
        return user;
    });
}