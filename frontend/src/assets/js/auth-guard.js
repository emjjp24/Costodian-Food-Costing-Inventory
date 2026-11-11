// connects the sign in page to the tabs of the system (needs api/client.js loaded first)
// put this file in: frontend/src/assets/js/auth-guard.js

var GUARD_DASHBOARD = "dashboard.html";  // first tab after signing in
var GUARD_LOGIN = "../../index.html";    // the sign in page, seen from src/pages/

// the login page uses this, a visitor who is already signed in goes straight to the dashboard
function skipLoginIfSignedIn(dashboardUrl){
    apiGet('auth/me').then(function(reply){
        if(reply.success){
            window.location.href = dashboardUrl;
        }
    });
}

// a page inside src/pages/ uses this, nobody signed in means back to the sign in page
function requireSignIn(){
    return apiGet('auth/me').then(function(reply){
        if(!reply.success){
            window.location.href = GUARD_LOGIN;
            return null;
        }
        return reply.data;
    });
}