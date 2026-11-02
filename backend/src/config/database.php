<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "foodcost_db";

try{
  $conn = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8mb4", $username, $password);
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  // rows come back as name => value only
  $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e){
  error_log("Connection failed: " . $e->getMessage());
  respond(false, "Could not connect to the database. Make sure MySQL is running and foodcost_db exists.", null, 500);
}
?>
