// checks the login form before it is sent
// gives an error message, or "" when everything is fine
// the backend checks again, this only saves a trip to the server
function validateLoginForm(values){
    if(values.username == "" || values.password == ""){
        return 'Please enter your username and password.';
    }
    return "";
}
