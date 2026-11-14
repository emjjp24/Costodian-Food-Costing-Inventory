// calls to the backend for the staff accounts (needs client.js loaded first)
// only the administrator of a business account may use these

// everyone in the team, plus can_add_staff, max_staff and a note
function getStaffList(){
    return apiGet('staff/list');
}

// one staff member with the last things they did
function getStaffMember(id){
    return apiGet('staff/view', {id: id});
}

// full_name, username, password
function createStaff(data){
    return apiPost('staff/create', data);
}

// full_name and username (the password has its own call)
function updateStaff(id, data){
    data.id = id;
    return apiPost('staff/update', data);
}

// the administrator sets a new password: new_password and confirm_password
function changeStaffPassword(id, newPassword, confirmPassword){
    return apiPost('staff/password', {id: id, new_password: newPassword, confirm_password: confirmPassword});
}

// turn the login on (true) or off (false), the history stays
function setStaffActive(id, active){
    return apiPost('staff/status', {id: id, active: active ? 1 : 0});
}

function deleteStaff(id){
    return apiPost('staff/delete', {id: id});
}