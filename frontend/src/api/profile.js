// calls to the backend for the logged-in person's own profile (needs client.js loaded first)

// full_name, username, email, phone (email and phone are optional) and
// business_name, business_address, business_tagline (only the administrator of a business account)
function saveMyProfile(data){
    return apiPost('auth/profile', data);
}

// current_password, new_password, confirm_password
function changeMyPassword(current, newPassword, confirmPassword){
    return apiPost('auth/password', {current_password: current, new_password: newPassword, confirm_password: confirmPassword});
}

// set/update the logged-in administrator's recovery question and answer
function saveRecoverySettings(question, answer, currentPassword){
    return apiPost('auth/recovery/setup', {
        recovery_question: question,
        recovery_answer: answer,
        current_password: currentPassword
    });
}

// delete my own account: a staff member deletes only their login, the administrator deletes the whole account
function deleteMyAccount(password){
    return apiPost('auth/delete', {password: password});
}