<?php
// every request the frontend can make
// format: 'module/action' => [http method, controller file, function, who can use it]
// who can use it: public = anyone, login = any logged-in user, admin = administrators only
//
// call it like this: backend/index.php?route=recipes/list
// send data as a normal form post or as json, for GET routes use the url (?id=3)
// the reply is always: {"success": true or false, "message": "...", "data": ...}
//
// quantities can be typed as 1/2, 3/4, 1 1/2 or 0.5 and always come with a unit
// units: kg, g, L, ml, pcs, dozen

$routes = [

    // ---- login and account ----
    // login: username, password
    'auth/register' => ['POST', 'register.php', 'authRegister', 'public'],
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
    'recipes/create' => ['POST', 'recipes.php', 'recipesCreate', 'login'],
    // update: id + the same data as create. A purchase counts only the first time an
    //   ingredient is added to the recipe, so saving again never adds stock twice
    'recipes/update' => ['POST', 'recipes.php', 'recipesUpdate', 'login'],
    // delete: id (the inventory is not changed)
    'recipes/delete' => ['POST', 'recipes.php', 'recipesDelete', 'login'],

    // ---- inventory ----
    // list: search, category_id, status = low | out | expired | expiring | alert (all optional)
    'inventory/list' => ['GET', 'inventory.php', 'inventoryList', 'login'],
    // view: id (with its latest stock history)
    'inventory/view' => ['GET', 'inventory.php', 'inventoryView', 'login'],
    // update details: id, category_id, reorder_level, reorder_unit, expiry_date (YYYY-MM-DD, empty clears it)
    'inventory/update' => ['POST', 'inventory.php', 'inventoryUpdate', 'login'],
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

    // ---- users (administrator only) ----
    'users/list' => ['GET', 'users.php', 'usersList', 'admin'],
    // create: full_name, username, password, role (admin or staff)
    'users/create' => ['POST', 'users.php', 'usersCreate', 'admin'],
    // update: id, full_name, username, role, password (optional, empty keeps the old one)
    'users/update' => ['POST', 'users.php', 'usersUpdate', 'admin'],
    // delete: id
    'users/delete' => ['POST', 'users.php', 'usersDelete', 'admin']
];
?>
