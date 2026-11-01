# 🍽️ FoodCost — Food Costing & Inventory Management System

A web-based management system for **any food business** — restaurants, cafés, carinderias, bakeries, food stalls, catering services, or even a home kitchen. It combines **recipe/dish costing** and **ingredient inventory** in one place. Ingredients entered while costing a dish are automatically added to the inventory, and every time ingredients are used, the stock is deducted automatically.

> **Example:** You cost *Chicken Adobo* and enter chicken, soy sauce, vinegar, garlic, and oil. They are instantly loaded into the inventory. Later you use `0.5 kg` of chicken, and the inventory's chicken stock goes down by `0.5 kg`. The same works for a banana bread, a pasta dish, a milk tea, or a sauce.

---

## 📑 Table of Contents

1. [Overview](#-overview)
2. [Who Is It For?](#-who-is-it-for)
3. [Features](#-features)
4. [Tech Stack](#-tech-stack)
5. [How It Works (Core Flow)](#-how-it-works-core-flow)
6. [Costing Formulas](#-costing-formulas)
7. [System Modules / Pages](#-system-modules--pages)
8. [Database Design](#-database-design)
9. [Folder Structure](#-folder-structure)
10. [Installation (XAMPP)](#-installation-xampp)
11. [Usage Guide](#-usage-guide)
12. [Sample Walkthrough](#-sample-walkthrough-chicken-adobo)
13. [Security Practices](#-security-practices)
14. [Future Improvements](#-future-improvements)
15. [Author & License](#-author--license)

---

## 📌 Overview

Food businesses often compute the cost of a dish on paper and track their stock separately, which leads to wrong menu prices, wasted ingredients, and surprise shortages. **FoodCost** connects the two:

- The **Costing** tab computes how much a recipe or dish costs to make, and how much to sell it for.
- The **Inventory** tab shows what ingredients are in stock, how much is left, what is about to expire, and what needs restocking.
- Both tabs share the **same ingredient data**, so they never go out of sync.

---

## 👥 Who Is It For?

| Business type | Example items |
|---------------|---------------|
| Restaurant / Carinderia | Adobo, sinigang, fried rice, pasta |
| Bakery / Pastry shop | Banana bread, cakes, pandesal, cookies |
| Café / Beverage shop | Milk tea, coffee, smoothies, syrups |
| Food stall / Street food | Fishballs, siomai, burgers, sandwiches |
| Catering / Home kitchen | Party trays, meal prep, sauces, desserts |

---

## ✨ Features

### 💰 Costing Tab
- Create recipes or dishes (e.g., Chicken Adobo, Banana Bread, Milk Tea) and assign a **category** (Main Dish, Dessert, Drink, Baked Goods, etc.).
- Add ingredients to a recipe with: name, category, quantity needed, unit, and price paid.
- Optional **other costs** per batch: packaging, labor, gas/electricity.
- Automatic computation of:
  - Cost per ingredient
  - Total recipe cost (ingredients + other costs)
  - Cost per serving / per piece
  - **Food cost %** and suggested selling price based on a target food cost %
  - Gross profit per serving
- **Auto-load to inventory:** every ingredient entered in costing is automatically created in (or added to) the inventory.

### 📦 Inventory Tab
- View all ingredients with current stock, unit, unit cost, stock value, and expiry date.
- **Use / Deduct stock:** record ingredient usage (e.g., 0.5 kg chicken) and the stock is subtracted automatically.
- **Restock:** add new purchases; the unit cost is updated using the weighted average.
- **Waste / spoilage:** record spoiled or discarded items so stock stays accurate.
- Low-stock alerts when an ingredient falls to or below its reorder level.
- Near-expiry alerts for perishable ingredients.
- Filter by ingredient category (Meat, Seafood, Vegetables, Dairy, Dry Goods, Condiments, Beverages, Packaging).

### ➗ Fraction, Mixed Number & Decimal Input
- Every quantity field accepts **fractions**, **mixed numbers**, and **decimals**: `1/2`, `1/4`, `1/8`, `3/4`, `1 1/2`, `2.5`.
- Works everywhere a quantity is typed: Costing (quantity needed and quantity bought), Use, Restock, and Waste.
- A live preview shows the decimal value as you type (e.g., `3/4` → `0.75`).
- Invalid entries (`abc`, `1/0`, `-1/2`, `0`) are rejected with a clear error message.

### 🧾 Stock Movement Log
- Every change (stock in, stock out, waste, adjustment) is recorded with date, quantity, and who did it.
- Full history so you can see where each ingredient went.

### 🔐 Users
- Login and logout with hashed passwords.
- Roles: **Admin** (full access) and **Staff** (costing and inventory use).

### 📊 Dashboard
- Total ingredients, total inventory value, low-stock count, near-expiry count, and number of recipes.
- Recent stock movements.

---

## 🛠 Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| Frontend   | HTML5, CSS3                        |
| Backend    | PHP 8.x (procedural or PDO)        |
| Database   | MySQL / MariaDB                    |
| Server     | Apache via **XAMPP**               |
| Admin tool | phpMyAdmin (bundled with XAMPP)    |

> No frameworks are required. Optional: a little vanilla JavaScript for live total computation in forms.

---

## 🔄 How It Works (Core Flow)

```
┌──────────────────────┐
│  COSTING TAB         │
│  Create recipe/dish  │
│  Add ingredients     │──┐
│  (name, qty, price)  │  │  Auto-load
└──────────────────────┘  │
                          ▼
                ┌────────────────────┐
                │  INVENTORY TAB     │
                │  Ingredient exists?│
                │  YES → add stock   │
                │  NO  → create item │
                └─────────┬──────────┘
                          │
        Use ingredient    │  (e.g., chicken 0.5 kg)
                          ▼
                ┌────────────────────┐
                │  Stock deducted    │
                │  Movement logged   │
                └────────────────────┘
```

### Rule 1 — Costing → Inventory (auto-load)
When an ingredient is saved in a recipe's costing:
1. The system checks if an ingredient with the **same name** already exists in inventory.
2. **If not:** a new inventory item is created with the entered quantity and unit cost.
3. **If yes:** the purchased quantity is **added** to the current stock and the unit cost is recalculated (weighted average).
4. A `stock_in` entry is written to the movement log.

### Rule 2 — Using ingredients → Inventory (auto-deduct)
When ingredients are used:
- **Manual use:** in the Inventory tab, choose an ingredient and enter the quantity used (e.g., `0.5 kg` chicken).
- **Cook / Produce a batch:** in the Costing tab, press **"Cook Batch"** on a recipe to deduct *all* of that recipe's ingredients (× number of batches) at once.
- The system converts units to the ingredient's base unit, subtracts the amount, and logs a `stock_out` entry.
- If the stock is not enough, the action is **blocked** with an error message.

### Rule 3 — Units
All quantities are stored in a **base unit** to avoid rounding errors:

| You enter | Stored as |
|-----------|-----------|
| kg        | g (× 1000) |
| g         | g          |
| L         | ml (× 1000) |
| ml        | ml         |
| pcs / dozen | pcs (dozen × 12) |

So `1/2 kg` of chicken is stored and deducted as `500 g`.

### Rule 4 — Fraction Input
Quantities are typed as **text**, not as a number-only field, so users can write fractions the way they do in a kitchen. The system converts the text into a decimal number *before* applying the unit conversion.

| You type | Unit | Decimal value | Stored / deducted as |
|----------|------|---------------|----------------------|
| `1/2`    | kg   | 0.5           | 500 g  |
| `1/4`    | kg   | 0.25          | 250 g  |
| `1/8`    | kg   | 0.125         | 125 g  |
| `3/4`    | L    | 0.75          | 750 ml |
| `1 1/2`  | kg   | 1.5           | 1500 g |
| `2.5`    | kg   | 2.5           | 2500 g |
| `1/2`    | pcs  | 0.5           | 0.5 pcs (e.g., half an onion) |
| `1/2`    | dozen | 0.5          | 6 pcs  |

**Accepted formats**
- Fraction: `1/2`, `3/4`, `1/8`
- Mixed number: `1 1/2`, `2 3/4`
- Decimal: `0.5`, `.25`, `2.5`
- Whole number: `1`, `3`

**Parser function** (`includes/functions.php`):

```php
/**
 * Converts "1/2", "3/4", "1 1/2", "0.5" or "2" into a float.
 * Returns null if the input is invalid or not greater than zero.
 */
function parse_quantity(string $input): ?float
{
    $input = trim($input);

    if (preg_match('/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/', $input, $m)) {        // mixed: 1 1/2
        if ((int)$m[3] === 0) return null;
        $value = (int)$m[1] + ((int)$m[2] / (int)$m[3]);
    } elseif (preg_match('/^(\d+)\s*\/\s*(\d+)$/', $input, $m)) {          // fraction: 3/4
        if ((int)$m[2] === 0) return null;
        $value = (int)$m[1] / (int)$m[2];
    } elseif (preg_match('/^(\d+(\.\d+)?|\.\d+)$/', $input)) {             // decimal / whole
        $value = (float)$input;
    } else {
        return null;
    }

    return $value > 0 ? $value : null;
}
```

**Using it with unit conversion:**

```php
$factors = ['kg' => 1000, 'g' => 1, 'L' => 1000, 'ml' => 1, 'pcs' => 1, 'dozen' => 12];

$qty = parse_quantity($_POST['qty']);          // "1/2" → 0.5
if ($qty === null) {
    die("Invalid quantity. Use a number or a fraction like 1/2.");
}
$qty_base = $qty * $factors[$_POST['unit']];   // 0.5 kg → 500 (g)
```

**HTML input** (use `type="text"`, since `type="number"` does not allow `/`):

```html
<input type="text" name="qty" id="qty" placeholder="e.g. 1/2, 3/4, 1 1/2" required>
<small id="qty-preview"></small>
```

**Optional live preview** (vanilla JavaScript):

```html
<script>
function parseQty(text) {
  text = text.trim();
  let m;
  if ((m = text.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/))) return m[3] == 0 ? null : (+m[1]) + (+m[2]) / (+m[3]);
  if ((m = text.match(/^(\d+)\s*\/\s*(\d+)$/)))         return m[2] == 0 ? null : (+m[1]) / (+m[2]);
  if (/^(\d+(\.\d+)?|\.\d+)$/.test(text))               return parseFloat(text);
  return null;
}
document.getElementById('qty').addEventListener('input', function () {
  const v = parseQty(this.value);
  document.getElementById('qty-preview').textContent =
    v === null ? (this.value ? 'Invalid quantity' : '') : '= ' + v;
});
</script>
```

> The server-side PHP check is always the one that counts; the JavaScript preview is only a convenience.

### Rule 5 — Perishables
Ingredients can have an **expiry date**. The inventory flags items that are expired or expire within a set number of days (default: 3), so food is used before it spoils.

---

## 🧮 Costing Formulas

**Unit cost (per base unit)**
```
unit_cost = price_paid / quantity_bought_in_base_unit
Example: ₱180 for 1 kg chicken → 180 / 1000 g = ₱0.18 per g
```

**Ingredient cost in a recipe**
```
ingredient_cost = quantity_used × unit_cost
Example: 1000 g chicken × ₱0.18 = ₱180.00
```

**Total recipe cost**
```
total_cost = Σ ingredient_cost + other_costs (packaging, labor, gas)
```

**Cost per serving**
```
cost_per_serving = total_cost / number_of_servings
```

**Suggested selling price (from target food cost %)**
```
selling_price = cost_per_serving / (target_food_cost_pct / 100)
Example: ₱36.55 / 0.35 = ₱104.43
```

**Food cost % (for any selling price)**
```
food_cost_pct = (cost_per_serving / selling_price) × 100
```

**Gross profit per serving**
```
gross_profit = selling_price − cost_per_serving
```

**Weighted average cost on restock**
```
new_unit_cost = ((current_stock × current_unit_cost) + (added_qty × new_unit_cost))
                / (current_stock + added_qty)
```

---

## 🗂 System Modules / Pages

| Page | File | Description |
|------|------|-------------|
| Login | `login.php` | User authentication |
| Dashboard | `dashboard.php` | Summary cards and recent activity |
| Recipes list | `costing/index.php` | All recipes/dishes with total cost |
| Add / edit recipe | `costing/recipe_form.php` | Recipe details and ingredient rows |
| Recipe details | `costing/view.php` | Cost breakdown, food cost %, selling price, **Cook Batch** |
| Inventory list | `inventory/index.php` | Stock, unit cost, value, low-stock and expiry flags |
| Use stock | `inventory/use.php` | Deduct ingredient quantity |
| Restock | `inventory/restock.php` | Add purchased quantity |
| Waste / spoilage | `inventory/waste.php` | Record discarded stock |
| Movement log | `inventory/movements.php` | History of all stock changes |
| Categories | `categories/index.php` | Manage ingredient and recipe categories |
| Users (admin) | `users/index.php` | Manage staff accounts |
| Logout | `logout.php` | End session |

---

## 🗄 Database Design

**Database name:** `foodcost_db`

### Entity Relationship (simplified)

```
users ────────────────────┐
                          ▼
categories ──► ingredients ◄── recipe_ingredients ──► recipes ◄── categories
                   ▲
                   └────── stock_movements
```

### SQL Script

```sql
CREATE DATABASE IF NOT EXISTS foodcost_db;
USE foodcost_db;

-- USERS
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,              -- password_hash()
    role ENUM('admin','staff') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIES (used for both ingredients and recipes)
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    type ENUM('ingredient','recipe') NOT NULL,
    UNIQUE KEY uniq_cat (name, type)
);

-- INGREDIENTS (this IS the inventory)
CREATE TABLE ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category_id INT DEFAULT NULL,
    base_unit ENUM('g','ml','pcs') NOT NULL,
    stock_qty DECIMAL(12,3) NOT NULL DEFAULT 0,  -- in base unit
    unit_cost DECIMAL(12,5) NOT NULL DEFAULT 0,  -- cost per base unit
    reorder_level DECIMAL(12,3) NOT NULL DEFAULT 0,
    expiry_date DATE DEFAULT NULL,               -- optional, for perishables
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- RECIPES / DISHES
CREATE TABLE recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INT DEFAULT NULL,
    servings INT NOT NULL DEFAULT 1,
    other_costs DECIMAL(12,2) NOT NULL DEFAULT 0,        -- packaging, labor, gas per batch
    target_food_cost_pct DECIMAL(5,2) NOT NULL DEFAULT 35.00,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- INGREDIENTS USED IN EACH RECIPE
CREATE TABLE recipe_ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    qty_needed DECIMAL(12,3) NOT NULL,           -- in base unit
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT
);

-- STOCK MOVEMENT LOG
CREATE TABLE stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ingredient_id INT NOT NULL,
    type ENUM('stock_in','stock_out','waste','adjustment') NOT NULL,
    qty DECIMAL(12,3) NOT NULL,                  -- in base unit
    unit_cost DECIMAL(12,5) DEFAULT NULL,
    reference VARCHAR(150),                      -- e.g. "Costing: Chicken Adobo"
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### Sample Data

```sql
-- Starter categories
INSERT INTO categories (name, type) VALUES
('Meat & Poultry','ingredient'), ('Seafood','ingredient'), ('Vegetables & Fruits','ingredient'),
('Dairy & Eggs','ingredient'), ('Dry Goods & Grains','ingredient'), ('Condiments & Sauces','ingredient'),
('Oils & Fats','ingredient'), ('Beverages','ingredient'), ('Packaging','ingredient'),
('Main Dish','recipe'), ('Appetizer','recipe'), ('Dessert','recipe'),
('Baked Goods','recipe'), ('Drinks','recipe'), ('Sauces & Sides','recipe');

-- Admin account (generate your own password hash)
INSERT INTO users (full_name, username, password, role)
VALUES ('Administrator', 'admin',
        '$2y$10$REPLACE_WITH_YOUR_OWN_PASSWORD_HASH', 'admin');
```

> Generate a real hash with a one-time script: `echo password_hash('admin123', PASSWORD_DEFAULT);`

---

## 📁 Folder Structure

```
foodcost/
|-- frontend/
|   |-- index.html                  # entry page: login
|   `-- src/
|       |-- api/                    # calls to the backend
|       |   |-- client.js           # shared request helper
|       |   |-- auth.js
|       |   |-- recipes.js
|       |   |-- inventory.js
|       |   |-- stock.js
|       |   |-- categories.js
|       |   `-- users.js
|       |-- assets/
|       |   |-- css/
|       |   |   `-- style.css
|       |   `-- img/
|       |-- components/             # reusable parts of a page
|       |   |-- navbar.js           # Costing and Inventory tabs
|       |   |-- footer.js
|       |   `-- alert.js
|       |-- pages/                  # one page for each screen
|       |   |-- dashboard.html
|       |   |-- recipes.html
|       |   |-- recipe-form.html
|       |   |-- recipe-view.html
|       |   |-- inventory.html
|       |   |-- use-stock.html
|       |   |-- restock.html
|       |   |-- waste.html
|       |   |-- movements.html
|       |   |-- categories.html
|       |   `-- users.html
|       |-- utils/
|       |   |-- format.js           # peso and date formatting
|       |   `-- fractions.js        # live preview of 1/2, 3/4, 1 1/2
|       |-- validators/             # form checks before sending
|       |   |-- login.js
|       |   |-- recipe.js
|       |   `-- quantity.js
|       `-- main.js                 # shared startup script
|-- backend/
|   |-- index.php                   # single entry point
|   |-- database/
|   |   `-- database.sql            # tables and starter data (Sections 9.3 and 9.4)
|   `-- src/
|       |-- config/
|       |   `-- database.php        # database connection
|       |-- controllers/            # receive a request and send back the result
|       |   |-- auth.php
|       |   |-- dashboard.php
|       |   |-- recipes.php
|       |   |-- inventory.php
|       |   |-- stock.php
|       |   |-- categories.php
|       |   `-- users.php
|       |-- helpers/
|       |   |-- quantity.php        # fraction, mixed number and decimal parser
|       |   |-- units.php           # unit conversion to the base unit
|       |   `-- response.php        # standard replies to the frontend
|       |-- middlewares/
|       |   |-- session.php         # checks that the user is logged in
|       |   `-- role.php            # checks that the user may do the action
|       |-- models/                 # database queries, one file for each table
|       |   |-- user.php
|       |   |-- category.php
|       |   |-- ingredient.php
|       |   |-- recipe.php
|       |   |-- recipeingredient.php
|       |   `-- stockmovement.php
|       |-- routes/
|       |   `-- api.php             # connects each request to its controller
|       |-- services/               # the main system logic
|       |   |-- costing.php         # cost, cost per serving and selling price
|       |   |-- inventory.php       # automatic loading of costed ingredients
|       |   `-- stock.php           # use, cook batch, restock and waste
|       `-- validators/             # input checks on the server
|           |-- auth.php
|           |-- user.php
|           |-- recipe.php
|           |-- ingredient.php
|           `-- stock.php
|-- .gitignore
`-- README.md
```

## ⚙️ Installation (XAMPP)

### Requirements
- XAMPP (PHP 8.0+ and MySQL/MariaDB)
- A web browser

### Steps

1. **Install and start XAMPP**
   Open the XAMPP Control Panel and start **Apache** and **MySQL**.

2. **Copy the project**
   Place the `foodcost` folder inside:
   ```
   C:\xampp\htdocs\foodcost
   ```

3. **Create the database**
   - Open `http://localhost/phpmyadmin`
   - Click **Import**, choose `database.sql`, then click **Go**
   (or paste the SQL script in the **SQL** tab).

4. **Configure the connection** in `config/db.php`:
   ```php
   <?php
   $host = "localhost";
   $user = "root";
   $pass = "";            // default XAMPP password is empty
   $db   = "foodcost_db";

   $conn = new mysqli($host, $user, $pass, $db);
   if ($conn->connect_error) {
       die("Connection failed: " . $conn->connect_error);
   }
   $conn->set_charset("utf8mb4");
   ```

5. **Run the system**
   Open `http://localhost/foodcost/login.php` and log in.

---

## 📖 Usage Guide

### A. Costing a recipe or dish
1. Go to the **Costing** tab → **New Recipe**.
2. Enter the recipe name, category, number of servings, other costs, and target food cost %.
3. Add ingredient rows: name, category, quantity needed, unit, and the quantity bought with the price paid. Quantities can be typed as fractions (`1/2`, `1/4`, `3/4`), mixed numbers (`1 1/2`), or decimals.
4. Click **Save**. The system computes the cost and **loads every ingredient into the Inventory**.

### B. Monitoring inventory
1. Go to the **Inventory** tab.
2. See current stock, unit cost, stock value, expiry dates, and low-stock warnings.

### C. Using ingredients
- **Manual:** Inventory → **Use** → select ingredient → enter quantity (e.g., `1/2`, `1/4`, `1/8`, `3/4`) and unit → Submit.
- **Whole recipe:** Costing → open recipe → **Cook Batch** → enter number of batches.

### D. Restocking
Inventory → **Restock** → select ingredient → enter quantity and price paid. Stock increases and the unit cost is re-averaged.

### E. Waste or spoilage
Inventory → **Waste** → select ingredient → enter quantity and reason. Stock is deducted and logged as `waste`.

---

## 🍗 Sample Walkthrough: Chicken Adobo

**Step 1 — Cost the recipe** (Costing tab, 6 servings, other costs ₱20, target food cost 35%)

| Ingredient    | Bought (price paid) | Stored as | Unit cost | Used in recipe | Line cost |
|---------------|---------------------|-----------|-----------|----------------|-----------|
| Chicken       | 2 kg (₱360.00)      | 2000 g    | ₱0.18/g   | 1000 g         | ₱180.00 |
| Soy sauce     | 1 L (₱60.00)        | 1000 ml   | ₱0.06/ml  | 100 ml         | ₱6.00 |
| Vinegar       | 1 L (₱40.00)        | 1000 ml   | ₱0.04/ml  | 100 ml         | ₱4.00 |
| Garlic        | 200 g (₱40.00)      | 200 g     | ₱0.20/g   | 30 g           | ₱6.00 |
| Cooking oil   | 1 L (₱110.00)       | 1000 ml   | ₱0.11/ml  | 30 ml          | ₱3.30 |

- Ingredients subtotal = **₱199.30**
- Other costs (gas, packaging) = **₱20.00**
- Total recipe cost = **₱219.30**
- Cost per serving (÷ 6) ≈ **₱36.55**
- Suggested selling price (35% food cost) ≈ **₱104.43**
- Gross profit per serving ≈ **₱67.88**

**Step 2 — Auto-load to Inventory**

After saving, the Inventory tab shows:

| Ingredient  | Stock  | Unit |
|-------------|--------|------|
| Chicken     | 2000   | g    |
| Soy sauce   | 1000   | ml   |
| Vinegar     | 1000   | ml   |
| Garlic      | 200    | g    |
| Cooking oil | 1000   | ml   |

**Step 3 — Use 1/2 kg of chicken**

Inventory → Use → Chicken → type `1/2` (or `0.5`) → `kg`

| Ingredient | Before | Used  | After |
|------------|--------|-------|-------|
| Chicken    | 2000 g | 500 g | **1500 g** |

A `stock_out` entry is added to the movement log: *"Chicken — 500 g — used by admin."*

**Step 4 — Another food, same system**

Costing *Banana Bread* with flour, sugar, eggs, and bananas works exactly the same way. Using `0.5 kg` of flour subtracts `500 g` from the flour stock. Ingredients shared by several recipes (like eggs or oil) are one inventory item, so their stock is always the combined total.

---

## 🔒 Security Practices

- Use `password_hash()` and `password_verify()` for passwords.
- Use **prepared statements** (`mysqli_prepare` or PDO) to prevent SQL injection.
- Escape output with `htmlspecialchars()` to prevent XSS.
- Start sessions securely and check the user role on every protected page.
- Validate quantities on the server with `parse_quantity()`: accept only fractions, mixed numbers, or decimals greater than 0, and reject division by zero.
- Use database **transactions** when saving a recipe or cooking a batch, so stock is never half-deducted.

Example of safe stock deduction:

```php
$conn->begin_transaction();
try {
    $stmt = $conn->prepare("SELECT stock_qty FROM ingredients WHERE id = ? FOR UPDATE");
    $stmt->bind_param("i", $ingredient_id);
    $stmt->execute();
    $stock = $stmt->get_result()->fetch_assoc()['stock_qty'];

    if ($stock < $qty_base) {
        throw new Exception("Not enough stock.");
    }

    $upd = $conn->prepare("UPDATE ingredients SET stock_qty = stock_qty - ? WHERE id = ?");
    $upd->bind_param("di", $qty_base, $ingredient_id);
    $upd->execute();

    $log = $conn->prepare(
        "INSERT INTO stock_movements (ingredient_id, type, qty, reference, user_id)
         VALUES (?, 'stock_out', ?, ?, ?)"
    );
    $log->bind_param("idsi", $ingredient_id, $qty_base, $reference, $user_id);
    $log->execute();

    $conn->commit();
} catch (Exception $e) {
    $conn->rollback();
    echo $e->getMessage();
}
```

---

## 🚀 Future Improvements

- Per-batch expiry tracking with FIFO stock usage
- Supplier records and purchase orders
- Print/export reports (PDF, Excel)
- Charts for monthly ingredient usage, waste, and cost trends
- Menu and sales module to compare actual food cost vs. sales
- Yield and trim-loss tracking (e.g., whole chicken vs. cleaned meat)
- Barcode scanning for ingredients
- Multi-branch support
