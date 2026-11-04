// calls to the backend for the account (needs client.js loaded first)

function loginUser(data){
    return apiPost('auth/login', data);
}

function registerUser(data){
    return apiPost('auth/register', data);
}
