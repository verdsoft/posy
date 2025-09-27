/*
  Warnings:

  - Added the required column `brand_id` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_id` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."expense_categories_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."leave_types_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."brands_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."categories_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."departments_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."office_shifts_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."currencies_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."holidays_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."units_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."attendance_status" AS ENUM ('present', 'absent', 'late', 'half_day');

-- CreateEnum
CREATE TYPE "public"."expenses_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "public"."leave_requests_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "public"."companies_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."employees_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."suppliers_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."transfers_status" AS ENUM ('pending', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."customers_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."purchase_returns_status" AS ENUM ('pending', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."quotations_status" AS ENUM ('pending', 'sent', 'accepted', 'rejected', 'expired');

-- CreateEnum
CREATE TYPE "public"."sales_returns_status" AS ENUM ('pending', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."purchases_status" AS ENUM ('pending', 'received', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."sales_status" AS ENUM ('pending', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."purchases_payment_status" AS ENUM ('unpaid', 'partial', 'paid');

-- CreateEnum
CREATE TYPE "public"."sales_payment_status" AS ENUM ('unpaid', 'partial', 'paid');

-- CreateEnum
CREATE TYPE "public"."invoices_status" AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."invoices_payment_status" AS ENUM ('unpaid', 'partial', 'paid');

-- CreateEnum
CREATE TYPE "public"."zimra_config_status" AS ENUM ('pending', 'approved', 'active', 'suspended');

-- CreateEnum
CREATE TYPE "public"."fiscal_devices_mode" AS ENUM ('Online', 'Offline');

-- CreateEnum
CREATE TYPE "public"."fiscal_devices_status" AS ENUM ('Active', 'Blocked', 'Pending');

-- CreateEnum
CREATE TYPE "public"."fiscal_receipt_type" AS ENUM ('FiscalInvoice', 'CreditNote', 'DebitNote');

-- CreateEnum
CREATE TYPE "public"."fiscal_transaction_status" AS ENUM ('pending', 'submitted', 'confirmed', 'failed');

-- CreateEnum
CREATE TYPE "public"."offline_queue_status" AS ENUM ('pending', 'processing', 'synchronized', 'failed');

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "brand_id" INTEGER NOT NULL,
ADD COLUMN     "category_id" INTEGER NOT NULL,
ADD COLUMN     "unit_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."attendance" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "time_in" TIMESTAMP(3),
    "time_out" TIMESTAMP(3),
    "break_time" INTEGER DEFAULT 0,
    "total_hours" DECIMAL(4,2) DEFAULT 0.00,
    "status" "public"."attendance_status" NOT NULL DEFAULT 'present',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."brands" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image" VARCHAR(500),
    "status" "public"."brands_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "public"."categories_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."companies" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "address" TEXT,
    "city" VARCHAR(100),
    "country" VARCHAR(100),
    "tax_number" VARCHAR(100),
    "logo" VARCHAR(500),
    "status" "public"."companies_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."currencies" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "exchange_rate" DECIMAL(10,4) DEFAULT 1.0000,
    "status" "public"."currencies_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "address" TEXT,
    "city" VARCHAR(100),
    "country" VARCHAR(100),
    "tax_number" VARCHAR(100),
    "credit_limit" DECIMAL(10,2) DEFAULT 0.00,
    "total_sales" DECIMAL(10,2) DEFAULT 0.00,
    "total_paid" DECIMAL(10,2) DEFAULT 0.00,
    "total_due" DECIMAL(10,2) DEFAULT 0.00,
    "status" "public"."customers_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."departments" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "company_id" INTEGER NOT NULL,
    "description" TEXT,
    "status" "public"."departments_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."employees" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "department_id" INTEGER NOT NULL,
    "shift_id" INTEGER NOT NULL,
    "position" VARCHAR(255),
    "salary" DECIMAL(10,2),
    "hire_date" DATE,
    "address" TEXT,
    "status" "public"."employees_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."expense_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "public"."expense_categories_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."expenses" (
    "id" SERIAL NOT NULL,
    "reference" VARCHAR(100) NOT NULL,
    "category_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" DATE NOT NULL,
    "description" TEXT,
    "attachment" VARCHAR(500),
    "status" "public"."expenses_status" NOT NULL DEFAULT 'pending',
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."holidays" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "description" TEXT,
    "status" "public"."holidays_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoice_items" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) DEFAULT 0.00,
    "tax" DECIMAL(10,2) DEFAULT 0.00,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoices" (
    "id" SERIAL NOT NULL,
    "reference" VARCHAR(100) NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "sale_id" INTEGER,
    "quotation_id" INTEGER,
    "date" DATE NOT NULL,
    "due_date" DATE,
    "subtotal" DECIMAL(10,2) DEFAULT 0.00,
    "tax_rate" DECIMAL(5,2) DEFAULT 0.00,
    "tax_amount" DECIMAL(10,2) DEFAULT 0.00,
    "discount" DECIMAL(10,2) DEFAULT 0.00,
    "shipping" DECIMAL(10,2) DEFAULT 0.00,
    "total" DECIMAL(10,2) NOT NULL,
    "paid" DECIMAL(10,2) DEFAULT 0.00,
    "due" DECIMAL(10,2) DEFAULT 0.00,
    "status" "public"."invoices_status" NOT NULL DEFAULT 'draft',
    "payment_status" "public"."invoices_payment_status" NOT NULL DEFAULT 'unpaid',
    "notes" TEXT,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "is_fiscalized" BOOLEAN NOT NULL DEFAULT false,
    "fiscal_transaction_id" BIGINT,
    "zimra_qr_code" TEXT,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leave_requests" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "leave_type_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "days" INTEGER NOT NULL,
    "reason" TEXT,
    "status" "public"."leave_requests_status" NOT NULL DEFAULT 'pending',
    "approved_by" INTEGER NOT NULL,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leave_types" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "days_allowed" INTEGER DEFAULT 0,
    "status" "public"."leave_types_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "leave_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."office_shifts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" "public"."office_shifts_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "office_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organization" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "address" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "country" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "tax_number" VARCHAR(100),
    "website" VARCHAR(255),
    "logo" VARCHAR(500),
    "bank_name" VARCHAR(255),
    "bank_account" VARCHAR(100),
    "bank_branch" VARCHAR(255),
    "swift_code" VARCHAR(50),
    "iban" VARCHAR(100),
    "currency" VARCHAR(10) DEFAULT 'USD',
    "timezone" VARCHAR(50) DEFAULT 'UTC',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "currency_symbol" VARCHAR(5) DEFAULT '$',
    "date_format" VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    "fax" VARCHAR(50),
    "invoice_footer" TEXT,
    "invoice_prefix" VARCHAR(10) DEFAULT 'INV',
    "language" VARCHAR(5) DEFAULT 'en',
    "payment_terms" TEXT,
    "quotation_footer" TEXT,
    "quotation_prefix" VARCHAR(10) DEFAULT 'QUO',
    "registration_number" VARCHAR(100),
    "terms_conditions" TEXT,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchase_items" (
    "id" SERIAL NOT NULL,
    "purchase_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_cost" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) DEFAULT 0.00,
    "tax" DECIMAL(10,2) DEFAULT 0.00,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchase_return_items" (
    "id" SERIAL NOT NULL,
    "return_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "purchase_item_id" INTEGER NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_cost" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) DEFAULT 0.00,
    "tax" DECIMAL(10,2) DEFAULT 0.00,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchase_returns" (
    "id" SERIAL NOT NULL,
    "reference" VARCHAR(100) NOT NULL,
    "purchase_id" INTEGER NOT NULL,
    "supplier_id" INTEGER NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "subtotal" DECIMAL(10,2) DEFAULT 0.00,
    "tax_rate" DECIMAL(5,2) DEFAULT 0.00,
    "tax_amount" DECIMAL(10,2) DEFAULT 0.00,
    "discount" DECIMAL(10,2) DEFAULT 0.00,
    "shipping" DECIMAL(10,2) DEFAULT 0.00,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "public"."purchase_returns_status" NOT NULL DEFAULT 'completed',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "purchase_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchases" (
    "id" SERIAL NOT NULL,
    "reference" VARCHAR(100) NOT NULL,
    "supplier_id" INTEGER NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "subtotal" DECIMAL(10,2) DEFAULT 0.00,
    "tax_rate" DECIMAL(5,2) DEFAULT 0.00,
    "tax_amount" DECIMAL(10,2) DEFAULT 0.00,
    "discount" DECIMAL(10,2) DEFAULT 0.00,
    "shipping" DECIMAL(10,2) DEFAULT 0.00,
    "total" DECIMAL(10,2) NOT NULL,
    "paid" DECIMAL(10,2) DEFAULT 0.00,
    "due" DECIMAL(10,2) DEFAULT 0.00,
    "status" "public"."purchases_status" NOT NULL DEFAULT 'pending',
    "payment_status" "public"."purchases_payment_status" NOT NULL DEFAULT 'unpaid',
    "notes" TEXT,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quotation_items" (
    "id" SERIAL NOT NULL,
    "quotation_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) DEFAULT 0.00,
    "tax" DECIMAL(10,2) DEFAULT 0.00,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quotations" (
    "id" SERIAL NOT NULL,
    "reference" VARCHAR(100) NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "valid_until" DATE,
    "subtotal" DECIMAL(10,2) DEFAULT 0.00,
    "tax_rate" DECIMAL(5,2) DEFAULT 0.00,
    "tax_amount" DECIMAL(10,2) DEFAULT 0.00,
    "discount" DECIMAL(10,2) DEFAULT 0.00,
    "shipping" DECIMAL(10,2) DEFAULT 0.00,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "public"."quotations_status" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sale_items" (
    "id" SERIAL NOT NULL,
    "sale_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) DEFAULT 0.00,
    "tax" DECIMAL(10,2) DEFAULT 0.00,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sales" (
    "id" SERIAL NOT NULL,
    "reference" VARCHAR(100) NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "subtotal" DECIMAL(10,2) DEFAULT 0.00,
    "tax_rate" DECIMAL(5,2) DEFAULT 0.00,
    "tax_amount" DECIMAL(10,2) DEFAULT 0.00,
    "discount" DECIMAL(10,2) DEFAULT 0.00,
    "shipping" DECIMAL(10,2) DEFAULT 0.00,
    "total" DECIMAL(10,2) NOT NULL,
    "paid" DECIMAL(10,2) DEFAULT 0.00,
    "due" DECIMAL(10,2) DEFAULT 0.00,
    "status" "public"."sales_status" NOT NULL DEFAULT 'pending',
    "payment_status" "public"."sales_payment_status" NOT NULL DEFAULT 'unpaid',
    "notes" TEXT,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "is_fiscalized" BOOLEAN NOT NULL DEFAULT false,
    "fiscal_transaction_id" BIGINT,
    "zimra_qr_code" TEXT,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sales_return_items" (
    "id" SERIAL NOT NULL,
    "return_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "sale_item_id" INTEGER NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) DEFAULT 0.00,
    "tax" DECIMAL(10,2) DEFAULT 0.00,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sales_returns" (
    "id" SERIAL NOT NULL,
    "reference" VARCHAR(100) NOT NULL,
    "sale_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "subtotal" DECIMAL(10,2) DEFAULT 0.00,
    "tax_rate" DECIMAL(5,2) DEFAULT 0.00,
    "tax_amount" DECIMAL(10,2) DEFAULT 0.00,
    "discount" DECIMAL(10,2) DEFAULT 0.00,
    "shipping" DECIMAL(10,2) DEFAULT 0.00,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "public"."sales_returns_status" NOT NULL DEFAULT 'completed',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "sales_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."settings" (
    "key" VARCHAR(255) NOT NULL,
    "value" TEXT,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."suppliers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "address" TEXT,
    "city" VARCHAR(100),
    "country" VARCHAR(100),
    "tax_number" VARCHAR(100),
    "total_purchases" DECIMAL(10,2) DEFAULT 0.00,
    "total_paid" DECIMAL(10,2) DEFAULT 0.00,
    "total_due" DECIMAL(10,2) DEFAULT 0.00,
    "status" "public"."suppliers_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transfer_items" (
    "id" SERIAL NOT NULL,
    "transfer_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_cost" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) DEFAULT 0.00,
    "tax" DECIMAL(10,2) DEFAULT 0.00,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transfer_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transfers" (
    "id" SERIAL NOT NULL,
    "reference" VARCHAR(100) NOT NULL,
    "from_warehouse_id" INTEGER NOT NULL,
    "to_warehouse_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "subtotal" DECIMAL(10,2) DEFAULT 0.00,
    "tax_rate" DECIMAL(5,2) DEFAULT 0.00,
    "tax_amount" DECIMAL(10,2) DEFAULT 0.00,
    "discount" DECIMAL(10,2) DEFAULT 0.00,
    "shipping" DECIMAL(10,2) DEFAULT 0.00,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "public"."transfers_status" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."units" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "short_name" VARCHAR(50) NOT NULL,
    "base_unit" VARCHAR(255),
    "operator" VARCHAR(10),
    "operation_value" DECIMAL(10,4) DEFAULT 1.0000,
    "status" "public"."units_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."zimra_config" (
    "id" SERIAL NOT NULL,
    "taxpayer_tin" VARCHAR(10) NOT NULL,
    "vat_registration_no" VARCHAR(9),
    "business_name" VARCHAR(250) NOT NULL,
    "business_type" VARCHAR(50) NOT NULL,
    "branch_name" VARCHAR(250) NOT NULL DEFAULT 'Main Branch',
    "branch_address" JSONB NOT NULL,
    "device_certificate_path" TEXT,
    "certificate_thumbprint" VARCHAR(64),
    "certificate_expiry" DATE,
    "test_environment" BOOLEAN NOT NULL DEFAULT true,
    "api_endpoint" VARCHAR(255),
    "status" "public"."zimra_config_status" NOT NULL DEFAULT 'pending',
    "is_fdms_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "zimra_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fiscal_devices" (
    "id" SERIAL NOT NULL,
    "zimra_config_id" INTEGER NOT NULL,
    "device_id" VARCHAR(50) NOT NULL,
    "device_serial_no" VARCHAR(20) NOT NULL,
    "branch_name" VARCHAR(250) NOT NULL,
    "branch_address" JSONB NOT NULL,
    "operating_mode" "public"."fiscal_devices_mode" NOT NULL DEFAULT 'Online',
    "status" "public"."fiscal_devices_status" NOT NULL DEFAULT 'Pending',
    "daily_receipt_counter" INTEGER NOT NULL DEFAULT 0,
    "global_receipt_counter" BIGINT NOT NULL DEFAULT 0,
    "fiscal_day_opened" TIMESTAMP(3),
    "last_z_report" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fiscal_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fiscal_transactions" (
    "id" BIGSERIAL NOT NULL,
    "zimra_config_id" INTEGER NOT NULL,
    "device_id" VARCHAR(50) NOT NULL,
    "receipt_global_no" BIGINT NOT NULL,
    "receipt_type" "public"."fiscal_receipt_type" NOT NULL DEFAULT 'FiscalInvoice',
    "invoice_no" VARCHAR(50) NOT NULL,
    "receipt_currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "receipt_total" DECIMAL(21,2) NOT NULL,
    "tax_amount" DECIMAL(21,2) NOT NULL,
    "receipt_date" TIMESTAMP(3) NOT NULL,
    "buyer_tin" VARCHAR(10),
    "buyer_name" VARCHAR(250),
    "receipt_items" JSONB NOT NULL,
    "device_signature" TEXT NOT NULL,
    "fdms_signature" TEXT,
    "qr_code_data" TEXT,
    "zimra_status" "public"."fiscal_transaction_status" NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "fiscal_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."offline_fiscal_queue" (
    "id" BIGSERIAL NOT NULL,
    "zimra_config_id" INTEGER NOT NULL,
    "device_id" VARCHAR(50) NOT NULL,
    "transaction_data" JSONB NOT NULL,
    "status" "public"."offline_queue_status" NOT NULL DEFAULT 'pending',
    "queued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "offline_fiscal_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."zimra_tax_rates" (
    "id" SERIAL NOT NULL,
    "tax_id" INTEGER NOT NULL,
    "tax_name" VARCHAR(50) NOT NULL,
    "tax_percent" DECIMAL(5,2) NOT NULL,
    "business_type" VARCHAR(50),
    "effective_date" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zimra_tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_employee_id_fkey" ON "public"."attendance"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_code_key" ON "public"."categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_code_key" ON "public"."currencies"("code");

-- CreateIndex
CREATE INDEX "departments_company_id_fkey" ON "public"."departments"("company_id");

-- CreateIndex
CREATE INDEX "employees_department_id_fkey" ON "public"."employees"("department_id");

-- CreateIndex
CREATE INDEX "employees_shift_id_fkey" ON "public"."employees"("shift_id");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_reference_key" ON "public"."expenses"("reference");

-- CreateIndex
CREATE INDEX "expenses_category_id_fkey" ON "public"."expenses"("category_id");

-- CreateIndex
CREATE INDEX "expenses_created_by_fkey" ON "public"."expenses"("created_by");

-- CreateIndex
CREATE INDEX "invoice_items_invoice_id_fkey" ON "public"."invoice_items"("invoice_id");

-- CreateIndex
CREATE INDEX "invoice_items_product_id_fkey" ON "public"."invoice_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_reference_key" ON "public"."invoices"("reference");

-- CreateIndex
CREATE INDEX "invoices_created_by_fkey" ON "public"."invoices"("created_by");

-- CreateIndex
CREATE INDEX "invoices_customer_id_fkey" ON "public"."invoices"("customer_id");

-- CreateIndex
CREATE INDEX "invoices_quotation_id_fkey" ON "public"."invoices"("quotation_id");

-- CreateIndex
CREATE INDEX "invoices_sale_id_fkey" ON "public"."invoices"("sale_id");

-- CreateIndex
CREATE INDEX "invoices_warehouse_id_fkey" ON "public"."invoices"("warehouse_id");

-- CreateIndex
CREATE INDEX "leave_requests_approved_by_fkey" ON "public"."leave_requests"("approved_by");

-- CreateIndex
CREATE INDEX "leave_requests_employee_id_fkey" ON "public"."leave_requests"("employee_id");

-- CreateIndex
CREATE INDEX "leave_requests_leave_type_id_fkey" ON "public"."leave_requests"("leave_type_id");

-- CreateIndex
CREATE INDEX "purchase_items_product_id_fkey" ON "public"."purchase_items"("product_id");

-- CreateIndex
CREATE INDEX "purchase_items_purchase_id_fkey" ON "public"."purchase_items"("purchase_id");

-- CreateIndex
CREATE INDEX "purchase_return_items_product_id_fkey" ON "public"."purchase_return_items"("product_id");

-- CreateIndex
CREATE INDEX "purchase_return_items_purchase_item_id_fkey" ON "public"."purchase_return_items"("purchase_item_id");

-- CreateIndex
CREATE INDEX "purchase_return_items_return_id_fkey" ON "public"."purchase_return_items"("return_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_returns_reference_key" ON "public"."purchase_returns"("reference");

-- CreateIndex
CREATE INDEX "purchase_returns_purchase_id_fkey" ON "public"."purchase_returns"("purchase_id");

-- CreateIndex
CREATE INDEX "purchase_returns_supplier_id_fkey" ON "public"."purchase_returns"("supplier_id");

-- CreateIndex
CREATE INDEX "purchase_returns_warehouse_id_fkey" ON "public"."purchase_returns"("warehouse_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_reference_key" ON "public"."purchases"("reference");

-- CreateIndex
CREATE INDEX "purchases_created_by_fkey" ON "public"."purchases"("created_by");

-- CreateIndex
CREATE INDEX "purchases_supplier_id_fkey" ON "public"."purchases"("supplier_id");

-- CreateIndex
CREATE INDEX "purchases_warehouse_id_fkey" ON "public"."purchases"("warehouse_id");

-- CreateIndex
CREATE INDEX "quotation_items_product_id_fkey" ON "public"."quotation_items"("product_id");

-- CreateIndex
CREATE INDEX "quotation_items_quotation_id_fkey" ON "public"."quotation_items"("quotation_id");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_reference_key" ON "public"."quotations"("reference");

-- CreateIndex
CREATE INDEX "quotations_created_by_fkey" ON "public"."quotations"("created_by");

-- CreateIndex
CREATE INDEX "quotations_customer_id_fkey" ON "public"."quotations"("customer_id");

-- CreateIndex
CREATE INDEX "quotations_warehouse_id_fkey" ON "public"."quotations"("warehouse_id");

-- CreateIndex
CREATE INDEX "sale_items_product_id_fkey" ON "public"."sale_items"("product_id");

-- CreateIndex
CREATE INDEX "sale_items_sale_id_fkey" ON "public"."sale_items"("sale_id");

-- CreateIndex
CREATE UNIQUE INDEX "sales_reference_key" ON "public"."sales"("reference");

-- CreateIndex
CREATE INDEX "sales_created_by_fkey" ON "public"."sales"("created_by");

-- CreateIndex
CREATE INDEX "sales_customer_id_fkey" ON "public"."sales"("customer_id");

-- CreateIndex
CREATE INDEX "sales_warehouse_id_fkey" ON "public"."sales"("warehouse_id");

-- CreateIndex
CREATE INDEX "sales_return_items_product_id_fkey" ON "public"."sales_return_items"("product_id");

-- CreateIndex
CREATE INDEX "sales_return_items_return_id_fkey" ON "public"."sales_return_items"("return_id");

-- CreateIndex
CREATE INDEX "sales_return_items_sale_item_id_fkey" ON "public"."sales_return_items"("sale_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "sales_returns_reference_key" ON "public"."sales_returns"("reference");

-- CreateIndex
CREATE INDEX "sales_returns_customer_id_fkey" ON "public"."sales_returns"("customer_id");

-- CreateIndex
CREATE INDEX "sales_returns_sale_id_fkey" ON "public"."sales_returns"("sale_id");

-- CreateIndex
CREATE INDEX "sales_returns_warehouse_id_fkey" ON "public"."sales_returns"("warehouse_id");

-- CreateIndex
CREATE INDEX "transfer_items_product_id_fkey" ON "public"."transfer_items"("product_id");

-- CreateIndex
CREATE INDEX "transfer_items_transfer_id_fkey" ON "public"."transfer_items"("transfer_id");

-- CreateIndex
CREATE UNIQUE INDEX "transfers_reference_key" ON "public"."transfers"("reference");

-- CreateIndex
CREATE INDEX "transfers_created_by_fkey" ON "public"."transfers"("created_by");

-- CreateIndex
CREATE INDEX "transfers_from_warehouse_id_fkey" ON "public"."transfers"("from_warehouse_id");

-- CreateIndex
CREATE INDEX "transfers_to_warehouse_id_fkey" ON "public"."transfers"("to_warehouse_id");

-- CreateIndex
CREATE INDEX "zimra_config_status_idx" ON "public"."zimra_config"("status");

-- CreateIndex
CREATE UNIQUE INDEX "zimra_config_taxpayer_tin_key" ON "public"."zimra_config"("taxpayer_tin");

-- CreateIndex
CREATE UNIQUE INDEX "fiscal_devices_device_id_key" ON "public"."fiscal_devices"("device_id");

-- CreateIndex
CREATE INDEX "fiscal_devices_zimra_config_id_idx" ON "public"."fiscal_devices"("zimra_config_id");

-- CreateIndex
CREATE INDEX "fiscal_devices_status_idx" ON "public"."fiscal_devices"("status");

-- CreateIndex
CREATE INDEX "fiscal_transactions_zimra_config_id_receipt_date_idx" ON "public"."fiscal_transactions"("zimra_config_id", "receipt_date");

-- CreateIndex
CREATE INDEX "fiscal_transactions_zimra_status_idx" ON "public"."fiscal_transactions"("zimra_status");

-- CreateIndex
CREATE INDEX "fiscal_transactions_invoice_no_idx" ON "public"."fiscal_transactions"("invoice_no");

-- CreateIndex
CREATE UNIQUE INDEX "fiscal_transactions_device_id_receipt_global_no_key" ON "public"."fiscal_transactions"("device_id", "receipt_global_no");

-- CreateIndex
CREATE INDEX "offline_fiscal_queue_zimra_config_id_status_idx" ON "public"."offline_fiscal_queue"("zimra_config_id", "status");

-- CreateIndex
CREATE INDEX "offline_fiscal_queue_queued_at_idx" ON "public"."offline_fiscal_queue"("queued_at");

-- CreateIndex
CREATE INDEX "zimra_tax_rates_is_active_effective_date_idx" ON "public"."zimra_tax_rates"("is_active", "effective_date");

-- CreateIndex
CREATE UNIQUE INDEX "zimra_tax_rates_tax_id_business_type_effective_date_key" ON "public"."zimra_tax_rates"("tax_id", "business_type", "effective_date");

-- CreateIndex
CREATE INDEX "products_brand_id_fkey" ON "public"."products"("brand_id");

-- CreateIndex
CREATE INDEX "products_category_id_fkey" ON "public"."products"("category_id");

-- CreateIndex
CREATE INDEX "products_unit_id_fkey" ON "public"."products"("unit_id");

-- RenameForeignKey
ALTER TABLE "public"."adjustment_items" RENAME CONSTRAINT "adjustment_items_adjustment_fkey" TO "fk_adjustment_items_adjustment_id";

-- RenameForeignKey
ALTER TABLE "public"."adjustment_items" RENAME CONSTRAINT "adjustment_items_product_fkey" TO "fk_adjustment_items_product_id";

-- RenameForeignKey
ALTER TABLE "public"."adjustments" RENAME CONSTRAINT "adjustments_user_fkey" TO "fk_adjustments_created_by";

-- RenameForeignKey
ALTER TABLE "public"."adjustments" RENAME CONSTRAINT "adjustments_warehouse_fkey" TO "fk_adjustments_warehouse_id";

-- RenameForeignKey
ALTER TABLE "public"."products" RENAME CONSTRAINT "products_warehouse_fkey" TO "fk_products_warehouse_id";

-- AddForeignKey
ALTER TABLE "public"."attendance" ADD CONSTRAINT "fk_attendance_employee_id" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."departments" ADD CONSTRAINT "fk_departments_company_id" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "fk_employees_department_id" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "fk_employees_shift_id" FOREIGN KEY ("shift_id") REFERENCES "public"."office_shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expenses" ADD CONSTRAINT "fk_expenses_category_id" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expenses" ADD CONSTRAINT "fk_expenses_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoice_items" ADD CONSTRAINT "fk_invoice_items_invoice_id" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoice_items" ADD CONSTRAINT "fk_invoice_items_product_id" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "fk_invoices_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "fk_invoices_customer_id" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "fk_invoices_quotation_id" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "fk_invoices_sale_id" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "fk_invoices_warehouse_id" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leave_requests" ADD CONSTRAINT "fk_leave_requests_approved_by" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leave_requests" ADD CONSTRAINT "fk_leave_requests_employee_id" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leave_requests" ADD CONSTRAINT "fk_leave_requests_leave_type_id" FOREIGN KEY ("leave_type_id") REFERENCES "public"."leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "fk_products_brand_id" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "fk_products_category_id" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "fk_products_unit_id" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_items" ADD CONSTRAINT "fk_purchase_items_product_id" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_items" ADD CONSTRAINT "fk_purchase_items_purchase_id" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_return_items" ADD CONSTRAINT "fk_purchase_return_items_product_id" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_return_items" ADD CONSTRAINT "fk_purchase_return_items_purchase_item_id" FOREIGN KEY ("purchase_item_id") REFERENCES "public"."purchase_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_return_items" ADD CONSTRAINT "fk_purchase_return_items_return_id" FOREIGN KEY ("return_id") REFERENCES "public"."purchase_returns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_returns" ADD CONSTRAINT "fk_purchase_returns_purchase_id" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_returns" ADD CONSTRAINT "fk_purchase_returns_supplier_id" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_returns" ADD CONSTRAINT "fk_purchase_returns_warehouse_id" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchases" ADD CONSTRAINT "fk_purchases_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchases" ADD CONSTRAINT "fk_purchases_supplier_id" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchases" ADD CONSTRAINT "fk_purchases_warehouse_id" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quotation_items" ADD CONSTRAINT "fk_quotation_items_product_id" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quotation_items" ADD CONSTRAINT "fk_quotation_items_quotation_id" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quotations" ADD CONSTRAINT "fk_quotations_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quotations" ADD CONSTRAINT "fk_quotations_customer_id" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quotations" ADD CONSTRAINT "fk_quotations_warehouse_id" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sale_items" ADD CONSTRAINT "fk_sale_items_product_id" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sale_items" ADD CONSTRAINT "fk_sale_items_sale_id" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales" ADD CONSTRAINT "fk_sales_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales" ADD CONSTRAINT "fk_sales_customer_id" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales" ADD CONSTRAINT "fk_sales_warehouse_id" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_return_items" ADD CONSTRAINT "fk_sales_return_items_product_id" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_return_items" ADD CONSTRAINT "fk_sales_return_items_return_id" FOREIGN KEY ("return_id") REFERENCES "public"."sales_returns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_return_items" ADD CONSTRAINT "fk_sales_return_items_sale_item_id" FOREIGN KEY ("sale_item_id") REFERENCES "public"."sale_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_returns" ADD CONSTRAINT "fk_sales_returns_customer_id" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_returns" ADD CONSTRAINT "fk_sales_returns_sale_id" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_returns" ADD CONSTRAINT "fk_sales_returns_warehouse_id" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transfer_items" ADD CONSTRAINT "fk_transfer_items_product_id" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transfer_items" ADD CONSTRAINT "fk_transfer_items_transfer_id" FOREIGN KEY ("transfer_id") REFERENCES "public"."transfers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transfers" ADD CONSTRAINT "fk_transfers_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transfers" ADD CONSTRAINT "fk_transfers_from_warehouse_id" FOREIGN KEY ("from_warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transfers" ADD CONSTRAINT "fk_transfers_to_warehouse_id" FOREIGN KEY ("to_warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fiscal_devices" ADD CONSTRAINT "fk_fiscal_devices_zimra_config_id" FOREIGN KEY ("zimra_config_id") REFERENCES "public"."zimra_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fiscal_transactions" ADD CONSTRAINT "fk_fiscal_transactions_zimra_config_id" FOREIGN KEY ("zimra_config_id") REFERENCES "public"."zimra_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fiscal_transactions" ADD CONSTRAINT "fk_fiscal_transactions_device_id" FOREIGN KEY ("device_id") REFERENCES "public"."fiscal_devices"("device_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."offline_fiscal_queue" ADD CONSTRAINT "fk_offline_fiscal_queue_zimra_config_id" FOREIGN KEY ("zimra_config_id") REFERENCES "public"."zimra_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."offline_fiscal_queue" ADD CONSTRAINT "fk_offline_fiscal_queue_device_id" FOREIGN KEY ("device_id") REFERENCES "public"."fiscal_devices"("device_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "public"."adjustment_items_adjustment_id_idx" RENAME TO "adjustment_items_adjustment_id_fkey";

-- RenameIndex
ALTER INDEX "public"."adjustment_items_product_id_idx" RENAME TO "adjustment_items_product_id_fkey";

-- RenameIndex
ALTER INDEX "public"."adjustments_created_by_idx" RENAME TO "adjustments_created_by_fkey";

-- RenameIndex
ALTER INDEX "public"."adjustments_warehouse_id_idx" RENAME TO "adjustments_warehouse_id_fkey";

-- RenameIndex
ALTER INDEX "public"."products_warehouse_id_idx" RENAME TO "products_warehouse_id_fkey";
