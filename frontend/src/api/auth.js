// calls to the backend for the account (needs client.js loaded first)

function loginUser(data){
    return apiPost('auth/login', data);
}

function registerUser(data){
    return apiPost('auth/register', data);
}

// who is logged in right now (gives success false when nobody is)
function getMe(){
    return apiGet('auth/me');
}

function logoutUser(){
    return apiPost('auth/logout', {});
}