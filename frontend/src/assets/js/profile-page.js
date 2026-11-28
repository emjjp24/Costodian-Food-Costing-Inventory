// my profile page: shows who is logged in, saves the details, changes the password, deletes the account
// needs shell.js and api/profile.js loaded first

var profileForm = document.getElementById('profile-form');
var passwordForm = document.getElementById('password-form');
var recoverySettingsForm = document.getElementById('recovery-settings-form');
var pageMessage = document.getElementById('page-message');
var profileUser = null;

// ---------- small helpers ----------

// these two skip an element that is not on the page, so an older profile.html never stops the script
function setValue(id, value){
    var box = document.getElementById(id);
    if(box){
        box.value = value;
    }
}

function setText(id, text){
    var node = document.getElementById(id);
    if(node){
        node.textContent = text;
    }
}

function setHidden(id, hidden){
    var node = document.getElementById(id);
    if(node){
        node.hidden = hidden;
    }
}

function getValue(id){
    var box = document.getElementById(id);
    return box ? box.value.trim() : '';
}

function makeChip(text){
    var chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = text;
    return chip;
}

function showMessage(text, ok){
    pageMessage.textContent = text;
    pageMessage.className = ok ? 'alert alert-ok' : 'alert alert-error';
    pageMessage.hidden = false;
}

function showFormError(id, text){
    var box = document.getElementById(id);
    box.textContent = text;
    box.hidden = (text == '');
}

// "2026-11-23 19:25:01" -> "November 23, 2026"
function niceDate(text){
    if(!text){
        return '';
    }
    var date = new Date(text.replace(' ', 'T'));
    if(isNaN(date.getTime())){
        return '';
    }
    return date.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});
}

// "2026-11-28 13:13:00" -> "November 28, 2026 at 1:13 PM"
function niceDateTime(text){
    if(!text){
        return '';
    }
    var date = new Date(text.replace(' ', 'T'));
    if(isNaN(date.getTime())){
        return '';
    }
    return date.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'}) +
        ' at ' + date.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'});
}

// ---------- the top of the page ----------

function drawProfile(user){
    profileUser = user;
    var isBusiness = user.account_type == 'business';

    document.getElementById('p-avatar').textContent = initials(user.full_name);
    document.getElementById('p-name').textContent = user.full_name;

    // a personal account has no role: only a small business shows Administrator or Staff
    var chips = document.getElementById('p-chips');
    chips.innerHTML = '';
    if(isBusiness){
        chips.appendChild(makeChip(user.role == 'admin' ? 'Administrator' : 'Staff'));
        chips.appendChild(makeChip(user.account_name));
    } else {
        chips.appendChild(makeChip('Personal account'));
    }

    var since = niceDate(user.created_at);
    document.getElementById('p-since').textContent = since ? 'Member since ' + since : '';

    var login = niceDateTime(user.last_login_at);
    setText('p-login', login ? 'Last signed in on ' + login : '');

    document.getElementById('p-fullname').value = user.full_name;
    document.getElementById('p-username').value = user.username;
    setValue('p-email', user.email || '');
    setValue('p-phone', user.phone || '');

    // only the administrator of a business changes the business name, address and tagline
    var isBusinessAdmin = isBusiness && user.role == 'admin';
    setHidden('business-field', !isBusinessAdmin);
    setHidden('address-field', !isBusinessAdmin);
    setHidden('tagline-field', !isBusinessAdmin);
    setValue('p-business', isBusiness ? user.account_name : '');
    setValue('p-address', isBusinessAdmin ? (user.account_address || '') : '');
    setValue('p-tagline', isBusinessAdmin ? (user.account_tagline || '') : '');

    setHidden('recovery-settings', user.role != 'admin');
    if(user.role == 'admin' && recoverySettingsForm){
        fillRecoveryQuestionSelect(recoverySettingsForm.elements['recovery_question']);
        recoverySettingsForm.elements['recovery_question'].value = user.recovery_question || '';
        recoverySettingsForm.elements['recovery_answer'].value = '';
        recoverySettingsForm.elements['current_password'].value = '';
    }

    drawDangerZone(user);

    // the top bar shows the new name at once
    document.getElementById('avatar').textContent = initials(user.full_name);
    document.getElementById('user-name').textContent = user.full_name;
}

// ---------- save the details ----------

profileForm.addEventListener('submit', function(event){
    event.preventDefault();
    pageMessage.hidden = true;
    showFormError('profile-error', '');

    var fullName = document.getElementById('p-fullname').value.trim();
    var username = document.getElementById('p-username').value.trim();
    var email = getValue('p-email');
    var phone = getValue('p-phone');
    var business = getValue('p-business');
    var needsBusiness = !!document.getElementById('business-field') && !document.getElementById('business-field').hidden;

    if(fullName == '' || username == ''){
        showFormError('profile-error', 'Please fill in your full name and username.');
        return;
    }
    if(!/^[A-Za-z0-9_.-]{3,50}$/.test(username)){
        showFormError('profile-error', 'The username must be 3 to 50 characters: letters, numbers, dot, dash or underscore.');
        return;
    }
    if(email != '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        showFormError('profile-error', 'Please enter a valid email address, or leave it empty.');
        return;
    }
    if(phone != '' && !/^[0-9+()\-. ]{7,30}$/.test(phone)){
        showFormError('profile-error', 'The contact number can only have digits, spaces, + ( ) - and a dot (7 to 30 characters).');
        return;
    }
    if(needsBusiness && business == ''){
        showFormError('profile-error', 'Please enter the name of your business.');
        return;
    }

    var data = {full_name: fullName, username: username, email: email, phone: phone};
    if(needsBusiness){
        data.business_name = business;
        data.business_address = getValue('p-address');
        data.business_tagline = getValue('p-tagline');
    }

    var button = document.getElementById('profile-save');
    button.disabled = true;
    saveMyProfile(data).then(function(reply){
        button.disabled = false;
        if(!reply.success){
            showFormError('profile-error', reply.message);
            return;
        }
        drawProfile(reply.data);
        showMessage(reply.message, true);
    });
});

recoverySettingsForm.addEventListener('submit', function(event){
    event.preventDefault();
    pageMessage.hidden = true;
    showFormError('recovery-settings-error', '');

    var question = recoverySettingsForm.elements['recovery_question'].value;
    var answer = recoverySettingsForm.elements['recovery_answer'].value.trim();
    var currentPassword = recoverySettingsForm.elements['current_password'].value;
    if(question == '' || answer == '' || currentPassword == ''){
        showFormError('recovery-settings-error', 'Please choose a recovery question, enter its answer and confirm your current password.');
        return;
    }
    if(answer.length > 72){
        showFormError('recovery-settings-error', 'The recovery answer must not be longer than 72 characters.');
        return;
    }
    if(currentPassword.length > 72){
        showFormError('recovery-settings-error', 'The current password is not valid.');
        return;
    }

    var button = document.getElementById('recovery-settings-save');
    button.disabled = true;
    saveRecoverySettings(question, answer, currentPassword).then(function(reply){
        button.disabled = false;
        if(!reply.success){
            showFormError('recovery-settings-error', reply.message);
            return;
        }
        drawProfile(reply.data);
        showMessage(reply.message, true);
    });
});

// ---------- change the password ----------

passwordForm.addEventListener('submit', function(event){
    event.preventDefault();
    pageMessage.hidden = true;
    showFormError('password-error', '');

    var current = document.getElementById('p-current').value;
    var newPass = document.getElementById('p-new').value;
    var confirm = document.getElementById('p-confirm').value;

    if(current == '' || newPass == '' || confirm == ''){
        showFormError('password-error', 'Please fill in all the password fields.');
        return;
    }
    if(newPass.length < 8 || newPass.length > 72){
        showFormError('password-error', 'The new password must be 8 to 72 characters long.');
        return;
    }
    if(newPass !== confirm){
        showFormError('password-error', 'The new password and the confirmation do not match.');
        return;
    }

    var button = document.getElementById('password-save');
    button.disabled = true;
    changeMyPassword(current, newPass, confirm).then(function(reply){
        button.disabled = false;
        if(!reply.success){
            showFormError('password-error', reply.message);
            return;
        }
        passwordForm.reset();
        showMessage(reply.message, true);
    });
});

// ---------- delete the account (the danger zone) ----------

var deleteDialog = document.getElementById('delete-dialog');
var deleteForm = document.getElementById('delete-form');

// what will be deleted depends on who is asking
function dangerText(user){
    if(user.role == 'admin' && user.account_type == 'business'){
        return 'Deleting the account removes this business for good: all recipes, ingredients, stock history and every staff login. This cannot be undone.';
    }
    if(user.role == 'admin'){
        return 'Deleting the account removes you and everything in it for good: your recipes, ingredients and stock history. This cannot be undone.';
    }
    return 'Deleting your login removes only you. The business, its recipes and its stock stay. Your lines in the stock history stay too, but without your name.';
}

function drawDangerZone(user){
    var text = dangerText(user);
    setText('danger-text', text);
    setText('delete-text', text);
    setText('delete-open', user.role == 'admin' ? 'Delete account' : 'Delete my login');
    setText('delete-title', user.role == 'admin' ? 'Delete your account?' : 'Delete your login?');
}

// the window is in newer versions of profile.html; without it the page still works
if(deleteForm && deleteDialog && document.getElementById('delete-open')){
    document.getElementById('delete-open').addEventListener('click', function(){
        showFormError('delete-error', '');
        deleteForm.reset();
        deleteDialog.showModal();
        document.getElementById('p-delete-password').focus();
    });

    function closeDeleteDialog(){
        deleteForm.reset();
        deleteDialog.close();
    }
    document.getElementById('delete-close').addEventListener('click', closeDeleteDialog);
    document.getElementById('delete-cancel').addEventListener('click', closeDeleteDialog);

    deleteForm.addEventListener('submit', function(event){
        event.preventDefault();
        showFormError('delete-error', '');

        var password = document.getElementById('p-delete-password').value;
        if(password == ''){
            showFormError('delete-error', 'Please enter your password to confirm.');
            return;
        }

        var button = document.getElementById('delete-confirm');
        button.disabled = true;
        deleteMyAccount(password).then(function(reply){
            button.disabled = false;
            if(!reply.success){
                showFormError('delete-error', reply.message);
                return;
            }
            // the account is gone: forget the staff link and go back to the login page
            forgetStaffAccess();
            window.location.href = LOGIN_PAGE;
        });
    });
}

// ---------- start ----------

startShell().then(function(user){
    if(user){
        drawProfile(user);
    }
});
