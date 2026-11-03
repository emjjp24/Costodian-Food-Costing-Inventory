# 🍽️ FoodCost — Food Costing & Inventory Management System

A free, web-based system for **personal use** and **small food businesses**. It combines **recipe costing** and **ingredient inventory** in one place. Ingredients entered while costing a dish are automatically added to the inventory, and every time ingredients are used, the stock is deducted automatically.

Anyone can **sign up for free** and choose what the account is for: **Personal use** (a home cook, a hobby baker, meal prep) or **Small business** (a home-based seller, a carinderia, a small bakery, a milk tea or food stall). Every account has its own private inventory and recipes.

> **Example:** You cost *Chicken Adobo* and enter chicken, soy sauce, vinegar, garlic, and oil. They are instantly loaded into your inventory. Later you use `1/2 kg` of chicken, and the chicken stock goes down by `500 g`. The same works for a banana bread, a pasta dish, a milk tea, or a sauce.

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
11. [Backend Addresses](#-backend-addresses)
12. [Usage Guide](#-usage-guide)
13. [Sample Walkthrough](#-sample-walkthrough-chicken-adobo)
14. [Security Practices](#-security-practices)
15. [Future Improvements](#-future-improvements)
16. [Author & License](#-author--license)

---

## 📌 Overview

People who cook and sell food often work out the cost of a dish on paper or in their head, and keep track of their stock separately. This leads to wrong prices, wasted ingredients, and surprise shortages. **FoodCost** connects the two:

- The **Costing** tab works out how much a recipe costs to make, and how much to sell it for.
- The **Inventory** tab shows what ingredients are in stock, how much is left, what is about to expire, and what needs restocking.
- Both tabs share the **same ingredient data**, so they never go out of sync.

It is made to be simple: free to sign up, nothing to install for the user except a web browser, and no supplier or point-of-sale setup.

---

## 👥 Who Is It For?

When signing up, a person chooses one of two account types.

| | 🏠 Personal use | 🏪 Small business |
|---|---|---|
| **For** | Home cooks, hobby bakers, meal prep, people who sell food only now and then | Home-based sellers, carinderia, small bakery, milk tea or coffee stall, food stall |
| **Users** | One user (the person who signed up) | The owner (admin) **plus staff** accounts |
| **Costing, inventory, alerts, history** | ✅ | ✅ |
| **Add staff accounts** | ❌ | ✅ |
| **Account name** | The person's own name | The business name |

**Example items:** adobo, sinigang, fried rice, banana bread, cakes, pandesal, cookies, milk tea, smoothies, siomai, party trays, sauces.

Every account has its **own private data**. One person can never see or change another person's ingredients, recipes, or stock history.

---

## ✨ Features

### 🆕 Free Sign Up
- Create an account for free from the sign-up page.
- Choose the account type: **Personal use** or **Small business** (a business also enters its business name).
- The person who signs up is the **administrator** of the new account and is logged in right away.
- Each new account starts with an **empty inventory** and its own set of starter categories (Meat & Poultry, Dairy & Eggs, Main Dish, Dessert, and more).

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
  - How many batches your current stock can still make
- **Auto-load to inventory:** every ingredient entered in costing is automatically created in (or added to) the inventory.

### 📦 Inventory Tab
- View all ingredients with current stock, unit, unit cost, stock value, and expiry date.
- **Use / Deduct stock:** record ingredient usage (e.g., 1/2 kg chicken) and the stock is subtracted automatically.
- **Cook Batch:** deduct all the ingredients of a recipe at once. If even one ingredient is short, nothing is deducted.
- **Restock:** add new purchases; the unit cost is updated using the weighted average.
- **Waste / spoilage:** record spoiled or discarded items so stock stays accurate.
- Low-stock alerts when an ingredient falls to or below its reorder level.
- Expired and near-expiry alerts for perishable ingredients.
- Filter by ingredient category (Meat, Seafood, Vegetables, Dairy, Dry Goods, Condiments, Beverages, Packaging).

### ➗ Fraction, Mixed Number & Decimal Input
- Every quantity field accepts **fractions**, **mixed numbers**, and **decimals**: `1/2`, `1/4`, `1/8`, `3/4`, `1 1/2`, `2.5`.
- Works everywhere a quantity is typed: Costing (quantity needed and quantity bought), Use, Restock, Waste, and the number of batches.
- A live preview shows the decimal value as you type (e.g., `3/4` → `0.75`).
- Invalid entries (`abc`, `1/0`, `-1/2`, `0`) are rejected with a clear error message.

### 🧾 Stock Movement Log
- Every change (stock in, stock out, waste) is recorded with date, quantity, and who did it.
- Full history so you can see where each ingredient went.

### 🔐 Accounts and Users
- Sign up, login, and logout with hashed passwords, and a way to change your own password.
- Roles: **Admin** (the person who signed up, full access) and **Staff** (small business accounts only).
- Staff can cost recipes, use stock, restock, and record waste. Only the admin manages categories and staff accounts, and deletes inventory items.
- A personal account has just one user, so it has no staff.

### 📊 Dashboard
- Total ingredients, total inventory value, out-of-stock, low-stock, expired and near-expiry counts, and number of recipes.
- The items that need attention and the most recent stock movements.

---

## 🛠 Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| Frontend   | HTML5, CSS3, plain JavaScript      |
| Backend    | PHP 8.x (procedural, PDO)          |
| Database   | MySQL / MariaDB                    |
| Server     | Apache via **XAMPP**               |
| Admin tool | phpMyAdmin (bundled with XAMPP)    |

> No frameworks are required. The frontend and backend are separate folders: the pages use plain JavaScript to send requests to the PHP backend, which replies with JSON.

---

## 🔄 How It Works (Core Flow)

```
┌──────────────────────┐
│  SIGN UP (free)      │
│  Personal / Business │
└──────────┬───────────┘
           ▼
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
        Use ingredient    │  (e.g., chicken 1/2 kg)
                          ▼
                ┌────────────────────┐
                │  Stock deducted    │
                │  Movement logged   │
                └────────────────────┘
```

### Rule 0 — Every account is separate
Everything in the system (ingredients, recipes, categories, stock history) belongs to one account. Every request is checked against the logged-in person's account, so nobody can open or change another account's data, even by guessing an id.

### Rule 1 — Costing → Inventory (auto-load)
When an ingredient is saved in a recipe's costing:
1. The system checks if an ingredient with the **same name** already exists in that account's inventory.
2. **If not:** a new inventory item is created with the entered quantity and unit cost. For a new ingredient, the quantity bought and the price paid are required, because otherwise its cost is unknown.
3. **If yes:** the purchased quantity is **added** to the current stock and the unit cost is recalculated (weighted average). An ingredient that is already in the inventory can also be used in a recipe without entering a purchase.
4. A `stock_in` entry is written to the movement log.
5. The purchase counts **only the first time** an ingredient is added to a recipe. Editing and saving the recipe again never adds the stock twice. To add more stock later, use **Restock**.

### Rule 2 — Using ingredients → Inventory (auto-deduct)
When ingredients are used:
- **Manual use:** in the Inventory tab, choose an ingredient and enter the quantity used (e.g., `1/2 kg` chicken).
- **Cook / Produce a batch:** on a recipe, press **"Cook Batch"** to deduct *all* of that recipe's ingredients (× number of batches) at once.
- The system converts units to the ingredient's base unit, subtracts the amount, and logs a `stock_out` entry.
- If the stock is not enough, the action is **blocked** with an error message, and nothing is deducted.

### Rule 3 — Units
All quantities are stored in a **base unit** to avoid rounding errors:

| You enter | Stored as |
|-----------|-----------|
| kg        | g (× 1000) |
| g         | g          |
| L         | ml (× 1000) |
| ml        | ml         |
| pcs / dozen | pcs (dozen × 12) |

So `1/2 kg` of chicken is stored and deducted as `500 g`. An ingredient keeps its unit family: chicken stored in grams cannot be used in liters.

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

**How the system handles a typed quantity**

1. The quantity box is a **text** field, not a number-only field, because number fields do not allow the `/` character.
2. While the user types, a live preview (`frontend/src/utils/fractions.js`) shows the decimal value, for example `3/4` → `0.75`. The preview is only a convenience.
3. When the form is sent, the backend converts the text into a decimal number (`backend/src/helpers/quantity.php`). A mixed number is a whole number plus a fraction (`1 1/2` = 1 + 1/2 = 1.5). A fraction with `0` at the bottom, a negative value, zero, or anything that is not a number is rejected.
4. The decimal number is then converted to the ingredient's base unit (`backend/src/helpers/units.php`), for example 0.5 kg → 500 g.

> The check on the server is the one that counts. The preview in the browser can be bypassed, so it is never trusted.

### Rule 5 — Perishables
Ingredients can have an **expiry date**. The inventory flags items that are expired or expire within a set number of days (default: 3), so food is used before it spoils.

### Rule 6 — Alerts
| Alert | When it shows |
|-------|---------------|
| Out of stock | Stock is 0 |
| Low stock | A reorder level is set and the stock is at or below it |
| Expired | The expiry date has passed |
| Expiring soon | The expiry date is within the next 3 days |

---

## 🧮 Costing Formulas

| Quantity | Formula | Example |
|----------|---------|---------|
| Unit cost (per base unit) | price paid ÷ quantity bought (in the base unit) | ₱360 for 2 kg of chicken → 360 ÷ 2000 g = ₱0.18 per g |
| Ingredient cost in a recipe | quantity used × unit cost | 1000 g × ₱0.18 = ₱180.00 |
| Total recipe cost | sum of all ingredient costs + other costs (packaging, labor, gas) | ₱199.30 + ₱20.00 = ₱219.30 |
| Cost per serving | total cost ÷ number of servings | ₱219.30 ÷ 6 = ₱36.55 |
| Suggested selling price | cost per serving ÷ (target food cost % ÷ 100) | ₱36.55 ÷ 0.35 = ₱104.43 |
| Food cost % (for any selling price) | (cost per serving ÷ selling price) × 100 | (36.55 ÷ 104.43) × 100 = 35% |
| Gross profit per serving | selling price − cost per serving | ₱104.43 − ₱36.55 = ₱67.88 |
| Weighted average cost on restock | ((current stock × current unit cost) + (added quantity × purchase unit cost)) ÷ (current stock + added quantity) | Used to update the unit cost whenever stock is added |

---

## 🗂 System Modules / Pages

| Page | Frontend page (`frontend/src/pages/`) | Backend controller (`backend/src/controllers/`) | Description |
|------|---------------------------------------|--------------------------------------------------|-------------|
| Login | `frontend/index.html` | `auth.php` | User authentication |
| Sign up | `signup.html` | `auth.php` | Free sign up: choose Personal or Small business |
| Dashboard | `dashboard.html` | `dashboard.php` | Summary cards, alerts and recent activity |
| Recipes list | `recipes.html` | `recipes.php` | All recipes/dishes with total cost |
| Add / edit recipe | `recipe-form.html` | `recipes.php` | Recipe details and ingredient rows |
| Recipe details | `recipe-view.html` | `recipes.php`, `stock.php` | Cost breakdown, food cost %, selling price, **Cook Batch** |
| Inventory list | `inventory.html` | `inventory.php` | Stock, unit cost, value, low-stock and expiry flags |
| Edit ingredient | `ingredient-form.html` | `inventory.php` | Category, reorder level and expiry date |
| Use stock | `use-stock.html` | `stock.php` | Deduct ingredient quantity |
| Restock | `restock.html` | `stock.php` | Add purchased quantity |
| Waste / spoilage | `waste.html` | `stock.php` | Record discarded stock |
| Movement log | `movements.html` | `stock.php` | History of all stock changes |
| Categories (admin) | `categories.html` | `categories.php` | Manage ingredient and recipe categories |
| Users (admin, business accounts) | `users.html` | `users.php` | Manage staff accounts |
| Logout | Logout button in the navigation bar | `auth.php` | End session |

---

## 🗄 Database Design

**Database name:** `foodcost_db`

### Entity Relationship (simplified)

```
accounts ──┬──► users
           ├──► categories ──► ingredients ◄── recipe_ingredients ──► recipes ◄── categories
           ├──► ingredients                         
           └──► recipes
                   ingredients ◄────── stock_movements
```

Every account owns its users, categories, ingredients, and recipes. Stock movements belong to an ingredient, so they belong to its account too.

### Tables

The script `backend/database/database.sql` creates the following tables and loads the starter data.

**`accounts`**: one for every person or business that signs up

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key, automatic |
| `name` | VARCHAR(100) | The business name, or the person's name for a personal account |
| `type` | personal / business | The account type chosen at sign up |
| `created_at` | TIMESTAMP | When the account was created |

**`users`**: user accounts

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key, automatic |
| `account_id` | INT | The account the user belongs to |
| `full_name` | VARCHAR(100) | Full name of the user |
| `username` | VARCHAR(50) | Login name, must be unique for everyone |
| `password` | VARCHAR(255) | Stored as a hash, never as plain text |
| `role` | admin / staff | Access level (default: staff) |
| `created_at` | TIMESTAMP | When the user was created |

**`categories`**: categories for both ingredients and recipes

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key, automatic |
| `account_id` | INT | The account that owns the category |
| `name` | VARCHAR(80) | Category name |
| `type` | ingredient / recipe | What the category is used for. The same name cannot be used twice for the same type in one account. |

**`ingredients`**: the inventory (one row for each ingredient)

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key, automatic |
| `account_id` | INT | The account that owns the ingredient |
| `name` | VARCHAR(100) | Ingredient name, must be unique inside the account |
| `category_id` | INT | Category of the ingredient (optional) |
| `base_unit` | g / ml / pcs | The unit in which the ingredient is stored |
| `stock_qty` | DECIMAL(12,3) | Amount in stock, in the base unit. It can never be negative |
| `unit_cost` | DECIMAL(12,5) | Cost for one base unit |
| `reorder_level` | DECIMAL(12,3) | Stock level at or below which the low-stock alert appears |
| `expiry_date` | DATE | Expiry date (optional, for perishables) |
| `updated_at` | TIMESTAMP | Updated automatically on every change |

**`recipes`**: dishes and their costing settings

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key, automatic |
| `account_id` | INT | The account that owns the recipe |
| `name` | VARCHAR(100) | Recipe or dish name |
| `category_id` | INT | Category of the recipe (optional) |
| `servings` | INT | Number of servings the recipe makes (default: 1) |
| `other_costs` | DECIMAL(12,2) | Packaging, labor and gas for one batch (default: 0) |
| `target_food_cost_pct` | DECIMAL(5,2) | Target food cost percentage (default: 35.00) |
| `notes` | TEXT | Optional notes |
| `created_by` | INT | The user who created the recipe |
| `created_at` | TIMESTAMP | When the recipe was created |

**`recipe_ingredients`**: the ingredients of each recipe

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key, automatic |
| `recipe_id` | INT | The recipe. Its rows are deleted together with the recipe. |
| `ingredient_id` | INT | The ingredient. An ingredient used in a recipe cannot be deleted. |
| `qty_needed` | DECIMAL(12,3) | Quantity needed, in the base unit |

**`stock_movements`**: history of every stock change

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key, automatic |
| `ingredient_id` | INT | The ingredient that changed |
| `type` | stock_in / stock_out / waste / adjustment | Kind of change |
| `qty` | DECIMAL(12,3) | Quantity changed, in the base unit |
| `unit_cost` | DECIMAL(12,5) | Cost for one base unit at that time (optional) |
| `reference` | VARCHAR(150) | Reason or source, for example "Costing: Chicken Adobo" |
| `user_id` | INT | The user who made the change |
| `created_at` | TIMESTAMP | When the change was made |

### Starter Data

- **A demo account** ("FoodCost Demo", a small business account) with one administrator, the username `admin`. Its password is stored as a hash and should be changed after the first login.
- **Starter categories**, which every new account also receives when it signs up:
  - Ingredient categories: Meat & Poultry, Seafood, Vegetables & Fruits, Dairy & Eggs, Dry Goods & Grains, Condiments & Sauces, Oils & Fats, Beverages, Packaging.
  - Recipe categories: Main Dish, Appetizer, Dessert, Baked Goods, Drinks, Sauces & Sides.

---

## 📁 Folder Structure

```

frontend/
   |-- index.html                  # entry page: login
   `-- src/
       |-- api/                    # calls to the backend
       |   |-- client.js           # shared request helper
       |   |-- auth.js
       |   |-- dashboard.js
       |   |-- recipes.js
       |   |-- inventory.js
       |   |-- stock.js
       |   |-- categories.js
       |   `-- users.js
       |-- assets/
       |   |-- css/
       |   |   `-- style.css
       |   `-- img/
       |-- components/             # reusable parts of a page
       |   |-- navbar.js           # Costing and Inventory tabs
       |   |-- footer.js
       |   `-- alert.js
       |-- pages/                  # one page for each screen
       |   |-- signup.html
       |   |-- dashboard.html
       |   |-- recipes.html
       |   |-- recipe-form.html
       |   |-- recipe-view.html
       |   |-- inventory.html
       |   |-- ingredient-form.html
       |   |-- use-stock.html
       |   |-- restock.html
       |   |-- waste.html
       |   |-- movements.html
       |   |-- categories.html
       |   `-- users.html
       |-- utils/
       |   |-- format.js           # peso and date formatting
       |   `-- fractions.js        # live preview of 1/2, 3/4, 1 1/2
       |-- validators/             # form checks before sending
       |   |-- login.js
       |   |-- signup.js
       |   |-- recipe.js
       |   `-- quantity.js
       `-- main.js                 # shared startup script
backend/
   |-- index.php                   # single entry point
   |-- .htaccess                   # short addresses (backend/auth/login)
   |-- database/
   |   |-- database.sql            # tables and starter data
   |   `-- .htaccess               # blocks opening this folder from the browser
   `-- src/
       |-- .htaccess               # blocks opening this folder from the browser
       |-- config/
       |   `-- database.php        # database connection
       |-- controllers/            # receive a request and send back the result
       |   |-- auth.php            # sign up, login, logout, change password
       |   |-- dashboard.php
       |   |-- recipes.php
       |   |-- inventory.php
       |   |-- stock.php
       |   |-- categories.php
       |   `-- users.php
       |-- helpers/
       |   |-- quantity.php        # fraction, mixed number and decimal parser
       |   |-- units.php           # unit conversion to the base unit
       |   `-- response.php        # standard replies to the frontend
       |-- middlewares/
       |   |-- session.php         # checks that the user is logged in
       |   `-- role.php            # checks that the user may do the action
       |-- models/                 # database queries, one file for each table
       |   |-- account.php
       |   |-- user.php
       |   |-- category.php
       |   |-- ingredient.php
       |   |-- recipe.php
       |   |-- recipeingredient.php
       |   `-- stockmovement.php
       |-- routes/
       |   `-- api.php             # connects each request to its controller
       |-- services/               # the main system logic
       |   |-- costing.php         # cost, cost per serving, selling price, saving a recipe
       |   |-- inventory.php       # automatic loading of costed ingredients
       |   `-- stock.php           # use, cook batch, restock and waste
       `-- validators/             # input checks on the server
           |-- auth.php
           |-- user.php
           |-- recipe.php
           |-- ingredient.php
           `-- stock.php
 .gitignore
 README.md
```

---

## ⚙️ Installation (XAMPP)

### Requirements
- XAMPP (PHP 8.0+ and MySQL/MariaDB)
- A web browser

### Steps

1. **Install and start XAMPP**
   Open the XAMPP Control Panel and start **Apache** and **MySQL**.

2. **Copy the project**
   Place the project folder inside the XAMPP web folder (`C:\xampp\htdocs\`).
   > 💡 **Tip:** the folder name becomes part of the address. A short name such as `foodcost` gives short addresses, for example `http://localhost/foodcost/backend/auth/login`.

3. **Create the database**
   - Open `http://localhost/phpmyadmin`
   - Click **New**, type the name `foodcost_db`, and create it.
   - Click `foodcost_db` in the left list to select it.
   - Click **Import**, choose `backend/database/database.sql`, then click **Go**.

   The script creates all the tables and the starter data. It is safe to import again.

   > ⚠️ **If you imported an older version of `database.sql` before** (the one without accounts), delete its tables first: select `foodcost_db`, tick all the tables, choose **Drop**, then import the new file. This removes the old test data.

4. **Check the connection settings** in `backend/src/config/database.php`
   The system connects to MySQL using PDO. Make sure the settings match your XAMPP:
   - Server: `localhost`
   - Username: `root`
   - Password: empty (the XAMPP default)
   - Database name: `foodcost_db`

5. **Check that the backend runs**
   Open `http://localhost/foodcost/backend/auth/me` in the browser (use your own folder name). You should see `Please login first.` That means Apache, PHP, and the database are working.

6. **Run the system**
   Open `http://localhost/foodcost/frontend/index.html`. Click **Sign up** to make your own account, or log in with the demo account (`admin`, then change its password).

---

## 🔗 Backend Addresses

The frontend talks to the backend through short addresses. The reply is always JSON with three parts: `success` (true or false), `message` (text to show the user), and `data` (the result).

Example address: `http://localhost/foodcost/backend/inventory/list`

| Group | Addresses |
|-------|-----------|
| Account | `auth/register`, `auth/login`, `auth/logout`, `auth/me`, `auth/password` |
| Dashboard | `dashboard/summary` |
| Recipes | `recipes/list`, `recipes/view`, `recipes/create`, `recipes/update`, `recipes/delete` |
| Inventory | `inventory/list`, `inventory/view`, `inventory/update`, `inventory/delete` |
| Stock | `stock/use`, `stock/cook`, `stock/restock`, `stock/waste`, `stock/movements` |
| Categories | `categories/list`, `categories/create`, `categories/update`, `categories/delete` |
| Users | `users/list`, `users/create`, `users/update`, `users/delete` |

The long form `backend/index.php?route=inventory/list` also works. The full list of fields each address expects is written at the top of `backend/src/routes/api.php`, and `test.http` has ready-made requests for testing the backend without the frontend.

---

## 📖 Usage Guide

### A. Signing up
1. Open the sign-up page.
2. Enter your full name, a username, and a password.
3. Choose **Personal use** or **Small business**. A small business also enters its business name.
4. Click **Sign up**. You are logged in and see an empty dashboard.

### B. Costing a recipe or dish
1. Go to the **Costing** tab → **New Recipe**.
2. Enter the recipe name, category, number of servings, other costs, and target food cost %.
3. Add ingredient rows: name, category, quantity needed, unit, and the quantity bought with the price paid. Quantities can be typed as fractions (`1/2`, `1/4`, `3/4`), mixed numbers (`1 1/2`), or decimals.
4. Click **Save**. The system computes the cost and **loads every ingredient into the Inventory**.

### C. Monitoring inventory
1. Go to the **Inventory** tab.
2. See current stock, unit cost, stock value, expiry dates, and low-stock warnings.
3. Edit an ingredient to set its category, reorder level, and expiry date.

### D. Using ingredients
- **Manual:** Inventory → **Use** → select ingredient → enter quantity (e.g., `1/2`, `1/4`, `1/8`, `3/4`) and unit → Submit.
- **Whole recipe:** Costing → open recipe → **Cook Batch** → enter number of batches.

### E. Restocking
Inventory → **Restock** → select ingredient → enter quantity and price paid. Stock increases and the unit cost is re-averaged.

### F. Waste or spoilage
Inventory → **Waste** → select ingredient → enter quantity and reason. Stock is deducted and logged as `waste`.

### G. Adding staff (small business accounts only)
Users → **Add user** → enter name, username, password, and role. A personal account has only one user, so this page does not apply to it.

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

Costing *Banana Bread* with flour, sugar, eggs, and bananas works exactly the same way. Using `1/2 kg` of flour subtracts `500 g` from the flour stock. Ingredients shared by several recipes (like eggs or oil) are one inventory item, so their stock is always the combined total.

---

## 🔒 Security Practices

- Use `password_hash()` and `password_verify()` for passwords.
- Use **PDO prepared statements** with named placeholders (`:name`) to prevent SQL injection.
- Keep every account's data **separate**: every database query is limited to the logged-in person's account.
- Check the user's role on the server for every protected action. Hiding a button in the page is not security.
- Escape output with `htmlspecialchars()` (or by setting text safely in JavaScript) to prevent XSS.
- Start sessions securely: a new session id after login and sign up, and a cookie that JavaScript cannot read.
- Validate every input on the server: lengths, quantities, units, and dates. Accept only fractions, mixed numbers, or decimals greater than 0, and reject division by zero.
- Use database **transactions** when saving a recipe, cooking a batch, or signing up, so data is never half-saved.
- Block direct browser access to the `src` and `database` folders.
- Show users only friendly error messages. Technical details go to the server log.

### How a safe stock deduction works

Handled in `backend/src/services/stock.php`:

1. Start a database transaction.
2. Lock the ingredient's row and read its current stock.
3. If the stock is less than the quantity to use, stop and show "Not enough stock."
4. Subtract the quantity from the stock.
5. Write a `stock_out` entry in the stock movement history.
6. Save both changes together. If anything fails along the way, undo everything (roll back), so the stock is never half-deducted.

---

## 🚀 Future Improvements

- Password reset and email verification for new accounts
- Limits against fake or repeated sign ups
- Per-batch expiry tracking with FIFO stock usage
- Supplier records and purchase orders
- Print/export reports (PDF, Excel)
- Charts for monthly ingredient usage, waste, and cost trends
- Sales records to compare actual food cost with real sales
- Yield and trim-loss tracking (e.g., whole chicken vs. cleaned meat)
- Barcode scanning for ingredients
