<?php
// single entry point: every request from the frontend comes here
// example: index.php?route=recipes/list

// days before an expiry date when the system starts to warn
define('EXPIRY_WARNING_DAYS', 3);

// the most staff accounts one business account can have
define('MAX_STAFF_PER_ACCOUNT', 10);

// dates (expiry, alerts) follow the local time
date_default_timezone_set('Asia/Manila');

// php warnings are written to the error log, not printed on the page
ini_set('display_errors', '0');
error_reporting(E_ALL);

$src = __DIR__ . "/src/";

include_once($src . "helpers/response.php");
include_once($src . "helpers/quantity.php");
include_once($src . "helpers/units.php");
include_once($src . "config/database.php");
include_once($src . "middlewares/session.php");
include_once($src . "middlewares/role.php");

include_once($src . "models/account.php");
include_once($src . "models/user.php");
include_once($src . "models/category.php");
include_once($src . "models/ingredient.php");
include_once($src . "models/recipe.php");
include_once($src . "models/recipeingredient.php");
include_once($src . "models/stockmovement.php");

include_once($src . "validators/auth.php");
include_once($src . "validators/user.php");
include_once($src . "validators/recipe.php");
include_once($src . "validators/ingredient.php");
include_once($src . "validators/stock.php");

include_once($src . "services/costing.php");
include_once($src . "services/inventory.php");
include_once($src . "services/stock.php");

include_once($src . "routes/api.php");

session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']);
session_start();

// accept json bodies as well as normal form posts
$content_type = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : "";
if(stripos($content_type, 'application/json') !== false){
    $raw_body = file_get_contents('php://input');
    if(trim($raw_body) != ""){
        $body = json_decode($raw_body, true);
        if(!is_array($body)){
            respond(false, 'The request body is not valid JSON.', null, 400);
        }
        $_POST = $body;
    }
}

// find the route
$route = (isset($_GET['route']) && is_string($_GET['route'])) ? trim($_GET['route'], '/') : "";

if(!isset($routes[$route])){
    respond(false, 'Route not found.', null, 404);
}

list($method, $file, $handler, $access) = $routes[$route];

if($_SERVER['REQUEST_METHOD'] !== $method){
    respond(false, 'Wrong request method. Use ' . $method . '.', null, 405);
}

// check who is allowed to use the route
$user = null;
if($access != 'public'){
    $user = requireLogin($conn);
    if($access == 'admin'){
        requireRole($user, 'admin');
    }
}

include_once($src . "controllers/" . $file);

try{
    $handler($conn, $user);
} catch(PDOException $e){
    error_log("Database error on " . $route . ": " . $e->getMessage());
    respond(false, 'Something went wrong on the server. Please try again.', null, 500);
} catch(Exception $e){
    // a rule of the system was broken, so the message is meant for the user
    respond(false, $e->getMessage(), null, 400);
} catch(Throwable $e){
    error_log("Error on " . $route . ": " . $e->getMessage());
    respond(false, 'Something went wrong on the server. Please try again.', null, 500);
}
?>