-- CreateEnum
CREATE TYPE "public"."adjustment_items_type" AS ENUM ('addition', 'subtraction');

-- CreateEnum
CREATE TYPE "public"."adjustments_type" AS ENUM ('addition', 'subtraction');

-- CreateEnum
CREATE TYPE "public"."users_role" AS ENUM ('admin', 'manager', 'user');

-- CreateEnum
CREATE TYPE "public"."warehouses_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."users_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."products_status" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "public"."adjustment_items" (
    "id" SERIAL NOT NULL,
    "adjustment_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "type" "public"."adjustment_items_type" NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "pre_stock" VARCHAR(50),

    CONSTRAINT "adjustment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."adjustments" (
    "id" SERIAL NOT NULL,
    "reference" VARCHAR(100) NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "type" "public"."adjustments_type" NOT NULL,
    "notes" TEXT,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."warehouses" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "address" TEXT,
    "city" VARCHAR(100),
    "country" VARCHAR(100),
    "zip_code" VARCHAR(20),
    "status" "public"."warehouses_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "barcode" VARCHAR(255),
    "warehouse_id" INTEGER NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "stock" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "alert_quantity" DECIMAL(10,2) DEFAULT 0.00,
    "description" TEXT,
    "image" VARCHAR(500),
    "status" "public"."products_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "public"."users_role" NOT NULL DEFAULT 'user',
    "avatar" VARCHAR(500),
    "status" "public"."users_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "adjustment_items_adjustment_id_idx" ON "public"."adjustment_items"("adjustment_id");

-- CreateIndex
CREATE INDEX "adjustment_items_product_id_idx" ON "public"."adjustment_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "adjustments_reference_key" ON "public"."adjustments"("reference");

-- CreateIndex
CREATE INDEX "adjustments_created_by_idx" ON "public"."adjustments"("created_by");

-- CreateIndex
CREATE INDEX "adjustments_warehouse_id_idx" ON "public"."adjustments"("warehouse_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_code_key" ON "public"."products"("code");

-- CreateIndex
CREATE INDEX "products_warehouse_id_idx" ON "public"."products"("warehouse_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."adjustment_items" ADD CONSTRAINT "adjustment_items_adjustment_fkey" FOREIGN KEY ("adjustment_id") REFERENCES "public"."adjustments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."adjustment_items" ADD CONSTRAINT "adjustment_items_product_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."adjustments" ADD CONSTRAINT "adjustments_user_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."adjustments" ADD CONSTRAINT "adjustments_warehouse_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_warehouse_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
