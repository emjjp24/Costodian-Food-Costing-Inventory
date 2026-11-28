// checks the login form before it is sent
// gives an error message, or "" when everything is fine
// the backend checks again, this only saves a trip to the server
function validateLoginForm(values){
    if(values.username == "" || values.password == ""){
        return 'Please enter your username and password.';
    }
    return "";
}

function validateRecoveryVerification(values){
    if(values.username == "" || values.recovery_question == "" || values.recovery_answer == ""){
        return 'Please fill in your username, recovery question and answer.';
    }
    return "";
}

function validateRecoveryPassword(values){
    if(values.new_password == "" || values.confirm_password == ""){
        return 'Please enter and confirm your new password.';
    }
    if(values.new_password.length < 8 || values.new_password.length > 72){
        return 'The new password must be 8 to 72 characters long.';
    }
    if(values.new_password !== values.confirm_password){
        return 'The new password and the confirmation do not match.';
    }
    return "";
}
