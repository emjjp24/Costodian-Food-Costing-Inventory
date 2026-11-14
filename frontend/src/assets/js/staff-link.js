// puts the "Staff" link in the left panel, but only for an administrator of a business account
// add this one script to the page (after api/client.js and api/auth.js)
// it waits until the page is drawn, so it does not matter where the script line is

function addStaffLink(){
    var nav = document.querySelector('.side-nav');
    if(!nav || document.getElementById('staff-link')){
        return;
    }

    getMe().then(function(reply){
        if(!reply.success || !reply.data.permissions || !reply.data.permissions.manage_staff){
            return;
        }
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
    });
}

if(document.readyState == 'loading'){
    document.addEventListener('DOMContentLoaded', addStaffLink);
} else {
    addStaffLink();
}
