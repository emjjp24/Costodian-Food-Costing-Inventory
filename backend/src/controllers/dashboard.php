<?php
function dashboardSummary($conn, $user){

    $account_id = (int)$user['account_id'];
    $today = date('Y-m-d');
    $soon = soonDate();

    $counts = inventoryCounts($conn, $account_id, $today, $soon);

    // the items that need attention, first 10
    $alerts = [];
    foreach(listIngredients($conn, $account_id, "", null, 'alert', $today, $soon) as $row){
        $alerts[] = formatIngredient($row);
    }
    $alerts = array_slice($alerts, 0, 10);

    $filters = ['account_id' => $account_id, 'ingredient_id' => null, 'type' => '', 'from' => '', 'to' => ''];
    $recent = [];
    foreach(listMovements($conn, $filters, 10, 0) as $row){
        $recent[] = formatMovement($row);
    }

    respond(true, 'OK', [
        'account_name' => $user['account_name'],
        'account_type' => $user['account_type'],
        'total_ingredients' => (int)$counts['total'],
        'total_recipes' => countRecipes($conn, $account_id),
        'inventory_value' => round((float)$counts['stock_value'], 2),
        'out_of_stock' => (int)$counts['out_count'],
        'low_stock' => (int)$counts['low_count'],
        'expired' => (int)$counts['expired_count'],
        'expiring_soon' => (int)$counts['expiring_count'],
        'expiry_warning_days' => EXPIRY_WARNING_DAYS,
        'alerts' => $alerts,
        'recent_movements' => $recent
    ]);
}
?>