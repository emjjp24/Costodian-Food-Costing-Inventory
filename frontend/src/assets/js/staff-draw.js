// staff page: draws the number cards, the table and the history window

function setStat(id, text){
    document.getElementById(id).textContent = text;
}

// the three cards at the top
function drawSummary(info){
    var active = 0;
    info.members.forEach(function(member){
        if(member.is_active){
            active++;
        }
    });
    setStat('stat-total', info.staff_count + ' / ' + info.max_staff);
    setStat('stat-active', active);
    setStat('stat-off', info.staff_count - active);
}

// a table cell that also knows its column name (the phone layout shows it)
function cell(label, className){
    var td = document.createElement('td');
    td.setAttribute('data-label', label);
    if(className){
        td.className = className;
    }
    return td;
}

// a small button in a row
function rowButton(text, onClick, extraClass){
    var button = h('button', 'btn btn-sm ' + (extraClass || 'btn-line'), text);
    button.type = 'button';
    button.addEventListener('click', function(event){
        event.stopPropagation();
        onClick();
    });
    return button;
}

// the list can be filtered by what is typed in the search box (name or username)
function visibleMembers(){
    var word = searchBox.value.trim().toLowerCase();
    if(word == ""){
        return staffMembers;
    }
    return staffMembers.filter(function(member){
        return member.full_name.toLowerCase().indexOf(word) != -1 || member.username.toLowerCase().indexOf(word) != -1;
    });
}

function drawTable(){
    staffRows.innerHTML = '';
    var list = visibleMembers();

    if(list.length == 0){
        var row = document.createElement('tr');
        var td = h('td', 'empty');
        td.colSpan = 5;
        if(staffMembers.length > 0){
            td.textContent = 'No staff member matches your search.';
        } else if(staffInfo && staffInfo.can_add_staff){
            td.textContent = 'You have no staff yet. Press "+ Add Staff" to give a helper their own login.';
        } else {
            td.textContent = 'This account has only one user.';
        }
        row.appendChild(td);
        staffRows.appendChild(row);
        return;
    }

    list.forEach(function(member){
        var row = document.createElement('tr');
        row.className = 'staff-row';
        row.tabIndex = 0;
        row.addEventListener('click', function(){
            openActivity(member);
        });
        row.addEventListener('keydown', function(event){
            if(event.key == 'Enter'){
                openActivity(member);
            }
        });

        var name = cell('Staff', 'item');
        name.appendChild(h('strong', '', member.full_name));
        name.appendChild(h('small', '', '@' + member.username));
        row.appendChild(name);

        var state = cell('Login');
        state.appendChild(h('span', member.is_active ? 'tag tag-add' : 'tag tag-waste', member.is_active ? 'Active' : 'Turned off'));
        row.appendChild(state);

        row.appendChild(cell('Last login', 'when')).textContent = member.last_login_at ? formatDateTime(member.last_login_at) : 'Never';
        row.appendChild(cell('Last activity', 'when')).textContent = member.last_activity_at ? formatDateTime(member.last_activity_at) : '-';

        var actions = cell('', 'row-actions');
        actions.appendChild(rowButton('Edit', function(){
            openStaffForm(member);
        }));
        actions.appendChild(rowButton('Password', function(){
            openPassword(member);
        }));
        actions.appendChild(rowButton(member.is_active ? 'Turn off' : 'Turn on', function(){
            askToggle(member);
        }));
        actions.appendChild(rowButton('Delete', function(){
            askDelete(member);
        }, 'btn-danger'));
        row.appendChild(actions);

        staffRows.appendChild(row);
    });
}

// the note under the title: why nobody can be added
function drawNotice(){
    var note = document.getElementById('staff-note');
    if(!staffInfo.can_add_staff){
        note.textContent = staffInfo.note;
        note.hidden = false;
    } else if(staffInfo.staff_count >= staffInfo.max_staff){
        note.textContent = 'You reached the limit of ' + staffInfo.max_staff + ' staff accounts. Delete one to add another.';
        note.hidden = false;
    } else {
        note.hidden = true;
    }
    addButton.disabled = !staffInfo.can_add_staff || staffInfo.staff_count >= staffInfo.max_staff;
}

// the history window: the last things this person did
function drawActivity(member){
    document.getElementById('activity-title').textContent = member.full_name;
    var sub = document.getElementById('activity-sub');
    sub.textContent = '@' + member.username + ' - last login: ' + (member.last_login_at ? formatDateTime(member.last_login_at) : 'never');

    var body = document.getElementById('activity-body');
    body.innerHTML = '';

    if(member.recent_activity.length == 0){
        body.appendChild(h('p', 'empty-note', 'Nothing done yet. Their restocks, uses and waste will show here.'));
        return;
    }

    var wrap = h('div', 'table-wrap');
    var table = h('table', 'table mini-table');
    var head = document.createElement('tr');
    ['When', 'Type', 'Ingredient', 'Amount', 'Note'].forEach(function(title){
        head.appendChild(h('th', '', title));
    });
    var thead = document.createElement('thead');
    thead.appendChild(head);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    member.recent_activity.forEach(function(item){
        var type = MOVE_TYPES[item.type] || {label: item.type, tag: 'tag tag-adjust', sign: ''};
        var tr = document.createElement('tr');
        tr.appendChild(h('td', 'when', formatDateTime(item.created_at)));
        var tagCell = document.createElement('td');
        tagCell.appendChild(h('span', type.tag, type.label));
        tr.appendChild(tagCell);
        tr.appendChild(h('td', '', item.ingredient_name));
        tr.appendChild(h('td', '', type.sign + item.qty_text));
        tr.appendChild(h('td', 'when', item.reference || '-'));
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    body.appendChild(wrap);
}