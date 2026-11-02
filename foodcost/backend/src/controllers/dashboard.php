<?php
function dashboardSummary($conn, $user){

    $today = date('Y-m-d');
    $soon = soonDate();

    $counts = inventoryCounts($conn, $today, $soon);

    $stmt = $conn->prepare("SELECT COUNT(*) AS total FROM recipes");
    $stmt->execute();
    $recipes = $stmt->fetch();

    // the items that need attention, first 10
    $alerts = [];
    foreach(listIngredients($conn, "", null, 'alert', $today, $soon) as $row){
        $alerts[] = formatIngredient($row);
    }
    $alerts = array_slice($alerts, 0, 10);

    $filters = ['ingredient_id' => null, 'type' => '', 'from' => '', 'to' => ''];
    $recent = [];
    foreach(listMovements($conn, $filters, 10, 0) as $row){
        $recent[] = formatMovement($row);
    }

    respond(true, 'OK', [
        'total_ingredients' => (int)$counts['total'],
        'total_recipes' => (int)$recipes['total'],
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
