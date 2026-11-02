<?php
// the biggest amount the system accepts, in the base unit
define('MAX_BASE_QUANTITY', 100000000);

// accepted units: name => [base unit, how many base units in one]
function unitTable(){
    return [
        'kg' => ['g', 1000],
        'g' => ['g', 1],
        'l' => ['ml', 1000],
        'ml' => ['ml', 1],
        'dozen' => ['pcs', 12],
        'pcs' => ['pcs', 1]
    ];
}

// "KG", " L " and "liter" become kg, l and l. Gives null for an unknown unit
function normalizeUnit($unit){
    if(!is_string($unit)){
        return null;
    }
    $unit = strtolower(trim($unit));
    if($unit == 'liter' || $unit == 'litre'){
        $unit = 'l';
    }
    $table = unitTable();
    return isset($table[$unit]) ? $unit : null;
}

// the base unit (g, ml or pcs) that a unit belongs to
function baseUnitOf($unit){
    $unit = normalizeUnit($unit);
    if($unit === null){
        return null;
    }
    $table = unitTable();
    return $table[$unit][0];
}

// 0.5 kg becomes 500 (g)
function toBaseQuantity($qty, $unit){
    $unit = normalizeUnit($unit);
    $table = unitTable();
    return $qty * $table[$unit][1];
}

// same as above, but gives null when the unit does not fit the ingredient (for example kg for ml)
function convertToBase($qty, $unit, $base_unit){
    if(baseUnitOf($unit) !== $base_unit){
        return null;
    }
    return toBaseQuantity($qty, $unit);
}

// which units can be used with a base unit, for messages
function unitsFor($base_unit){
    if($base_unit == 'g'){
        return "g or kg";
    }
    if($base_unit == 'ml'){
        return "ml or L";
    }
    return "pcs or dozen";
}

// 1500 (g) becomes "1.5 kg", 250 (ml) becomes "250 ml"
function formatQuantity($qty, $base_unit){
    $qty = (float)$qty;
    $unit = $base_unit;
    if($base_unit == 'g' && abs($qty) >= 1000){
        $qty = $qty / 1000;
        $unit = 'kg';
    } else if($base_unit == 'ml' && abs($qty) >= 1000){
        $qty = $qty / 1000;
        $unit = 'L';
    }
    $text = rtrim(rtrim(number_format($qty, 3, '.', ''), '0'), '.');
    if($text === ''){
        $text = '0';
    }
    return $text . " " . $unit;
}
?>
