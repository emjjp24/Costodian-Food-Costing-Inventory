// dashboard: the menus, buttons, search box and the start of the page (needs to load last)
// loaded by pages/dashboard.html, after client.js, auth.js and dashboard.js (in the api folder)

// ---------- panels and buttons ----------

function closeSettings(){
    settingsMenu.classList.remove('open');
    settingsBtn.setAttribute('aria-expanded', 'false');
}

function closeBell(){
    notifMenu.classList.remove('open');
    bellBtn.setAttribute('aria-expanded', 'false');
}

// the panel works in two ways:
// on a computer it is closed and opened (and remembered), on a phone it slides in over the page
var onComputer = window.matchMedia('(min-width: 861px)');
var htmlTag = document.documentElement;

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

// going from phone size to computer size closes the sliding panel
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

// the button in the top bar opens and closes the panel
document.getElementById('menu-btn').addEventListener('click', function(){
    toggleSidebar();
});
// the arrows button inside the panel closes it
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

// the search box filters the recent changes that are on the page
searchBox.addEventListener('input', function(){
    var words = searchBox.value.trim().toLowerCase();
    var rows = changesBody.querySelectorAll('tr');
    var shown = 0;
    var emptyRow = null;

    rows.forEach(function(row){
        if(row.querySelector('.empty')){
            emptyRow = row;
            return;
        }
        var match = row.textContent.toLowerCase().indexOf(words) != -1;
        row.hidden = !match;
        if(match){
            shown++;
        }
    });

    // no row left: show a note, the first time it is added
    var note = document.getElementById('no-match');
    if(shown == 0 && rows.length > 0 && !emptyRow){
        if(!note){
            note = document.createElement('tr');
            note.id = 'no-match';
            var cell = document.createElement('td');
            cell.className = 'empty';
            cell.colSpan = 4;
            cell.textContent = 'Nothing matches your search.';
            note.appendChild(cell);
            changesBody.appendChild(note);
        }
        note.hidden = false;
    } else if(note){
        note.hidden = true;
    }
});

// ---------- start ----------

// 1. who is logged in? nobody: go to the login page
getMe().then(function(reply){
    if(!reply.success){
        window.location.href = LOGIN_PAGE;
        return;
    }

    var user = reply.data;
    document.getElementById('avatar').textContent = initials(user.full_name);
    document.getElementById('user-name').textContent = user.full_name;
    document.getElementById('user-role').textContent = user.role;
    document.getElementById('welcome').textContent = 'Welcome back, ' + user.full_name.split(' ')[0] + '. Here is what is happening in your kitchen.';

    // 2. the numbers and the recent changes
    getDashboardSummary().then(function(summary){
        if(summary.success){
            drawSummary(summary.data);
        } else {
            showMessage(summary.message, false);
            changesBody.innerHTML = '';
        }
    });
});