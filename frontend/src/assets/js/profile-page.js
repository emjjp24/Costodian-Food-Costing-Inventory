// my profile page: shows who is logged in, saves the name and username, changes the password
// needs shell.js and api/profile.js loaded first

var profileForm = document.getElementById('profile-form');
var passwordForm = document.getElementById('password-form');
var pageMessage = document.getElementById('page-message');
var profileUser = null;

// ---------- small helpers ----------

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

    document.getElementById('p-fullname').value = user.full_name;
    document.getElementById('p-username').value = user.username;

    // only the administrator of a business changes the business name
    var businessField = document.getElementById('business-field');
    businessField.hidden = !(isBusiness && user.role == 'admin');
    document.getElementById('p-business').value = isBusiness ? user.account_name : '';

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
    var business = document.getElementById('p-business').value.trim();
    var needsBusiness = !document.getElementById('business-field').hidden;

    if(fullName == '' || username == ''){
        showFormError('profile-error', 'Please fill in your full name and username.');
        return;
    }
    if(!/^[A-Za-z0-9_.-]{3,50}$/.test(username)){
        showFormError('profile-error', 'The username must be 3 to 50 characters: letters, numbers, dot, dash or underscore.');
        return;
    }
    if(needsBusiness && business == ''){
        showFormError('profile-error', 'Please enter the name of your business.');
        return;
    }

    var data = {full_name: fullName, username: username};
    if(needsBusiness){
        data.business_name = business;
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
    if(newPass.length < 6 || newPass.length > 72){
        showFormError('password-error', 'The new password must be 6 to 72 characters long.');
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

// ---------- start ----------

startShell().then(function(user){
    if(user){
        drawProfile(user);
    }
});
