// calls to the backend for the account (needs client.js loaded first)

// the browser remembers if this person manages staff, so the "Staff" link in the left panel can be drawn
// in the very first picture of every page (it never blinks). The server still has the last word:
// staff-link.js checks it on every page.
var STAFF_LINK_KEY = 'costodian-can-manage-staff';

var RECOVERY_QUESTIONS = {
    first_pet: 'What was the name of your first pet?',
    first_school: 'What was the name of your first school?',
    birth_city: 'In which city were you born?',
    childhood_nickname: 'What was your childhood nickname?',
    favorite_teacher: 'What was the surname of a favorite teacher?'
};

function fillRecoveryQuestionSelect(select){
    while(select.firstChild){
        select.removeChild(select.firstChild);
    }
    var empty = document.createElement('option');
    empty.value = '';
    empty.textContent = 'Choose a question';
    select.appendChild(empty);
    Object.keys(RECOVERY_QUESTIONS).forEach(function(key){
        var option = document.createElement('option');
        option.value = key;
        option.textContent = RECOVERY_QUESTIONS[key];
        select.appendChild(option);
    });
}

function verifyRecoveryAnswer(data){
    return apiPost('auth/recovery/verify', data);
}

function resetPasswordWithRecovery(data){
    return apiPost('auth/recovery/reset', data);
}

function cancelRecoveryVerification(){
    return apiPost('auth/recovery/cancel', {});
}

function rememberStaffAccess(allowed){
    try {
        localStorage.setItem(STAFF_LINK_KEY, allowed ? '1' : '0');
    } catch(e){
        // the browser does not allow it: the link is just shown after the server answers
    }
}

function forgetStaffAccess(){
    try {
        localStorage.removeItem(STAFF_LINK_KEY);
    } catch(e){
        // nothing to do
    }
}

// true only for the administrator of a business account (the backend sends permissions.manage_staff)
function canManageStaff(reply){
    return !!(reply && reply.success && reply.data && reply.data.permissions && reply.data.permissions.manage_staff);
}

function loginUser(data){
    return apiPost('auth/login', data).then(function(reply){
        if(reply.success){
            rememberStaffAccess(canManageStaff(reply));
        }
        return reply;
    });
}

function registerUser(data){
    return apiPost('auth/register', data).then(function(reply){
        if(reply.success){
            rememberStaffAccess(canManageStaff(reply));
        }
        return reply;
    });
}

// who is logged in right now (gives success false when nobody is)
function getMe(){
    return apiGet('auth/me').then(function(reply){
        if(reply.success){
            rememberStaffAccess(canManageStaff(reply));
        } else {
            forgetStaffAccess();
        }
        return reply;
    });
}

function logoutUser(){
    // the next person who logs in on this browser must not see the link for a moment
    forgetStaffAccess();
    return apiPost('auth/logout', {});
}