# Costodian: Food Costing and Inventory Management System

## Overview

Costodian is a web-based application for home cooks and small food businesses. It calculates recipe costs, suggests selling prices, manages ingredient inventory, records stock movements, and provides alerts for low stock and expiry dates.

The system combines recipe costing and inventory management in a single account. Recipes, ingredients, categories, stock history, and staff access are kept separate for each account.

## Main Functions

- Register and log in to personal or business accounts
- Manage user profiles and passwords
- Create, update, and delete recipes
- Calculate batch cost, cost per serving, and suggested selling price
- Manage ingredients, categories, reorder levels, and expiry dates
- Record stock use, restocking, waste, and batch cooking
- View stock movement history and filter transactions
- Monitor low-stock, out-of-stock, expired, and near-expiry items
- Manage staff accounts in business accounts
- Switch between light and dark themes

## User Roles

### Administrator

The administrator manages recipes, inventory, categories, account settings, and staff accounts for a business account.

### Staff

Staff users may view shared account information and perform permitted operations, including stock use, restocking, waste recording, and cooking batches.

### Personal Account

A personal account is intended for home cooking and personal meal preparation. It has one user and does not include staff management.

### Business Account

A business account is intended for small food businesses. It has one administrator and may include up to ten staff accounts.

## System Modules

| Module | Description |
|---|---|
| Landing Page | Provides project information and links to login and registration |
| Authentication | Registers accounts, authenticates users, and manages sessions |
| Dashboard | Displays inventory totals, alerts, and recent movements |
| Recipes | Creates and maintains recipes and their costing details |
| Inventory | Maintains ingredient quantities, costs, reorder levels, and expiry dates |
| Stock Operations | Records use, restocking, waste, and batch cooking |
| Movement History | Displays and filters stock transactions |
| Categories | Organizes ingredient and recipe categories |
| Staff Management | Creates and maintains business-account staff |
| Profile | Updates account and user information |

## Costing and Stock Handling

Recipe cost is calculated from ingredient quantities and purchase prices. Additional batch expenses are included in the total batch cost. The cost per serving is obtained by dividing the batch cost by the number of servings.

The suggested selling price is based on the cost per serving and the target food cost percentage. The system also calculates gross profit per serving and shows the number of batches supported by available inventory.

Stock quantities are stored in:

| Entered Unit | Base Unit |
|---|---|
| Kilogram | Gram |
| Gram | Gram |
| Liter | Milliliter |
| Milliliter | Milliliter |
| Piece | Piece |
| Dozen | Piece |

The quantity input accepts whole numbers, decimals, fractions, and mixed numbers. Invalid quantities and units are rejected by server-side validation.

When a recipe batch is cooked, the system checks all required ingredients before any stock is deducted. Restocking may update ingredient cost using the weighted average of existing and newly purchased stock.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | PHP 8 or newer |
| Database | MySQL or MariaDB |
| Database Access | PDO |
| Web Server | Apache |
| Local Environment | XAMPP |
| Database Management | phpMyAdmin |

The project does not require a frontend framework, JavaScript package manager, or PHP framework.

## Requirements

Install the following before running the project:

- A 64-bit or 32-bit Windows computer
- XAMPP with Apache, PHP 8.0 or newer, and MySQL or MariaDB
- A modern web browser such as Chrome, Edge, or Firefox
- At least 200 MB of available storage
- Write access to the XAMPP installation folder

Apache and MySQL must be running whenever the application is used.

### Installing XAMPP

1. Download XAMPP from Apache Friends.
2. Run the XAMPP installer.
3. Select Apache, MySQL, and PHP components.
4. Complete the installation using the default settings.
5. Open the XAMPP Control Panel.
6. Start Apache and MySQL.

If Apache or MySQL fails to start, close applications that are using ports 80 or 3306 and start them again.

### Installing the Project

1. Download or clone the project from GitHub.
2. Copy the `Costodian-Food-Costing-Inventory` folder into `C:\xampp\htdocs\`.
3. Keep MySQL running in the XAMPP Control Panel.
4. Open `http://localhost/phpmyadmin`.
5. Select **Import**.
6. Choose `backend/database/database.sql`.
7. Select **Go** to create the database and starter data.

The database name is `foodcost_db`. The database configuration is defined in `backend/src/config/database.php` and uses the following XAMPP defaults:

- Host: `localhost`
- Username: `root`
- Password: empty
- Database: `foodcost_db`

### Running the Application

Open the following address in a web browser:

`http://localhost/Costodian-Food-Costing-Inventory/`

The page redirects to the landing page. Use the Login or Sign Up link to access the system.

## Default Demo Account

| Field | Value |
|---|---|
| Username | admin |
| Password | admin123 |

Change the demo password after the first login.

## Project Structure

```text
Costodian-Food-Costing-Inventory/
|-- index.html
|-- README.md
|-- links.txt
|-- backend/
|   |-- index.php
|   |-- database/
|   |   `-- database.sql
|   |-- test/
|   |   |-- SETUP_SIGNUP_BACKEND.txt
|   |   |-- test.http
|   |   |-- test_signup.http
|   |   |-- test_staff.http
|   |   `-- test_staff_existing_joy.http
|   `-- src/
|       |-- config/
|       |   `-- database.php
|       |-- controllers/
|       |   |-- auth.php
|       |   |-- categories.php
|       |   |-- dashboard.php
|       |   |-- inventory.php
|       |   |-- recipes.php
|       |   |-- register.php
|       |   |-- staff.php
|       |   `-- users.php
|       |-- helpers/
|       |   |-- quantity.php
|       |   |-- response.php
|       |   `-- units.php
|       |-- middlewares/
|       |   |-- role.php
|       |   `-- session.php
|       |-- models/
|       |   |-- account.php
|       |   |-- category.php
|       |   |-- ingredient.php
|       |   |-- recipe.php
|       |   |-- recipeingredient.php
|       |   |-- signup.php
|       |   |-- stockmovement.php
|       |   `-- user.php
|       |-- routes/
|       |   `-- api.php
|       |-- services/
|       |   |-- costing.php
|       |   |-- inventory.php
|       |   `-- stock.php
|       `-- validators/
|           |-- auth.php
|           |-- ingredient.php
|           |-- recipe.php
|           |-- signup.php
|           |-- stock.php
|           `-- user.php
`-- frontend/
    |-- index.html
    |-- landing.html
    |-- SETUP_FRONTEND.txt
    `-- src/
        |-- api/
        |   |-- auth.js
        |   |-- client.js
        |   |-- dashboard.js
        |   |-- inventory.js
        |   |-- movements.js
        |   |-- profile.js
        |   |-- recipes.js
        |   `-- staff.js
        |-- assets/
        |   |-- css/
        |   |   |-- app-navigation.css
        |   |   |-- base.css
        |   |   |-- components.css
        |   |   |-- dashboard.css
        |   |   |-- forms.css
        |   |   |-- header.css
        |   |   |-- inventory-waste.css
        |   |   |-- inventory.css
        |   |   |-- landing.css
        |   |   |-- layout.css
        |   |   |-- markup.css
        |   |   |-- movements.css
        |   |   |-- notif-center.css
        |   |   |-- order-calc.css
        |   |   |-- profile.css
        |   |   |-- recipes.css
        |   |   |-- settings-extras.css
        |   |   |-- sidebar.css
        |   |   |-- staff-view.css
        |   |   |-- staff.css
        |   |   |-- style.css
        |   |   |-- tables.css
        |   |   `-- variables.css
        |   |-- images/
        |   |   |-- account.png
        |   |   |-- add.png
        |   |   |-- consumption.png
        |   |   |-- food.png
        |   |   `-- logo.png
        |   `-- js/
        |       |-- auth-guard.js
        |       |-- dashboard-draw.js
        |       |-- dashboard-helpers.js
        |       |-- dashboard-page.js
        |       |-- inventory-draw.js
        |       |-- inventory-forms.js
        |       |-- inventory-helpers.js
        |       |-- inventory-page.js
        |       |-- inventory-waste.js
        |       |-- markup-select.js
        |       |-- movements-helpers.js
        |       `-- movements-page.js
        |-- pages/
        |   |-- dashboard.html
        |   |-- inventory.html
        |   |-- movements.html
        |   |-- profile.html
        |   |-- recipes.html
        |   |-- signup.html
        |   `-- staff.html
        `-- validators/
            |-- inventory.js
            |-- login.js
            |-- recipe.js
            `-- signup.js
```

### Folder Descriptions

| Folder | Description |
|---|---|
| `backend/database` | SQL file used to create the database |
| `backend/src/config` | Database connection settings |
| `backend/src/controllers` | Request handling for application modules |
| `backend/src/helpers` | Quantity, unit, and response utilities |
| `backend/src/middlewares` | Authentication and role authorization |
| `backend/src/models` | Database operations for system records |
| `backend/src/routes` | API route definitions |
| `backend/src/services` | Costing, inventory, and stock operations |
| `backend/src/validators` | Server-side input validation |
| `frontend/src/api` | Frontend API request modules |
| `frontend/src/assets` | Stylesheets, images, and shared JavaScript |
| `frontend/src/pages` | Application interface pages |
| `frontend/src/validators` | Frontend form validation |
| `backend/test` | HTTP request examples for backend testing |

## Database

The database name is `foodcost_db`. It contains accounts, users, categories, ingredients, recipes, recipe ingredients, and stock movements.

The database maintains account separation and relationships among recipes, ingredients, users, and stock transactions.
