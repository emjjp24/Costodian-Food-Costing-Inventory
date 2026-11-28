// checks the sign up form before it is sent
// gives an error message, or "" when everything is fine
// the backend checks everything again, this only saves the person a trip to the server
function validateSignupForm(values){

    if(values.full_name == "" || values.username == "" || values.password == "" || values.confirm_password == ""){
        return 'Please fill in your full name, username and password.';
    }
    if(values.account_type != 'personal' && values.account_type != 'business'){
        return 'Please choose personal use or small business.';
    }
    if(values.account_type == 'business' && values.business_name == ""){
        return 'Please enter the name of your business.';
    }
    if(!/^[A-Za-z0-9_.-]{3,50}$/.test(values.username)){
        return 'The username must be 3 to 50 characters: letters, numbers, dot, dash or underscore.';
    }
    if(values.password.length < 8){
        return 'The password must be at least 8 characters long.';
    }
    if(values.password !== values.confirm_password){
        return 'The password and the confirmation do not match.';
    }
    if(values.recovery_question == "" || values.recovery_answer == ""){
        return 'Please choose a recovery question and enter its answer.';
    }
    if(values.recovery_answer.length > 72){
        return 'The recovery answer must not be longer than 72 characters.';
    }
    return "";
}
