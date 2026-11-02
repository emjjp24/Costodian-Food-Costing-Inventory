<?php
// send a json reply to the frontend, then stop
function respond($success, $message, $data = null, $status = 200){
    http_response_code($status);
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode(["success" => $success, "message" => $message, "data" => $data], JSON_UNESCAPED_UNICODE | JSON_PARTIAL_OUTPUT_ON_ERROR);
    exit;
}

// trim a value and squeeze repeated spaces, gives "" when it is not text
function cleanText($value){
    if(is_int($value) || is_float($value)){
        $value = (string)$value;
    }
    if(!is_string($value)){
        return "";
    }
    $clean = preg_replace('/\s+/u', ' ', $value);
    if($clean === null){
        return "";
    }
    return trim($clean);
}

// a record id: gives the number, or 0 when it is not valid
function requestId($value){
    if(is_int($value)){
        return $value > 0 ? $value : 0;
    }
    if(is_string($value) && preg_match('/^\d{1,10}$/', trim($value))){
        return (int)trim($value);
    }
    return 0;
}

// an optional id: empty gives null, a valid id gives the number, anything else gives false
function optionalId($value){
    if($value === null || (is_string($value) && trim($value) === "")){
        return null;
    }
    $id = requestId($value);
    return $id > 0 ? $id : false;
}

// true when the value was left empty
function isBlank($value){
    return $value === null || (is_string($value) && trim($value) === "");
}

// make a search word safe for LIKE (used with ESCAPE '!')
function escapeLike($text){
    return str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $text);
}

// true when the text is a real date written as YYYY-MM-DD
function validDate($text){
    if(!is_string($text)){
        return false;
    }
    $date = DateTime::createFromFormat('Y-m-d', $text);
    return $date !== false && $date->format('Y-m-d') === $text;
}
?>
