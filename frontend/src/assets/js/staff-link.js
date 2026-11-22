// the "Staff" link of the left panel: only an administrator of a business account sees it
//
// each page has the link in its HTML (hidden), and a small line in the <head> shows it from the very first
// picture when the browser remembers that this person is an administrator (api/auth.js keeps that memory),
// so it never blinks when you change tabs.
// this script (at the bottom of the page) asks the server and makes sure it is still right.
// a personal account or a staff member never sees the link: the server says no and it stays hidden.
// if a page has no such link in its HTML, the link is made here instead.

function findOrMakeStaffLink(){
    var link = document.getElementById('staff-link');
    if(link){
        return link;
    }
    var nav = document.querySelector('.side-nav');
    if(!nav){
        return null;
    }
    link = document.createElement('a');
    link.className = 'side-link';
    link.id = 'staff-link';
    link.href = 'staff.html';
    link.hidden = true;
    // a little group of people
    link.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>Staff';
    nav.appendChild(link);
    return link;
}

function checkStaffLink(){
    var link = findOrMakeStaffLink();
    if(!link){
        return;
    }

    // getMe() (api/auth.js) also updates what the browser remembers
    getMe().then(function(reply){
        var early = document.getElementById('staff-link-early');
        var allowed = !!(reply && reply.success && reply.data && reply.data.permissions && reply.data.permissions.manage_staff);
        try {
            localStorage.setItem('costodian-can-manage-staff', allowed ? '1' : '0');
        } catch(e){
            // private mode: nothing to remember
        }
        if(allowed){
            link.hidden = false;
        } else {
            if(early){
                early.remove();
            }
            link.hidden = true;
        }
    });
}

if(document.readyState == 'loading'){
    document.addEventListener('DOMContentLoaded', checkStaffLink);
} else {
    checkStaffLink();
}