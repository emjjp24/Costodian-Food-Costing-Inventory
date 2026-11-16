// puts the "Staff" link in the left panel, but only for an administrator of a business account
// add this one script to the page (after api/client.js and api/auth.js)
//
// the link is drawn at once from what the browser remembers from the last page (so it never blinks away
// and comes back when you click another tab), then the server is asked to make sure it is still right

var STAFF_LINK_KEY = 'costodian-can-manage-staff';

function rememberedStaffAccess(){
    try {
        return sessionStorage.getItem(STAFF_LINK_KEY) == '1';
    } catch(e){
        return false;
    }
}

function rememberStaffAccess(allowed){
    try {
        sessionStorage.setItem(STAFF_LINK_KEY, allowed ? '1' : '0');
    } catch(e){
        // the browser does not allow it: the link is just drawn after the server answers
    }
}

function drawStaffLink(nav){
    if(document.getElementById('staff-link')){
        return;
    }
    var link = document.createElement('a');
    link.className = 'side-link';
    link.id = 'staff-link';
    link.href = 'staff.html';
    // a little group of people
    link.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>Staff';
    nav.appendChild(link);
}

function addStaffLink(){
    var nav = document.querySelector('.side-nav');
    if(!nav){
        return;
    }

    // 1) at once, if this person was an administrator on the last page
    if(rememberedStaffAccess()){
        drawStaffLink(nav);
    }

    // 2) then the server says what is true now
    getMe().then(function(reply){
        var allowed = reply.success && reply.data.permissions && reply.data.permissions.manage_staff;
        rememberStaffAccess(!!allowed);
        if(allowed){
            drawStaffLink(nav);
        } else if(document.getElementById('staff-link')){
            // somebody else logged in on this browser: the link goes away
            document.getElementById('staff-link').remove();
        }
    });
}

// the sidebar is already on the page when this script is at the bottom: draw right away, no waiting
if(document.querySelector('.side-nav')){
    addStaffLink();
} else if(document.readyState == 'loading'){
    document.addEventListener('DOMContentLoaded', addStaffLink);
} else {
    addStaffLink();
}