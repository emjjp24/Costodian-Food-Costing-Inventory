// shared helper: sends a request to the backend and gives back the JSON reply
// the backend folder is found from the page address, so any project folder name works
var API_BASE = location.pathname.split('/frontend/')[0] + '/backend/index.php?route=';

var SERVER_DOWN = {success: false, message: 'Could not reach the server. Make sure Apache and MySQL are running.', data: null};

// send data to the backend (POST), gives {success, message, data}
function apiPost(route, data){
    return fetch(API_BASE + route, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }).then(function(response){
        return response.json();
    }).catch(function(){
        return SERVER_DOWN;
    });
}

// ask the backend for data (GET), gives {success, message, data}
function apiGet(route, query){
    var url = API_BASE + route;
    if(query){
        for(var key in query){
            url += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(query[key]);
        }
    }
    return fetch(url).then(function(response){
        return response.json();
    }).catch(function(){
        return SERVER_DOWN;
    });
}
