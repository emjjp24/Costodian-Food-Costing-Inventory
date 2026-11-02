<?php
// turn "1/2", "3/4", "1 1/2", "0.5" or 2 into a number
// gives null when the input is not valid (letters, negative, zero, 1/0 ...)
function parseQuantity($input, $allow_zero = false){

    if(is_int($input) || is_float($input)){
        $value = (float)$input;
    } else if(is_string($input)){
        $input = trim($input);

        if(preg_match('/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/', $input, $m)){
            // mixed number: 1 1/2
            if((int)$m[3] === 0){
                return null;
            }
            $value = (int)$m[1] + ((int)$m[2] / (int)$m[3]);
        } else if(preg_match('/^(\d+)\s*\/\s*(\d+)$/', $input, $m)){
            // fraction: 3/4
            if((int)$m[2] === 0){
                return null;
            }
            $value = (int)$m[1] / (int)$m[2];
        } else if(preg_match('/^(\d+(\.\d+)?|\.\d+)$/', $input)){
            // decimal or whole number: 0.5, .25, 2
            $value = (float)$input;
        } else {
            return null;
        }
    } else {
        return null;
    }

    if(!is_finite($value) || $value < 0){
        return null;
    }
    if($value == 0 && !$allow_zero){
        return null;
    }
    return $value;
}

// a plain amount such as a price or a percent (no fractions), gives null when not valid
function parseAmount($input, $allow_zero = true){

    if(is_int($input) || is_float($input)){
        $value = (float)$input;
    } else if(is_string($input) && preg_match('/^(\d+(\.\d+)?|\.\d+)$/', trim($input))){
        $value = (float)trim($input);
    } else {
        return null;
    }

    if(!is_finite($value) || $value < 0){
        return null;
    }
    if($value == 0 && !$allow_zero){
        return null;
    }
    return $value;
}

// a number as plain text for the database (no 1.0E-5 style numbers)
function decimalString($value, $places){
    return number_format((float)$value, $places, '.', '');
}
?>
