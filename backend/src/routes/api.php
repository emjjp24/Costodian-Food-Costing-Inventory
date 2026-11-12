<?php
// every request the frontend can make
// format: 'module/action' => [http method, controller file, function, who can use it]
// who can use it: public = anyone, login = any logged-in user (staff too), admin = the owner of the account only
// staff can see everything, cook, restock, use stock and record waste. Changing recipes and ingredients is for the admin.
// the full list of what staff may do is permissionsFor() in middlewares/role.php
//
// call it like this: backend/index.php?route=recipes/list
// send data as a normal form post or as json, for GET routes use the url (?id=3)
// the reply is always: {"success": true or false, "message": "...", "data": ...}
//
// quantities can be typed as 1/2, 3/4, 1 1/2 or 0.5 and always come with a unit
// units: kg, g, L, ml, pcs, dozen

$routes = [

    // ---- login and account ----
    // sign up (free): full_name, username, password, confirm_password,
    //   account_type = personal | business, business_name (needed for business)
    //   makes a new account with its own empty inventory and logs the person in
    'auth/register' => ['POST', 'auth.php', 'authRegister', 'public'],
    // login: username, password
    'auth/login' => ['POST', 'auth.php', 'authLogin', 'public'],
    'auth/logout' => ['POST', 'auth.php', 'authLogout', 'public'],
    // who is logged in (the frontend calls this when a page opens)
    'auth/me' => ['GET', 'auth.php', 'authMe', 'login'],
    // change own password: current_password, new_password, confirm_password
    'auth/password' => ['POST', 'auth.php', 'authPassword', 'login'],

    // ---- dashboard ----
    'dashboard/summary' => ['GET', 'dashboard.php', 'dashboardSummary', 'login'],

    // ---- costing: recipes ----
    // list: search, category_id (both optional)
    'recipes/list' => ['GET', 'recipes.php', 'recipesList', 'login'],
    // view: id, selling_price (optional, to see the food cost % of your own price)
    'recipes/view' => ['GET', 'recipes.php', 'recipesView', 'login'],
    // create: name, category_id, servings, other_costs, target_food_cost_pct, notes,
    //   ingredients = [ {name, category_id, qty_needed, needed_unit, qty_bought, bought_unit, price_paid} ]
    //   qty_bought + price_paid are the purchase. They load the ingredient into the inventory.
    //   Leave them out for an ingredient that is already in the inventory.
    'recipes/create' => ['POST', 'recipes.php', 'recipesCreate', 'admin'],
    // update: id + the same data as create. A purchase counts only the first time an
    //   ingredient is added to the recipe, so saving again never adds stock twice
    'recipes/update' => ['POST', 'recipes.php', 'recipesUpdate', 'admin'],
    // delete: id (the inventory is not changed)
    'recipes/delete' => ['POST', 'recipes.php', 'recipesDelete', 'admin'],

    // ---- inventory ----
    // list: search, category_id, status = low | out | expired | expiring | alert (all optional)
    'inventory/list' => ['GET', 'inventory.php', 'inventoryList', 'login'],
    // view: id (with its latest stock history)
    'inventory/view' => ['GET', 'inventory.php', 'inventoryView', 'login'],
    // create: name, category_id (optional), qty, unit, price_paid, expiry_date (optional),
    //   reorder_level (optional), reorder_unit (optional). A new ingredient comes with its first purchase,
    //   that is how it gets its cost. Recipes only use ingredients that are already in the inventory.
    'inventory/create' => ['POST', 'inventory.php', 'inventoryCreate', 'admin'],
    // update details: id, category_id, reorder_level, reorder_unit, expiry_date (YYYY-MM-DD, empty clears it)
    'inventory/update' => ['POST', 'inventory.php', 'inventoryUpdate', 'admin'],
    // delete: id (only when no recipe uses it)
    'inventory/delete' => ['POST', 'inventory.php', 'inventoryDelete', 'admin'],

    // ---- stock changes ----
    // use: ingredient_id, qty, unit, note (optional)
    'stock/use' => ['POST', 'stock.php', 'stockUse', 'login'],
    // cook a whole recipe: recipe_id, batches (optional, default 1, fractions allowed)
    'stock/cook' => ['POST', 'stock.php', 'stockCook', 'login'],
    // restock: ingredient_id, qty, unit, price_paid, expiry_date (optional), note (optional)
    'stock/restock' => ['POST', 'stock.php', 'stockRestock', 'login'],
    // waste: ingredient_id, qty, unit, reason (optional)
    'stock/waste' => ['POST', 'stock.php', 'stockWaste', 'login'],
    // history: ingredient_id, type, from, to, page, per_page (all optional)
    'stock/movements' => ['GET', 'stock.php', 'stockMovements', 'login'],

    // ---- categories ----
    // list: type = ingredient | recipe (optional)
    'categories/list' => ['GET', 'categories.php', 'categoriesList', 'login'],
    // create: name, type
    'categories/create' => ['POST', 'categories.php', 'categoriesCreate', 'admin'],
    // update: id, name
    'categories/update' => ['POST', 'categories.php', 'categoriesUpdate', 'admin'],
    // delete: id
    'categories/delete' => ['POST', 'categories.php', 'categoriesDelete', 'admin'],

    // ---- staff (administrator only; only a business account can add staff) ----
    // list: the staff of your account (+ can_add_staff, max_staff, staff_count)
    'staff/list' => ['GET', 'staff.php', 'staffList', 'admin'],
    // view: id (one staff member with the last 20 things they did)
    'staff/view' => ['GET', 'staff.php', 'staffView', 'admin'],
    // activity: user_id (optional), type, from, to, page, per_page (what staff did, from the stock history)
    'staff/activity' => ['GET', 'staff.php', 'staffActivity', 'admin'],
    // create: full_name, username, password (the role is always staff)
    'staff/create' => ['POST', 'staff.php', 'staffCreate', 'admin'],
    // update: id, full_name, username
    'staff/update' => ['POST', 'staff.php', 'staffUpdate', 'admin'],
    // password: id, new_password, confirm_password (optional). Sets a new password for that staff member
    'staff/password' => ['POST', 'staff.php', 'staffPassword', 'admin'],
    // status: id, active = 1 or 0. Turns the login on or off, the history is kept
    'staff/status' => ['POST', 'staff.php', 'staffStatus', 'admin'],
    // delete: id
    'staff/delete' => ['POST', 'staff.php', 'staffDelete', 'admin']
];
?>