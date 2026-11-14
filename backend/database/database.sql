-- FoodCost database
-- How to use: open phpMyAdmin, choose Import, select this file and click Go.
-- It is safe to run again: existing tables and data are kept.
-- NOTE: this version has accounts (sign up). If you imported the older version
-- before, drop its tables first (phpMyAdmin > foodcost_db > select all tables > Drop)
-- and then import this file.

CREATE DATABASE IF NOT EXISTS foodcost_db
    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE foodcost_db;

-- ACCOUNTS (one for every person or small business that signs up)
CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,                  -- the business name, or the person's name
    type ENUM('personal','business') NOT NULL DEFAULT 'personal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- USERS (belong to one account)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,              -- password_hash()
    role ENUM('admin','staff') NOT NULL DEFAULT 'staff',
    is_active TINYINT(1) NOT NULL DEFAULT 1,     -- 0 = turned off: cannot log in, history is kept
    last_login_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- CATEGORIES (used for both ingredients and recipes, every account has its own)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    name VARCHAR(80) NOT NULL,
    type ENUM('ingredient','recipe') NOT NULL,
    UNIQUE KEY uniq_cat (account_id, name, type),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- INGREDIENTS (this is the inventory)
CREATE TABLE IF NOT EXISTS ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    category_id INT DEFAULT NULL,
    base_unit ENUM('g','ml','pcs') NOT NULL,
    stock_qty DECIMAL(12,3) NOT NULL DEFAULT 0,  -- in base unit
    unit_cost DECIMAL(12,5) NOT NULL DEFAULT 0,  -- cost per base unit
    reorder_level DECIMAL(12,3) NOT NULL DEFAULT 0,
    expiry_date DATE DEFAULT NULL,               -- optional, for perishables
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_ingredient (account_id, name),
    CONSTRAINT chk_stock_not_negative CHECK (stock_qty >= 0),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- RECIPES / DISHES
CREATE TABLE IF NOT EXISTS recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    category_id INT DEFAULT NULL,
    servings INT NOT NULL DEFAULT 1,
    other_costs DECIMAL(12,2) NOT NULL DEFAULT 0,          -- packaging, labor, gas per batch
    target_food_cost_pct DECIMAL(5,2) NOT NULL DEFAULT 35.00,
    markup_pct DECIMAL(7,2) DEFAULT NULL,                  -- optional: the owner's own markup on the cost (25, 50, 33.5 ...)
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- INGREDIENTS USED IN EACH RECIPE
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    qty_needed DECIMAL(12,3) NOT NULL,           -- in base unit
    bought_qty DECIMAL(12,3) DEFAULT NULL,       -- what was bought for this line (base unit), so it can be edited later
    bought_price DECIMAL(12,2) DEFAULT NULL,     -- the price paid for bought_qty
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- STOCK MOVEMENT HISTORY
CREATE TABLE IF NOT EXISTS stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ingredient_id INT NOT NULL,
    type ENUM('stock_in','stock_out','waste','adjustment') NOT NULL,
    qty DECIMAL(12,3) NOT NULL,                  -- in base unit
    unit_cost DECIMAL(12,5) DEFAULT NULL,
    reference VARCHAR(150),                      -- e.g. "Costing: Chicken Adobo"
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_movements_created (created_at),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- STARTER DEMO ACCOUNT (account 1) with its categories
-- New accounts that sign up get their own copy of these categories automatically.
INSERT IGNORE INTO accounts (id, name, type) VALUES (1, 'FoodCost Demo', 'business');

INSERT IGNORE INTO categories (account_id, name, type) VALUES
(1,'Meat & Poultry','ingredient'), (1,'Seafood','ingredient'), (1,'Vegetables & Fruits','ingredient'),
(1,'Dairy & Eggs','ingredient'), (1,'Dry Goods & Grains','ingredient'), (1,'Condiments & Sauces','ingredient'),
(1,'Oils & Fats','ingredient'), (1,'Beverages','ingredient'), (1,'Packaging','ingredient'),
(1,'Main Dish','recipe'), (1,'Appetizer','recipe'), (1,'Dessert','recipe'),
(1,'Baked Goods','recipe'), (1,'Drinks','recipe'), (1,'Sauces & Sides','recipe');

-- STARTER ADMINISTRATOR of the demo account
-- username: admin    password: admin123    (change it after the first login)
INSERT IGNORE INTO users (account_id, full_name, username, password, role)
VALUES (1, 'Administrator', 'admin',
        '$2y$10$6kRvApGBYXSKrGRa09Hdl.wp/2QdmTeZComPGlPgowQHn0bfaoOai', 'admin');