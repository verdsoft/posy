/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: adjustment_items
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `adjustment_items` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `adjustment_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `quantity` decimal(10, 2) NOT NULL,
  `type` enum('addition', 'subtraction') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `pre_stock` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `adjustment_id` (`adjustment_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `adjustment_items_ibfk_1` FOREIGN KEY (`adjustment_id`) REFERENCES `adjustments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `adjustment_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: adjustments
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `adjustments` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `reference` varchar(100) NOT NULL,
  `warehouse_id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `type` enum('addition', 'subtraction') NOT NULL,
  `notes` text,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `warehouse_id` (`warehouse_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `adjustments_ibfk_1` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `adjustments_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE
  SET
  NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: attendance
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `attendance` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `employee_id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `time_in` time DEFAULT NULL,
  `time_out` time DEFAULT NULL,
  `break_time` int DEFAULT '0',
  `total_hours` decimal(4, 2) DEFAULT '0.00',
  `status` enum('present', 'absent', 'late', 'half_day') DEFAULT 'present',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_employee_date` (`employee_id`, `date`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: brands
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `brands` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `description` text,
  `image` varchar(500) DEFAULT NULL,
  `status` enum('active', 'inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: categories
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `categories` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `status` enum('active', 'inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: companies
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `companies` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `tax_number` varchar(100) DEFAULT NULL,
  `logo` varchar(500) DEFAULT NULL,
  `status` enum('active', 'inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: currencies
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `currencies` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `code` varchar(10) NOT NULL,
  `name` varchar(255) NOT NULL,
  `symbol` varchar(10) NOT NULL,
  `exchange_rate` decimal(10, 4) DEFAULT '1.0000',
  `status` enum('active', 'inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: customers
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `customers` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `tax_number` varchar(100) DEFAULT NULL,
  `credit_limit` decimal(10, 2) DEFAULT '0.00',
  `total_sales` decimal(10, 2) DEFAULT '0.00',
  `total_paid` decimal(10, 2) DEFAULT '0.00',
  `total_due` decimal(10, 2) DEFAULT '0.00',
  `status` enum('active', 'inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: departments
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `departments` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `company_id` varchar(36) DEFAULT NULL,
  `description` text,
  `status` enum('active', 'inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE
  SET
  NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: employees
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `employees` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `employee_id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `department_id` varchar(36) DEFAULT NULL,
  `shift_id` varchar(36) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `salary` decimal(10, 2) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `address` text,
  `status` enum('active', 'inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  KEY `department_id` (`department_id`),
  KEY `shift_id` (`shift_id`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE
  SET
  NULL,
  CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`shift_id`) REFERENCES `office_shifts` (`id`) ON DELETE
  SET
  NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: expense_categories
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `expense_categories` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `description` text,
  `status` enum('active', 'inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: expenses
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `expenses` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `reference` varchar(100) NOT NULL,
  `category_id` varchar(36) DEFAULT NULL,
  `amount` decimal(10, 2) NOT NULL,
  `date` date NOT NULL,
  `description` text,
  `attachment` varchar(500) DEFAULT NULL,
  `status` enum('pending', 'approved', 'rejected') DEFAULT 'pending',
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `category_id` (`category_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `expense_categories` (`id`) ON DELETE
  SET
  NULL,
  CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE
  SET
  NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: holidays
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `holidays` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `description` text,
  `status` enum('active', 'inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: leave_requests
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `leave_requests` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `employee_id` varchar(36) NOT NULL,
  `leave_type_id` varchar(36) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `days` int NOT NULL,
  `reason` text,
  `status` enum('pending', 'approved', 'rejected') DEFAULT 'pending',
  `approved_by` varchar(36) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `leave_type_id` (`leave_type_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `leave_requests_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `leave_requests_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE
  SET
  NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: leave_types
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `leave_types` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `days_allowed` int DEFAULT '0',
  `status` enum('active', 'inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: office_shifts
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `office_shifts` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` enum('active', 'inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: products
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `products` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `code` varchar(100) NOT NULL,
  `barcode` varchar(255) DEFAULT NULL,
  `category_id` varchar(36) DEFAULT NULL,
  `brand_id` varchar(36) DEFAULT NULL,
  `unit_id` varchar(36) DEFAULT NULL,
  `warehouse_id` varchar(36) DEFAULT NULL,
  `cost` decimal(10, 2) NOT NULL DEFAULT '0.00',
  `price` decimal(10, 2) NOT NULL DEFAULT '0.00',
  `stock` decimal(10, 2) NOT NULL DEFAULT '0.00',
  `alert_quantity` decimal(10, 2) DEFAULT '0.00',
  `description` text,
  `image` varchar(500) DEFAULT NULL,
  `status` enum('active', 'inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `category_id` (`category_id`),
  KEY `brand_id` (`brand_id`),
  KEY `unit_id` (`unit_id`),
  KEY `warehouse_id` (`warehouse_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE
  SET
  NULL,
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE
  SET
  NULL,
  CONSTRAINT `products_ibfk_3` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE
  SET
  NULL,
  CONSTRAINT `products_ibfk_4` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE
  SET
  NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: purchase_items
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `purchase_items` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `purchase_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `quantity` decimal(10, 2) NOT NULL,
  `unit_cost` decimal(10, 2) NOT NULL,
  `discount` decimal(10, 2) DEFAULT '0.00',
  `tax` decimal(10, 2) DEFAULT '0.00',
  `subtotal` decimal(10, 2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `purchase_id` (`purchase_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `purchase_items_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: purchase_return_items
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `purchase_return_items` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `return_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `purchase_item_id` varchar(36) DEFAULT NULL,
  `quantity` decimal(10, 2) NOT NULL,
  `unit_cost` decimal(10, 2) NOT NULL,
  `discount` decimal(10, 2) DEFAULT '0.00',
  `tax` decimal(10, 2) DEFAULT '0.00',
  `subtotal` decimal(10, 2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `return_id` (`return_id`),
  KEY `product_id` (`product_id`),
  KEY `purchase_item_id` (`purchase_item_id`),
  CONSTRAINT `purchase_return_items_ibfk_1` FOREIGN KEY (`return_id`) REFERENCES `purchase_returns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_return_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_return_items_ibfk_3` FOREIGN KEY (`purchase_item_id`) REFERENCES `purchase_items` (`id`) ON DELETE
  SET
  NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: purchase_returns
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `purchase_returns` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `reference` varchar(100) NOT NULL,
  `purchase_id` varchar(36) NOT NULL,
  `supplier_id` varchar(36) NOT NULL,
  `warehouse_id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `subtotal` decimal(10, 2) DEFAULT '0.00',
  `tax_rate` decimal(5, 2) DEFAULT '0.00',
  `tax_amount` decimal(10, 2) DEFAULT '0.00',
  `discount` decimal(10, 2) DEFAULT '0.00',
  `shipping` decimal(10, 2) DEFAULT '0.00',
  `total` decimal(10, 2) NOT NULL,
  `status` enum('pending', 'completed', 'cancelled') DEFAULT 'completed',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `purchase_id` (`purchase_id`),
  KEY `supplier_id` (`supplier_id`),
  KEY `warehouse_id` (`warehouse_id`),
  CONSTRAINT `purchase_returns_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_returns_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_returns_ibfk_3` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: purchases
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `purchases` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'uuid()',
  `reference` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `supplier_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `warehouse_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `date` date NOT NULL,
  `subtotal` decimal(10, 2) DEFAULT '0.00',
  `tax_rate` decimal(5, 2) DEFAULT '0.00',
  `tax_amount` decimal(10, 2) DEFAULT '0.00',
  `discount` decimal(10, 2) DEFAULT '0.00',
  `shipping` decimal(10, 2) DEFAULT '0.00',
  `total` decimal(10, 2) NOT NULL,
  `paid` decimal(10, 2) DEFAULT '0.00',
  `due` decimal(10, 2) DEFAULT '0.00',
  `status` enum('pending', 'received', 'cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'pending',
  `payment_status` enum('unpaid', 'partial', 'paid') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'unpaid',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `created_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `reference` (`reference`) USING BTREE,
  KEY `supplier_id` (`supplier_id`) USING BTREE,
  KEY `warehouse_id` (`warehouse_id`) USING BTREE,
  KEY `created_by` (`created_by`) USING BTREE,
  CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE
  SET
  NULL,
  CONSTRAINT `purchases_ibfk_2` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE
  SET
  NULL,
  CONSTRAINT `purchases_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE
  SET
  NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: quotation_items
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `quotation_items` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `quotation_id` int NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `quantity` decimal(10, 2) NOT NULL,
  `unit_price` decimal(10, 2) NOT NULL,
  `discount` decimal(10, 2) DEFAULT '0.00',
  `tax` decimal(10, 2) DEFAULT '0.00',
  `subtotal` decimal(10, 2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `FK_quotation_items_quotations` (`quotation_id`),
  CONSTRAINT `FK_quotation_items_quotations` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`),
  CONSTRAINT `quotation_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: quotations
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `quotations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference` varchar(100) NOT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `warehouse_id` varchar(36) DEFAULT NULL,
  `date` date NOT NULL,
  `valid_until` date DEFAULT NULL,
  `subtotal` decimal(10, 2) DEFAULT '0.00',
  `tax_rate` decimal(5, 2) DEFAULT '0.00',
  `tax_amount` decimal(10, 2) DEFAULT '0.00',
  `discount` decimal(10, 2) DEFAULT '0.00',
  `shipping` decimal(10, 2) DEFAULT '0.00',
  `total` decimal(10, 2) NOT NULL,
  `status` enum('pending', 'sent', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
  `notes` text,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `customer_id` (`customer_id`),
  KEY `warehouse_id` (`warehouse_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `quotations_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE
  SET
  NULL,
  CONSTRAINT `quotations_ibfk_2` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE
  SET
  NULL,
  CONSTRAINT `quotations_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE
  SET
  NULL
) ENGINE = InnoDB AUTO_INCREMENT = 6 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: sale_items
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `sale_items` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `sale_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `quantity` decimal(10, 2) NOT NULL,
  `unit_price` decimal(10, 2) NOT NULL,
  `discount` decimal(10, 2) DEFAULT '0.00',
  `tax` decimal(10, 2) DEFAULT '0.00',
  `subtotal` decimal(10, 2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sale_id` (`sale_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `sale_items_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sale_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: sales
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `sales` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `reference` varchar(100) NOT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `warehouse_id` varchar(36) DEFAULT NULL,
  `date` date NOT NULL,
  `subtotal` decimal(10, 2) DEFAULT '0.00',
  `tax_rate` decimal(5, 2) DEFAULT '0.00',
  `tax_amount` decimal(10, 2) DEFAULT '0.00',
  `discount` decimal(10, 2) DEFAULT '0.00',
  `shipping` decimal(10, 2) DEFAULT '0.00',
  `total` decimal(10, 2) NOT NULL,
  `paid` decimal(10, 2) DEFAULT '0.00',
  `due` decimal(10, 2) DEFAULT '0.00',
  `status` enum('pending', 'completed', 'cancelled') DEFAULT 'pending',
  `payment_status` enum('unpaid', 'partial', 'paid') DEFAULT 'unpaid',
  `notes` text,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `customer_id` (`customer_id`),
  KEY `warehouse_id` (`warehouse_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE
  SET
  NULL,
  CONSTRAINT `sales_ibfk_2` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE
  SET
  NULL,
  CONSTRAINT `sales_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE
  SET
  NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: sales_return_items
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `sales_return_items` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `return_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `sale_item_id` varchar(36) DEFAULT NULL,
  `quantity` decimal(10, 2) NOT NULL,
  `unit_price` decimal(10, 2) NOT NULL,
  `discount` decimal(10, 2) DEFAULT '0.00',
  `tax` decimal(10, 2) DEFAULT '0.00',
  `subtotal` decimal(10, 2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `return_id` (`return_id`),
  KEY `product_id` (`product_id`),
  KEY `sale_item_id` (`sale_item_id`),
  CONSTRAINT `sales_return_items_ibfk_1` FOREIGN KEY (`return_id`) REFERENCES `sales_returns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sales_return_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sales_return_items_ibfk_3` FOREIGN KEY (`sale_item_id`) REFERENCES `sale_items` (`id`) ON DELETE
  SET
  NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: sales_returns
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `sales_returns` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `reference` varchar(100) NOT NULL,
  `sale_id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `warehouse_id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `subtotal` decimal(10, 2) DEFAULT '0.00',
  `tax_rate` decimal(5, 2) DEFAULT '0.00',
  `tax_amount` decimal(10, 2) DEFAULT '0.00',
  `discount` decimal(10, 2) DEFAULT '0.00',
  `shipping` decimal(10, 2) DEFAULT '0.00',
  `total` decimal(10, 2) NOT NULL,
  `status` enum('pending', 'completed', 'cancelled') DEFAULT 'completed',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `sale_id` (`sale_id`),
  KEY `customer_id` (`customer_id`),
  KEY `warehouse_id` (`warehouse_id`),
  CONSTRAINT `sales_returns_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sales_returns_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sales_returns_ibfk_3` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: settings
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `settings` (
  `key` varchar(255) NOT NULL,
  `value` text,
  PRIMARY KEY (`key`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: suppliers
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `tax_number` varchar(100) DEFAULT NULL,
  `total_purchases` decimal(10, 2) DEFAULT '0.00',
  `total_paid` decimal(10, 2) DEFAULT '0.00',
  `total_due` decimal(10, 2) DEFAULT '0.00',
  `status` enum('active', 'inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: transfer_items
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `transfer_items` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `transfer_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `quantity` decimal(10, 2) NOT NULL,
  `unit_cost` decimal(10, 2) NOT NULL,
  `discount` decimal(10, 2) DEFAULT '0.00',
  `tax` decimal(10, 2) DEFAULT '0.00',
  `subtotal` decimal(10, 2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `transfer_id` (`transfer_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `transfer_items_ibfk_1` FOREIGN KEY (`transfer_id`) REFERENCES `transfers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transfer_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: transfers
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `transfers` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `reference` varchar(100) NOT NULL,
  `from_warehouse_id` varchar(36) NOT NULL,
  `to_warehouse_id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `subtotal` decimal(10, 2) DEFAULT '0.00',
  `tax_rate` decimal(5, 2) DEFAULT '0.00',
  `tax_amount` decimal(10, 2) DEFAULT '0.00',
  `discount` decimal(10, 2) DEFAULT '0.00',
  `shipping` decimal(10, 2) DEFAULT '0.00',
  `total` decimal(10, 2) NOT NULL,
  `status` enum('pending', 'completed', 'cancelled') DEFAULT 'pending',
  `notes` text,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `from_warehouse_id` (`from_warehouse_id`),
  KEY `to_warehouse_id` (`to_warehouse_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `transfers_ibfk_1` FOREIGN KEY (`from_warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transfers_ibfk_2` FOREIGN KEY (`to_warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transfers_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE
  SET
  NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: units
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `units` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `short_name` varchar(50) NOT NULL,
  `base_unit` varchar(255) DEFAULT NULL,
  `operator` enum('+', '-', '*', '/') DEFAULT '*',
  `operation_value` decimal(10, 4) DEFAULT '1.0000',
  `status` enum('active', 'inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: users
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin', 'manager', 'user') DEFAULT 'user',
  `avatar` varchar(500) DEFAULT NULL,
  `status` enum('active', 'inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: warehouses
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `warehouses` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `zip_code` varchar(20) DEFAULT NULL,
  `status` enum('active', 'inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: adjustment_items
# ------------------------------------------------------------

INSERT INTO
  `adjustment_items` (
    `id`,
    `adjustment_id`,
    `product_id`,
    `quantity`,
    `type`,
    `created_at`,
    `pre_stock`
  )
VALUES
  (
    'ba435c0c-7047-11f0-a5d6-7c8ae1b8d68c',
    'cc1975b4-15cc-4b73-baf8-74845dc021e0',
    '813c14c7-5b47-11f0-88b8-7c8ae1b8d68c',
    1.00,
    'addition',
    '2025-08-03 10:56:21',
    NULL
  );
INSERT INTO
  `adjustment_items` (
    `id`,
    `adjustment_id`,
    `product_id`,
    `quantity`,
    `type`,
    `created_at`,
    `pre_stock`
  )
VALUES
  (
    'ca5a0e34-704d-11f0-a5d6-7c8ae1b8d68c',
    '514c8186-6c40-4b36-8b86-592cadafbe69',
    '813c14c7-5b47-11f0-88b8-7c8ae1b8d68c',
    2.00,
    'addition',
    '2025-08-03 11:39:45',
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: adjustments
# ------------------------------------------------------------

INSERT INTO
  `adjustments` (
    `id`,
    `reference`,
    `warehouse_id`,
    `date`,
    `type`,
    `notes`,
    `created_by`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '514c8186-6c40-4b36-8b86-592cadafbe69',
    'ADJ-985768',
    'f6f9f4f4-5cc9-11f0-88b8-7c8ae1b8d68c',
    '2025-08-03',
    'addition',
    NULL,
    NULL,
    '2025-08-03 11:39:45',
    '2025-08-03 11:39:45'
  );
INSERT INTO
  `adjustments` (
    `id`,
    `reference`,
    `warehouse_id`,
    `date`,
    `type`,
    `notes`,
    `created_by`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    'cc1975b4-15cc-4b73-baf8-74845dc021e0',
    'ADJ-381812',
    '4e1f546b-5a59-11f0-88b8-7c8ae1b8d68c',
    '2025-08-03',
    'addition',
    NULL,
    NULL,
    '2025-08-03 10:56:21',
    '2025-08-03 10:56:21'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: attendance
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: brands
# ------------------------------------------------------------

INSERT INTO
  `brands` (
    `id`,
    `name`,
    `description`,
    `image`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '0c43de2f-58ca-11f0-88b8-7c8ae1b8d68c',
    'None',
    'Generic products',
    NULL,
    'active',
    '2025-07-04 13:28:46',
    '2025-07-09 15:39:06'
  );
INSERT INTO
  `brands` (
    `id`,
    `name`,
    `description`,
    `image`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '20fbe0fd-5cca-11f0-88b8-7c8ae1b8d68c',
    'Kimt',
    'for electronic components',
    NULL,
    'active',
    '2025-07-09 15:39:25',
    '2025-07-09 15:39:25'
  );
INSERT INTO
  `brands` (
    `id`,
    `name`,
    `description`,
    `image`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    'b384719c-5a6c-11f0-88b8-7c8ae1b8d68c',
    'Verdsoft',
    'testinf',
    NULL,
    'active',
    '2025-07-06 15:25:36',
    '2025-07-06 15:25:36'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: categories
# ------------------------------------------------------------

INSERT INTO
  `categories` (
    `id`,
    `code`,
    `name`,
    `description`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '0c42d0a3-58ca-11f0-88b8-7c8ae1b8d68c',
    'SERV',
    'Services',
    NULL,
    'active',
    '2025-07-04 13:28:46',
    '2025-07-04 13:28:46'
  );
INSERT INTO
  `categories` (
    `id`,
    `code`,
    `name`,
    `description`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '68d372be-5cc7-11f0-88b8-7c8ae1b8d68c',
    'CLP',
    'Laptops',
    NULL,
    'active',
    '2025-07-09 15:19:57',
    '2025-07-10 15:19:54'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: companies
# ------------------------------------------------------------

INSERT INTO
  `companies` (
    `id`,
    `name`,
    `email`,
    `phone`,
    `address`,
    `city`,
    `country`,
    `tax_number`,
    `logo`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '0c3fa23e-58ca-11f0-88b8-7c8ae1b8d68c',
    'Kimtronix Global',
    'info@kimtronix.com',
    '+1234567890',
    '123 Business Street',
    'New York',
    'USA',
    NULL,
    NULL,
    'active',
    '2025-07-04 13:28:46',
    '2025-07-04 13:28:46'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: currencies
# ------------------------------------------------------------

INSERT INTO
  `currencies` (
    `id`,
    `code`,
    `name`,
    `symbol`,
    `exchange_rate`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '0c4608e6-58ca-11f0-88b8-7c8ae1b8d68c',
    'USD',
    'US Dollar',
    '$',
    1.0000,
    'active',
    '2025-07-04 13:28:46',
    '2025-07-09 15:39:50'
  );
INSERT INTO
  `currencies` (
    `id`,
    `code`,
    `name`,
    `symbol`,
    `exchange_rate`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '4869f70a-5a6d-11f0-88b8-7c8ae1b8d68c',
    'ZIG',
    'ZimGold',
    'ZIG',
    1.0000,
    'active',
    '2025-07-06 15:29:46',
    '2025-07-06 15:29:46'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: customers
# ------------------------------------------------------------

INSERT INTO
  `customers` (
    `id`,
    `name`,
    `email`,
    `phone`,
    `address`,
    `city`,
    `country`,
    `tax_number`,
    `credit_limit`,
    `total_sales`,
    `total_paid`,
    `total_due`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '5988b6b1-705b-11f0-a5d6-7c8ae1b8d68c',
    'Diana',
    'diaba@gmail.com',
    '23456',
    '3545 17th street Dz4 Harare',
    'Harare',
    'Zimbabwe',
    NULL,
    0.00,
    0.00,
    0.00,
    0.00,
    'active',
    '2025-08-03 13:16:49',
    '2025-08-03 13:16:49'
  );
INSERT INTO
  `customers` (
    `id`,
    `name`,
    `email`,
    `phone`,
    `address`,
    `city`,
    `country`,
    `tax_number`,
    `credit_limit`,
    `total_sales`,
    `total_paid`,
    `total_due`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '8y487y3ryuir4ior',
    'Chjsaosina',
    'dhdhhd@mail.com',
    '07870828373',
    'aihshie 0999',
    'Harare',
    'Zimbabwe',
    '23',
    0.00,
    0.00,
    0.00,
    0.00,
    'active',
    '2025-07-08 16:23:46',
    '2025-07-08 16:23:47'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: departments
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: employees
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: expense_categories
# ------------------------------------------------------------

INSERT INTO
  `expense_categories` (
    `id`,
    `name`,
    `description`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '0c471b70-58ca-11f0-88b8-7c8ae1b8d68c',
    'Marketing',
    'Adsd',
    'active',
    '2025-07-04 13:28:46',
    '2025-08-03 13:25:44'
  );
INSERT INTO
  `expense_categories` (
    `id`,
    `name`,
    `description`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '58993c4c-6e20-11f0-a5d6-7c8ae1b8d68c',
    'Cleaning',
    'Blowing',
    'active',
    '2025-07-31 17:09:25',
    '2025-07-31 17:09:25'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: expenses
# ------------------------------------------------------------

INSERT INTO
  `expenses` (
    `id`,
    `reference`,
    `category_id`,
    `amount`,
    `date`,
    `description`,
    `attachment`,
    `status`,
    `created_by`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '01b182cd-6e16-11f0-a5d6-7c8ae1b8d68c',
    'EXP_1753970123838',
    '0c471b70-58ca-11f0-88b8-7c8ae1b8d68c',
    34.00,
    '2025-07-30',
    'w456t7yiuoukyjthgfds',
    NULL,
    'approved',
    NULL,
    '2025-07-31 15:55:24',
    '2025-07-31 16:59:57'
  );
INSERT INTO
  `expenses` (
    `id`,
    `reference`,
    `category_id`,
    `amount`,
    `date`,
    `description`,
    `attachment`,
    `status`,
    `created_by`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    'bc651acb-705a-11f0-a5d6-7c8ae1b8d68c',
    'EXP_1754219545826',
    '0c471b70-58ca-11f0-88b8-7c8ae1b8d68c',
    23.00,
    '2025-08-03',
    '876r5dtyvhjbn',
    NULL,
    'pending',
    NULL,
    '2025-08-03 13:12:25',
    '2025-08-03 13:12:25'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: holidays
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: leave_requests
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: leave_types
# ------------------------------------------------------------

INSERT INTO
  `leave_types` (
    `id`,
    `name`,
    `days_allowed`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '0c47fddc-58ca-11f0-88b8-7c8ae1b8d68c',
    'Annual Leave',
    21,
    'active',
    '2025-07-04 13:28:46',
    '2025-07-04 13:28:46'
  );
INSERT INTO
  `leave_types` (
    `id`,
    `name`,
    `days_allowed`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '0c480444-58ca-11f0-88b8-7c8ae1b8d68c',
    'Sick Leave',
    10,
    'active',
    '2025-07-04 13:28:46',
    '2025-07-04 13:28:46'
  );
INSERT INTO
  `leave_types` (
    `id`,
    `name`,
    `days_allowed`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '0c48056c-58ca-11f0-88b8-7c8ae1b8d68c',
    'Maternity Leave',
    90,
    'active',
    '2025-07-04 13:28:46',
    '2025-07-04 13:28:46'
  );
INSERT INTO
  `leave_types` (
    `id`,
    `name`,
    `days_allowed`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '0c4805fb-58ca-11f0-88b8-7c8ae1b8d68c',
    'Emergency Leave',
    5,
    'active',
    '2025-07-04 13:28:46',
    '2025-07-04 13:28:46'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: office_shifts
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: products
# ------------------------------------------------------------

INSERT INTO
  `products` (
    `id`,
    `name`,
    `code`,
    `barcode`,
    `category_id`,
    `brand_id`,
    `unit_id`,
    `warehouse_id`,
    `cost`,
    `price`,
    `stock`,
    `alert_quantity`,
    `description`,
    `image`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '2c0d0ee1-704a-11f0-a5d6-7c8ae1b8d68c',
    'ESP32',
    'AD',
    'trfg',
    '68d372be-5cc7-11f0-88b8-7c8ae1b8d68c',
    'b384719c-5a6c-11f0-88b8-7c8ae1b8d68c',
    '0c44fdfe-58ca-11f0-88b8-7c8ae1b8d68c',
    'f6f9f4f4-5cc9-11f0-88b8-7c8ae1b8d68c',
    100.00,
    100.00,
    5.00,
    4.00,
    'test',
    '[\"\"]',
    'active',
    '2025-08-03 11:13:51',
    '2025-08-03 11:32:52'
  );
INSERT INTO
  `products` (
    `id`,
    `name`,
    `code`,
    `barcode`,
    `category_id`,
    `brand_id`,
    `unit_id`,
    `warehouse_id`,
    `cost`,
    `price`,
    `stock`,
    `alert_quantity`,
    `description`,
    `image`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '813c14c7-5b47-11f0-88b8-7c8ae1b8d68c',
    'ESP32',
    '54',
    '345TR',
    '68d372be-5cc7-11f0-88b8-7c8ae1b8d68c',
    'b384719c-5a6c-11f0-88b8-7c8ae1b8d68c',
    '0c44fdfe-58ca-11f0-88b8-7c8ae1b8d68c',
    NULL,
    12.00,
    12.00,
    14.00,
    6.00,
    'DFGFDFGSDFGGFDGHJJHGFDCIRCRHNCEFREBTVYUIRYTVB75CNIFBFWYCUIXMQ  UREHCNFEIOQFI URHFXE9WQ[IROCNB ECFE8K09ER RECCEPQOICN HRIREUREWJQRYE HHURCNHREHQHEI',
    '/uploads/ci2dk3swujdkzsg6obqzu25ls.jpg',
    'active',
    '2025-07-07 17:31:51',
    '2025-08-03 13:46:41'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: purchase_items
# ------------------------------------------------------------

INSERT INTO
  `purchase_items` (
    `id`,
    `purchase_id`,
    `product_id`,
    `quantity`,
    `unit_cost`,
    `discount`,
    `tax`,
    `subtotal`,
    `created_at`
  )
VALUES
  (
    '5726778b-1d26-4f38-b26b-507dfff1f3ec',
    '147cc4a8-edca-469a-b72c-148527ac8df9',
    '813c14c7-5b47-11f0-88b8-7c8ae1b8d68c',
    1.00,
    12.00,
    0.00,
    0.00,
    12.00,
    '2025-08-03 11:57:34'
  );
INSERT INTO
  `purchase_items` (
    `id`,
    `purchase_id`,
    `product_id`,
    `quantity`,
    `unit_cost`,
    `discount`,
    `tax`,
    `subtotal`,
    `created_at`
  )
VALUES
  (
    '5a65541e-c1e6-42fa-a64a-2f467bbc39db',
    '175ee61b-39bf-49ee-bd84-788e51902852',
    '813c14c7-5b47-11f0-88b8-7c8ae1b8d68c',
    1.00,
    12.00,
    0.00,
    0.00,
    12.00,
    '2025-07-20 12:15:23'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: purchase_return_items
# ------------------------------------------------------------

INSERT INTO
  `purchase_return_items` (
    `id`,
    `return_id`,
    `product_id`,
    `purchase_item_id`,
    `quantity`,
    `unit_cost`,
    `discount`,
    `tax`,
    `subtotal`,
    `created_at`
  )
VALUES
  (
    '56c82f08-fdd6-4f93-8ce3-7dc32331a8ec',
    '451412fc-4898-4c76-ac09-dbb59b37a5ae',
    '813c14c7-5b47-11f0-88b8-7c8ae1b8d68c',
    NULL,
    1.00,
    12.00,
    0.00,
    0.00,
    12.00,
    '2025-08-03 13:46:41'
  );
INSERT INTO
  `purchase_return_items` (
    `id`,
    `return_id`,
    `product_id`,
    `purchase_item_id`,
    `quantity`,
    `unit_cost`,
    `discount`,
    `tax`,
    `subtotal`,
    `created_at`
  )
VALUES
  (
    '9b499b87-a1a3-4f0a-95b3-e675abb125c6',
    '2c57c312-590c-4be8-9285-757d3a95735b',
    '813c14c7-5b47-11f0-88b8-7c8ae1b8d68c',
    NULL,
    1.00,
    12.00,
    0.00,
    0.00,
    12.00,
    '2025-08-03 13:38:06'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: purchase_returns
# ------------------------------------------------------------

INSERT INTO
  `purchase_returns` (
    `id`,
    `reference`,
    `purchase_id`,
    `supplier_id`,
    `warehouse_id`,
    `date`,
    `subtotal`,
    `tax_rate`,
    `tax_amount`,
    `discount`,
    `shipping`,
    `total`,
    `status`,
    `notes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '2c57c312-590c-4be8-9285-757d3a95735b',
    'PR-1754221086825',
    '147cc4a8-edca-469a-b72c-148527ac8df9',
    'ce3d16e0-6318-11f0-afd6-7c8ae1b8d68c',
    'f6f9f4f4-5cc9-11f0-88b8-7c8ae1b8d68c',
    '2025-08-03',
    12.00,
    0.00,
    0.00,
    0.00,
    0.00,
    12.00,
    'completed',
    'uygh',
    '2025-08-03 13:38:06',
    '2025-08-03 13:38:06'
  );
INSERT INTO
  `purchase_returns` (
    `id`,
    `reference`,
    `purchase_id`,
    `supplier_id`,
    `warehouse_id`,
    `date`,
    `subtotal`,
    `tax_rate`,
    `tax_amount`,
    `discount`,
    `shipping`,
    `total`,
    `status`,
    `notes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '451412fc-4898-4c76-ac09-dbb59b37a5ae',
    'PR-1754221601704',
    '147cc4a8-edca-469a-b72c-148527ac8df9',
    'ce3d16e0-6318-11f0-afd6-7c8ae1b8d68c',
    'f6f9f4f4-5cc9-11f0-88b8-7c8ae1b8d68c',
    '2025-08-03',
    12.00,
    0.00,
    0.00,
    0.00,
    0.00,
    12.00,
    'completed',
    'uygh',
    '2025-08-03 13:46:41',
    '2025-08-03 13:46:41'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: purchases
# ------------------------------------------------------------

INSERT INTO
  `purchases` (
    `id`,
    `reference`,
    `supplier_id`,
    `warehouse_id`,
    `date`,
    `subtotal`,
    `tax_rate`,
    `tax_amount`,
    `discount`,
    `shipping`,
    `total`,
    `paid`,
    `due`,
    `status`,
    `payment_status`,
    `notes`,
    `created_by`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '147cc4a8-edca-469a-b72c-148527ac8df9',
    'PUR-1752768300567',
    'ce3d16e0-6318-11f0-afd6-7c8ae1b8d68c',
    'f6f9f4f4-5cc9-11f0-88b8-7c8ae1b8d68c',
    '2025-07-13',
    12.00,
    1.00,
    0.12,
    2.00,
    0.00,
    10.12,
    0.00,
    1.03,
    'cancelled',
    'paid',
    'iuyrtsxdgfchvjbknlm',
    '0902aa71-58e2-11f0-88b8-7c8ae1b8d68c',
    '2025-07-17 18:05:00',
    '2025-08-03 11:57:35'
  );
INSERT INTO
  `purchases` (
    `id`,
    `reference`,
    `supplier_id`,
    `warehouse_id`,
    `date`,
    `subtotal`,
    `tax_rate`,
    `tax_amount`,
    `discount`,
    `shipping`,
    `total`,
    `paid`,
    `due`,
    `status`,
    `payment_status`,
    `notes`,
    `created_by`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '175ee61b-39bf-49ee-bd84-788e51902852',
    'PUR-1752765581125',
    'ce3d16e0-6318-11f0-afd6-7c8ae1b8d68c',
    '4e1f546b-5a59-11f0-88b8-7c8ae1b8d68c',
    '2025-07-16',
    12.00,
    0.00,
    0.00,
    0.00,
    0.00,
    12.00,
    0.00,
    12.00,
    'received',
    'paid',
    'hgvfc',
    '0902aa71-58e2-11f0-88b8-7c8ae1b8d68c',
    '2025-07-17 17:19:41',
    '2025-07-20 12:15:24'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: quotation_items
# ------------------------------------------------------------

INSERT INTO
  `quotation_items` (
    `id`,
    `quotation_id`,
    `product_id`,
    `quantity`,
    `unit_price`,
    `discount`,
    `tax`,
    `subtotal`,
    `created_at`
  )
VALUES
  (
    '983e3cf7-613c-11f0-afd6-7c8ae1b8d68c',
    5,
    '813c14c7-5b47-11f0-88b8-7c8ae1b8d68c',
    1.00,
    12.00,
    0.00,
    0.00,
    12.00,
    '2025-07-15 07:28:52'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: quotations
# ------------------------------------------------------------

INSERT INTO
  `quotations` (
    `id`,
    `reference`,
    `customer_id`,
    `warehouse_id`,
    `date`,
    `valid_until`,
    `subtotal`,
    `tax_rate`,
    `tax_amount`,
    `discount`,
    `shipping`,
    `total`,
    `status`,
    `notes`,
    `created_by`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    2,
    'QT-359209',
    '8y487y3ryuir4ior',
    'f6f9f4f4-5cc9-11f0-88b8-7c8ae1b8d68c',
    '2025-07-14',
    '2025-07-14',
    24.00,
    0.00,
    0.00,
    1.00,
    0.00,
    23.00,
    'pending',
    'hdsnjkds',
    '0902aa71-58e2-11f0-88b8-7c8ae1b8d68c',
    '2025-07-14 23:09:19',
    '2025-07-14 23:09:19'
  );
INSERT INTO
  `quotations` (
    `id`,
    `reference`,
    `customer_id`,
    `warehouse_id`,
    `date`,
    `valid_until`,
    `subtotal`,
    `tax_rate`,
    `tax_amount`,
    `discount`,
    `shipping`,
    `total`,
    `status`,
    `notes`,
    `created_by`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    5,
    'QT-332616',
    '8y487y3ryuir4ior',
    '4e1f546b-5a59-11f0-88b8-7c8ae1b8d68c',
    '2025-07-15',
    '2025-07-15',
    12.00,
    0.00,
    0.00,
    0.00,
    0.00,
    12.00,
    'pending',
    'hv',
    '0902aa71-58e2-11f0-88b8-7c8ae1b8d68c',
    '2025-07-15 07:28:52',
    '2025-07-15 07:28:52'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: sale_items
# ------------------------------------------------------------

INSERT INTO
  `sale_items` (
    `id`,
    `sale_id`,
    `product_id`,
    `quantity`,
    `unit_price`,
    `discount`,
    `tax`,
    `subtotal`,
    `created_at`
  )
VALUES
  (
    'ac5f8e52-8640-42c0-9c90-5cbe96941ee0',
    '5a6438cd-a279-4b0e-ae71-03fcee5c90ba',
    '2c0d0ee1-704a-11f0-a5d6-7c8ae1b8d68c',
    2.00,
    100.00,
    0.00,
    0.00,
    200.00,
    '2025-08-03 12:11:04'
  );
INSERT INTO
  `sale_items` (
    `id`,
    `sale_id`,
    `product_id`,
    `quantity`,
    `unit_price`,
    `discount`,
    `tax`,
    `subtotal`,
    `created_at`
  )
VALUES
  (
    'ca2a708a-5244-4777-866e-0886ce976403',
    'af585be6-540f-4f22-952f-6ce331fe2e00',
    '2c0d0ee1-704a-11f0-a5d6-7c8ae1b8d68c',
    2.00,
    100.00,
    0.00,
    0.00,
    200.00,
    '2025-08-03 13:11:12'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: sales
# ------------------------------------------------------------

INSERT INTO
  `sales` (
    `id`,
    `reference`,
    `customer_id`,
    `warehouse_id`,
    `date`,
    `subtotal`,
    `tax_rate`,
    `tax_amount`,
    `discount`,
    `shipping`,
    `total`,
    `paid`,
    `due`,
    `status`,
    `payment_status`,
    `notes`,
    `created_by`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '34fd2845-85ef-410c-b600-0994bf4680e2',
    'SL-1753012342678',
    '8y487y3ryuir4ior',
    NULL,
    '2025-07-20',
    12.00,
    0.00,
    0.00,
    2.00,
    0.00,
    10.00,
    0.00,
    0.00,
    'completed',
    'partial',
    NULL,
    NULL,
    '2025-07-20 13:52:22',
    '2025-07-20 13:52:22'
  );
INSERT INTO
  `sales` (
    `id`,
    `reference`,
    `customer_id`,
    `warehouse_id`,
    `date`,
    `subtotal`,
    `tax_rate`,
    `tax_amount`,
    `discount`,
    `shipping`,
    `total`,
    `paid`,
    `due`,
    `status`,
    `payment_status`,
    `notes`,
    `created_by`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '3ebfb469-9820-4141-a4ea-03b1da51557a',
    'SL-1753012690060',
    NULL,
    NULL,
    '2025-07-20',
    800.00,
    0.00,
    0.00,
    0.00,
    0.00,
    800.00,
    800.00,
    0.00,
    'completed',
    'paid',
    NULL,
    NULL,
    '2025-07-20 13:58:10',
    '2025-07-20 13:58:10'
  );
INSERT INTO
  `sales` (
    `id`,
    `reference`,
    `customer_id`,
    `warehouse_id`,
    `date`,
    `subtotal`,
    `tax_rate`,
    `tax_amount`,
    `discount`,
    `shipping`,
    `total`,
    `paid`,
    `due`,
    `status`,
    `payment_status`,
    `notes`,
    `created_by`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '4a8405b5-1c4e-471a-92df-303601a42adb',
    'SL-1752073850821',
    '8y487y3ryuir4ior',
    '4e1f546b-5a59-11f0-88b8-7c8ae1b8d68c',
    '2025-07-09',
    3.00,
    0.00,
    0.00,
    0.00,
    0.00,
    3.00,
    3.00,
    0.00,
    'completed',
    'paid',
    'trtr',
    NULL,
    '2025-07-09 17:10:50',
    '2025-07-09 17:10:50'
  );
INSERT INTO
  `sales` (
    `id`,
    `reference`,
    `customer_id`,
    `warehouse_id`,
    `date`,
    `subtotal`,
    `tax_rate`,
    `tax_amount`,
    `discount`,
    `shipping`,
    `total`,
    `paid`,
    `due`,
    `status`,
    `payment_status`,
    `notes`,
    `created_by`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '5a6438cd-a279-4b0e-ae71-03fcee5c90ba',
    'SL-1754215864475',
    '8y487y3ryuir4ior',
    '4e1f546b-5a59-11f0-88b8-7c8ae1b8d68c',
    '2025-08-03',
    200.00,
    0.00,
    0.00,
    0.00,
    0.00,
    200.00,
    0.00,
    200.00,
    'completed',
    'paid',
    NULL,
    NULL,
    '2025-08-03 12:11:04',
    '2025-08-03 12:11:04'
  );
INSERT INTO
  `sales` (
    `id`,
    `reference`,
    `customer_id`,
    `warehouse_id`,
    `date`,
    `subtotal`,
    `tax_rate`,
    `tax_amount`,
    `discount`,
    `shipping`,
    `total`,
    `paid`,
    `due`,
    `status`,
    `payment_status`,
    `notes`,
    `created_by`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '5c797060-c029-4479-8bd9-9fd20d72022a',
    'SL-1754216241686',
    NULL,
    NULL,
    '2025-08-03',
    200.00,
    0.00,
    0.00,
    0.00,
    0.00,
    200.00,
    200.00,
    0.00,
    'completed',
    'paid',
    NULL,
    NULL,
    '2025-08-03 12:17:32',
    '2025-08-03 12:17:32'
  );
INSERT INTO
  `sales` (
    `id`,
    `reference`,
    `customer_id`,
    `warehouse_id`,
    `date`,
    `subtotal`,
    `tax_rate`,
    `tax_amount`,
    `discount`,
    `shipping`,
    `total`,
    `paid`,
    `due`,
    `status`,
    `payment_status`,
    `notes`,
    `created_by`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '9549d901-754d-446a-b3d1-72985bb15a66',
    'SL-1754219310738',
    NULL,
    'f6f9f4f4-5cc9-11f0-88b8-7c8ae1b8d68c',
    '2025-08-03',
    24.00,
    0.00,
    0.00,
    0.00,
    0.00,
    24.00,
    24.00,
    0.00,
    'completed',
    'paid',
    NULL,
    NULL,
    '2025-08-03 13:08:31',
    '2025-08-03 13:08:31'
  );
INSERT INTO
  `sales` (
    `id`,
    `reference`,
    `customer_id`,
    `warehouse_id`,
    `date`,
    `subtotal`,
    `tax_rate`,
    `tax_amount`,
    `discount`,
    `shipping`,
    `total`,
    `paid`,
    `due`,
    `status`,
    `payment_status`,
    `notes`,
    `created_by`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    'a0d08c93-a44a-4895-9cc6-b8d3ca2be2f7',
    'SL-1754215749161',
    '8y487y3ryuir4ior',
    '4e1f546b-5a59-11f0-88b8-7c8ae1b8d68c',
    '2025-08-03',
    200.00,
    0.00,
    0.00,
    0.00,
    0.00,
    200.00,
    0.00,
    200.00,
    'completed',
    'paid',
    NULL,
    NULL,
    '2025-08-03 12:09:09',
    '2025-08-03 12:09:09'
  );
INSERT INTO
  `sales` (
    `id`,
    `reference`,
    `customer_id`,
    `warehouse_id`,
    `date`,
    `subtotal`,
    `tax_rate`,
    `tax_amount`,
    `discount`,
    `shipping`,
    `total`,
    `paid`,
    `due`,
    `status`,
    `payment_status`,
    `notes`,
    `created_by`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    'af585be6-540f-4f22-952f-6ce331fe2e00',
    'SL-1754219472130',
    NULL,
    NULL,
    '2025-08-03',
    200.00,
    0.00,
    0.00,
    0.00,
    0.00,
    200.00,
    200.00,
    0.00,
    'completed',
    'paid',
    NULL,
    NULL,
    '2025-08-03 13:11:12',
    '2025-08-03 13:11:12'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: sales_return_items
# ------------------------------------------------------------

INSERT INTO
  `sales_return_items` (
    `id`,
    `return_id`,
    `product_id`,
    `sale_item_id`,
    `quantity`,
    `unit_price`,
    `discount`,
    `tax`,
    `subtotal`,
    `created_at`
  )
VALUES
  (
    'd97136cf-79bc-41bd-87e8-936b6067ce35',
    '30a49329-a9f5-4f7b-9f0a-21fb3bce4ebe',
    '813c14c7-5b47-11f0-88b8-7c8ae1b8d68c',
    NULL,
    1.00,
    12.00,
    0.00,
    0.00,
    12.00,
    '2025-07-31 19:13:39'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: sales_returns
# ------------------------------------------------------------

INSERT INTO
  `sales_returns` (
    `id`,
    `reference`,
    `sale_id`,
    `customer_id`,
    `warehouse_id`,
    `date`,
    `subtotal`,
    `tax_rate`,
    `tax_amount`,
    `discount`,
    `shipping`,
    `total`,
    `status`,
    `notes`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '30a49329-a9f5-4f7b-9f0a-21fb3bce4ebe',
    'SR-1753982019229',
    '3ebfb469-9820-4141-a4ea-03b1da51557a',
    '8y487y3ryuir4ior',
    '4e1f546b-5a59-11f0-88b8-7c8ae1b8d68c',
    '2025-07-31',
    12.00,
    0.00,
    0.00,
    0.00,
    0.00,
    12.00,
    'completed',
    'fdgdcvfvc',
    '2025-07-31 19:13:39',
    '2025-07-31 19:13:39'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: settings
# ------------------------------------------------------------

INSERT INTO
  `settings` (`key`, `value`)
VALUES
  ('system_logo', '/uploads/1754230864790.png');
INSERT INTO
  `settings` (`key`, `value`)
VALUES
  ('system_title', 'POSy');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: suppliers
# ------------------------------------------------------------

INSERT INTO
  `suppliers` (
    `id`,
    `name`,
    `email`,
    `phone`,
    `address`,
    `city`,
    `country`,
    `tax_number`,
    `total_purchases`,
    `total_paid`,
    `total_due`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    'ce3d16e0-6318-11f0-afd6-7c8ae1b8d68c',
    'Kells',
    'kel@gmail.com',
    '2099922',
    'bcc 99282',
    'Harare',
    'Zimbabwe',
    '1212',
    12.00,
    11.00,
    1.00,
    'active',
    '2025-07-17 16:17:38',
    '2025-07-17 16:17:40'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: transfer_items
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: transfers
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: units
# ------------------------------------------------------------

INSERT INTO
  `units` (
    `id`,
    `name`,
    `short_name`,
    `base_unit`,
    `operator`,
    `operation_value`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '0c44fdfe-58ca-11f0-88b8-7c8ae1b8d68c',
    'Kilogram',
    'Kg',
    'kg',
    '*',
    1.0000,
    'active',
    '2025-07-04 13:28:46',
    '2025-07-06 15:38:58'
  );
INSERT INTO
  `units` (
    `id`,
    `name`,
    `short_name`,
    `base_unit`,
    `operator`,
    `operation_value`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '0c450193-58ca-11f0-88b8-7c8ae1b8d68c',
    'Metre',
    'M',
    'm',
    '*',
    1.0000,
    'active',
    '2025-07-04 13:28:46',
    '2025-07-06 15:51:58'
  );
INSERT INTO
  `units` (
    `id`,
    `name`,
    `short_name`,
    `base_unit`,
    `operator`,
    `operation_value`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '869393a3-5a70-11f0-88b8-7c8ae1b8d68c',
    'Tonnes',
    'ton',
    'kg',
    '*',
    1.0000,
    'active',
    '2025-07-06 15:52:58',
    '2025-07-06 15:52:58'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: users
# ------------------------------------------------------------

INSERT INTO
  `users` (
    `id`,
    `name`,
    `email`,
    `password`,
    `role`,
    `avatar`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '0902aa71-58e2-11f0-88b8-7c8ae1b8d68c',
    'admin',
    'admin@verdsoft.com',
    '$2b$10$VwdSIzfFd4xoiRIa.7HPgeWHTIOJM6xwRXPDKKPHdqRqNz4kyRo6e',
    'admin',
    NULL,
    'active',
    '2025-07-04 16:20:28',
    '2025-07-10 12:32:16'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: warehouses
# ------------------------------------------------------------

INSERT INTO
  `warehouses` (
    `id`,
    `name`,
    `phone`,
    `email`,
    `address`,
    `city`,
    `country`,
    `zip_code`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '4e1f546b-5a59-11f0-88b8-7c8ae1b8d68c',
    'Tynwald',
    '+263 787 062 575',
    'main@warehouse.com',
    NULL,
    'Harare',
    'Zimbabwe',
    '6767',
    'active',
    '2025-07-06 13:06:45',
    '2025-07-06 13:51:43'
  );
INSERT INTO
  `warehouses` (
    `id`,
    `name`,
    `phone`,
    `email`,
    `address`,
    `city`,
    `country`,
    `zip_code`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    'f6f9f4f4-5cc9-11f0-88b8-7c8ae1b8d68c',
    'Norton',
    '09838339',
    'verdsoft@gmail.com',
    NULL,
    'Harare',
    'Zimbabwe',
    '0000',
    'active',
    '2025-07-09 15:38:15',
    '2025-07-09 15:38:15'
  );

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
