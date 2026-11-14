// staff page: loads the team, search, and starts everything (loads last)

function refreshStaff(){
    getStaffList().then(function(reply){
        if(!reply.success){
            showMessage(reply.message, false);
            staffRows.innerHTML = '';
            return;
        }
        staffInfo = reply.data;
        staffMembers = reply.data.members;
        drawSummary(staffInfo);
        drawNotice();
        drawTable();
    });
}

// search while typing (the list is already here, so nothing is asked from the server)
searchBox.addEventListener('input', drawTable);

addButton.addEventListener('click', function(){
    openStaffForm(null);
});

// a click on the dark area closes a window
[formDialog, passDialog, confirmDialog, activityDialog].forEach(function(dialog){
    dialog.addEventListener('click', function(event){
        if(event.target === dialog){
            dialog.close();
        }
    });
});

// ---------- start ----------

startShell().then(function(user){
    if(!user){
        return;
    }
    // only the administrator of a business account manages staff
    if(!user.permissions || !user.permissions.manage_staff){
        window.location.href = 'dashboard.html';
        return;
    }
    currentUser = user;
    refreshStaff();
});