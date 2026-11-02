-- FoodCost database
-- How to use: open phpMyAdmin, choose Import, select this file and click Go.
-- It is safe to run again: existing tables and data are kept.

CREATE DATABASE IF NOT EXISTS foodcost_db
    CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE foodcost_db;

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,              -- password_hash()
    role ENUM('admin','staff') NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- CATEGORIES (used for both ingredients and recipes)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    type ENUM('ingredient','recipe') NOT NULL,
    UNIQUE KEY uniq_cat (name, type)
) ENGINE=InnoDB;

-- INGREDIENTS (this is the inventory)
CREATE TABLE IF NOT EXISTS ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category_id INT DEFAULT NULL,
    base_unit ENUM('g','ml','pcs') NOT NULL,
    stock_qty DECIMAL(12,3) NOT NULL DEFAULT 0,  -- in base unit
    unit_cost DECIMAL(12,5) NOT NULL DEFAULT 0,  -- cost per base unit
    reorder_level DECIMAL(12,3) NOT NULL DEFAULT 0,
    expiry_date DATE DEFAULT NULL,               -- optional, for perishables
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_stock_not_negative CHECK (stock_qty >= 0),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- RECIPES / DISHES
CREATE TABLE IF NOT EXISTS recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INT DEFAULT NULL,
    servings INT NOT NULL DEFAULT 1,
    other_costs DECIMAL(12,2) NOT NULL DEFAULT 0,          -- packaging, labor, gas per batch
    target_food_cost_pct DECIMAL(5,2) NOT NULL DEFAULT 35.00,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- INGREDIENTS USED IN EACH RECIPE
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    qty_needed DECIMAL(12,3) NOT NULL,           -- in base unit
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

-- STARTER CATEGORIES
INSERT IGNORE INTO categories (name, type) VALUES
('Meat & Poultry','ingredient'), ('Seafood','ingredient'), ('Vegetables & Fruits','ingredient'),
('Dairy & Eggs','ingredient'), ('Dry Goods & Grains','ingredient'), ('Condiments & Sauces','ingredient'),
('Oils & Fats','ingredient'), ('Beverages','ingredient'), ('Packaging','ingredient'),
('Main Dish','recipe'), ('Appetizer','recipe'), ('Dessert','recipe'),
('Baked Goods','recipe'), ('Drinks','recipe'), ('Sauces & Sides','recipe');

-- STARTER ADMINISTRATOR
-- username: admin    password: admin123    (change it after the first login)
INSERT IGNORE INTO users (full_name, username, password, role)
VALUES ('Administrator', 'admin',
        '$2y$10$6kRvApGBYXSKrGRa09Hdl.wp/2QdmTeZComPGlPgowQHn0bfaoOai', 'admin');
