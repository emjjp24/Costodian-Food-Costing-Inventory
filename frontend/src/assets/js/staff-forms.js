// staff page: the windows to add or edit, set a password, confirm, and see the history

var staffForm = document.getElementById('staff-form');
var staffError = document.getElementById('staff-error');
var fName = document.getElementById('f-name');
var fUsername = document.getElementById('f-username');
var fPassword = document.getElementById('f-password');
var passwordField = document.getElementById('password-field');

var passForm = document.getElementById('pass-form');
var passError = document.getElementById('pass-error');
var pNew = document.getElementById('p-new');
var pConfirm = document.getElementById('p-confirm');

var confirmError = document.getElementById('confirm-error');
var confirmYes = document.getElementById('confirm-yes');

// null when adding, the staff member when editing
var editing = null;
var passMember = null;
var confirmAction = null;

// ---------- add or edit ----------

function openStaffForm(member){
    clearMessage();
    editing = member;
    staffError.hidden = true;

    document.getElementById('staff-title').textContent = member ? 'Edit staff' : 'Add staff';
    document.getElementById('staff-hint').textContent = member
        ? 'Change the name or the username. The password has its own button.'
        : 'They log in with this username and password and see your recipes and inventory.';
    document.getElementById('staff-save').textContent = member ? 'Save changes' : 'Add staff';

    // the password is only typed when the account is new
    passwordField.hidden = !!member;
    fName.value = member ? member.full_name : '';
    fUsername.value = member ? member.username : '';
    fPassword.value = '';

    formDialog.showModal();
    fName.focus();
}

// checks before asking the server (the server checks again)
function validateStaffForm(values, isNew){
    if(values.name == "" || values.username == ""){
        return 'Please fill in the full name and the username.';
    }
    if(values.name.length > 100){
        return 'The full name must not be longer than 100 characters.';
    }
    if(!/^[A-Za-z0-9_.-]{3,50}$/.test(values.username)){
        return 'The username must be 3 to 50 characters: letters, numbers, dot, dash or underscore.';
    }
    if(isNew){
        if(values.password == ""){
            return 'Please enter a password for the staff member.';
        }
        if(values.password.length < 6 || values.password.length > 72){
            return 'The password must be 6 to 72 characters long.';
        }
    }
    return "";
}

staffForm.addEventListener('submit', function(event){
    event.preventDefault();

    var values = {
        name: fName.value.trim(),
        username: fUsername.value.trim(),
        password: fPassword.value
    };
    var problem = validateStaffForm(values, !editing);
    if(problem != ""){
        showError(staffError, problem);
        return;
    }

    var send;
    if(editing){
        send = updateStaff(editing.id, {full_name: values.name, username: values.username});
    } else {
        send = createStaff({full_name: values.name, username: values.username, password: values.password});
    }

    var saveButton = document.getElementById('staff-save');
    saveButton.disabled = true;
    send.then(function(reply){
        saveButton.disabled = false;
        if(reply.success){
            formDialog.close();
            showMessage(reply.message, true);
            refreshStaff();
        } else {
            showError(staffError, reply.message);
        }
    });
});

document.getElementById('staff-cancel').addEventListener('click', function(){
    formDialog.close();
});
document.getElementById('staff-cancel-2').addEventListener('click', function(){
    formDialog.close();
});

// ---------- new password ----------

function openPassword(member){
    clearMessage();
    passMember = member;
    passError.hidden = true;
    document.getElementById('pass-hint').textContent = 'Set a new password for ' + member.full_name + ' (for example when it was forgotten).';
    pNew.value = '';
    pConfirm.value = '';
    passDialog.showModal();
    pNew.focus();
}

passForm.addEventListener('submit', function(event){
    event.preventDefault();

    if(pNew.value == ""){
        showError(passError, 'Please enter the new password.');
        return;
    }
    if(pNew.value.length < 6 || pNew.value.length > 72){
        showError(passError, 'The password must be 6 to 72 characters long.');
        return;
    }
    if(pNew.value !== pConfirm.value){
        showError(passError, 'The new password and the confirmation do not match.');
        return;
    }

    var saveButton = document.getElementById('pass-save');
    saveButton.disabled = true;
    changeStaffPassword(passMember.id, pNew.value, pConfirm.value).then(function(reply){
        saveButton.disabled = false;
        if(reply.success){
            passDialog.close();
            showMessage(reply.message, true);
        } else {
            showError(passError, reply.message);
        }
    });
});

document.getElementById('pass-cancel').addEventListener('click', function(){
    passDialog.close();
});
document.getElementById('pass-cancel-2').addEventListener('click', function(){
    passDialog.close();
});

// ---------- "are you sure?" for turning off and deleting ----------

function openConfirm(title, text, buttonText, danger, action){
    clearMessage();
    confirmError.hidden = true;
    confirmAction = action;
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-text').textContent = text;
    confirmYes.textContent = buttonText;
    confirmYes.className = danger ? 'btn btn-danger' : 'btn btn-fill';
    confirmDialog.showModal();
}

function askToggle(member){
    if(member.is_active){
        openConfirm('Turn off ' + member.full_name + '?',
            'They will be logged out and cannot log in until you turn the account on again. Their history stays.',
            'Turn off', false, function(){
                return setStaffActive(member.id, false);
            });
    } else {
        // turning on is harmless, no question needed
        setStaffActive(member.id, true).then(function(reply){
            showMessage(reply.message, reply.success);
            refreshStaff();
        });
    }
}

function askDelete(member){
    openConfirm('Delete ' + member.full_name + '?',
        'The account is deleted for good. Their lines in the stock history stay, but without their name. To keep the name, turn the account off instead.',
        'Delete', true, function(){
            return deleteStaff(member.id);
        });
}

confirmYes.addEventListener('click', function(){
    confirmYes.disabled = true;
    confirmAction().then(function(reply){
        confirmYes.disabled = false;
        if(reply.success){
            confirmDialog.close();
            showMessage(reply.message, true);
            refreshStaff();
        } else {
            showError(confirmError, reply.message);
        }
    });
});

document.getElementById('confirm-no').addEventListener('click', function(){
    confirmDialog.close();
});

// ---------- history ----------

function openActivity(member){
    clearMessage();
    document.getElementById('activity-title').textContent = member.full_name;
    document.getElementById('activity-sub').textContent = '';
    document.getElementById('activity-body').innerHTML = '';
    document.getElementById('activity-body').appendChild(h('p', 'empty-note', 'Loading...'));
    activityDialog.showModal();

    getStaffMember(member.id).then(function(reply){
        if(!reply.success){
            document.getElementById('activity-body').innerHTML = '';
            document.getElementById('activity-body').appendChild(h('p', 'empty-note', reply.message));
            return;
        }
        drawActivity(reply.data);
    });
}

document.getElementById('activity-close').addEventListener('click', function(){
    activityDialog.close();
});