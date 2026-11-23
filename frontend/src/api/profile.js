// calls to the backend for the logged-in person's own profile (needs client.js loaded first)

// full_name, username, and business_name (only the administrator of a business account)
function saveMyProfile(data){
    return apiPost('auth/profile', data);
}

// current_password, new_password, confirm_password
function changeMyPassword(current, newPassword, confirmPassword){
    return apiPost('auth/password', {current_password: current, new_password: newPassword, confirm_password: confirmPassword});
}
