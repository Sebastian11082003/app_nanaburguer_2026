/*
  Warnings:

  - You are about to drop the column `created_at` on the `order_item` table. All the data in the column will be lost.
  - You are about to drop the column `line_total_cents` on the `order_item` table. All the data in the column will be lost.
  - You are about to drop the column `menu_item_id` on the `order_item` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `order_item` table. All the data in the column will be lost.
  - You are about to drop the column `unit_price_cents` on the `order_item` table. All the data in the column will be lost.
  - You are about to drop the column `changed_at` on the `order_status_history` table. All the data in the column will be lost.
  - You are about to drop the column `changed_by` on the `order_status_history` table. All the data in the column will be lost.
  - You are about to drop the column `from_status` on the `order_status_history` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `order_status_history` table. All the data in the column will be lost.
  - You are about to drop the column `to_status` on the `order_status_history` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `table_entity` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `table_entity` table. All the data in the column will be lost.
  - You are about to drop the `order_entity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `restaurant_id` to the `category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `menu_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lineTotalCents` to the `order_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `menuItemId` to the `order_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `order_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPriceCents` to the `order_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `changedById` to the `order_status_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromStatus` to the `order_status_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `order_status_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toStatus` to the `order_status_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurantId` to the `table_entity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'DISPATCHED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CashType" AS ENUM ('INCOME', 'EXPENSE');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'SENT_TO_KITCHEN';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'KITCHEN';

-- DropForeignKey
ALTER TABLE "order_entity" DROP CONSTRAINT "order_entity_created_by_fkey";

-- DropForeignKey
ALTER TABLE "order_entity" DROP CONSTRAINT "order_entity_table_id_fkey";

-- DropForeignKey
ALTER TABLE "order_entity" DROP CONSTRAINT "order_entity_updated_by_fkey";

-- DropForeignKey
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_menu_item_id_fkey";

-- DropForeignKey
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_order_id_fkey";

-- DropForeignKey
ALTER TABLE "order_status_history" DROP CONSTRAINT "order_status_history_changed_by_fkey";

-- DropForeignKey
ALTER TABLE "order_status_history" DROP CONSTRAINT "order_status_history_order_id_fkey";

-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_created_by_fkey";

-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_order_id_fkey";

-- DropIndex
DROP INDEX "order_item_menu_item_id_idx";

-- DropIndex
DROP INDEX "order_item_order_id_idx";

-- DropIndex
DROP INDEX "order_status_history_changed_by_idx";

-- DropIndex
DROP INDEX "order_status_history_order_id_idx";

-- AlterTable
ALTER TABLE "category" ADD COLUMN     "restaurant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "menu_item" ADD COLUMN     "restaurant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "order_item" DROP COLUMN "created_at",
DROP COLUMN "line_total_cents",
DROP COLUMN "menu_item_id",
DROP COLUMN "order_id",
DROP COLUMN "unit_price_cents",
ADD COLUMN     "lineTotalCents" INTEGER NOT NULL,
ADD COLUMN     "menuItemId" TEXT NOT NULL,
ADD COLUMN     "orderId" TEXT NOT NULL,
ADD COLUMN     "unitPriceCents" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "order_status_history" DROP COLUMN "changed_at",
DROP COLUMN "changed_by",
DROP COLUMN "from_status",
DROP COLUMN "order_id",
DROP COLUMN "to_status",
ADD COLUMN     "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "changedById" TEXT NOT NULL,
ADD COLUMN     "fromStatus" "OrderStatus" NOT NULL,
ADD COLUMN     "orderId" TEXT NOT NULL,
ADD COLUMN     "toStatus" "OrderStatus" NOT NULL;

-- AlterTable
ALTER TABLE "table_entity" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "restaurantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "restaurant_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "order_entity";

-- DropTable
DROP TABLE "payment";

-- CreateTable
CREATE TABLE "restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nit" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "logoUrl" TEXT,
    "PrimaryColor" TEXT,
    "factus_api_key" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" INTEGER NOT NULL,
    "type" "OrderType" NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "source" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "tableId" TEXT,
    "subtotalCents" INTEGER NOT NULL,
    "taxCents" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "tipCents" INTEGER NOT NULL DEFAULT 0,
    "tipSuggestedCents" INTEGER,
    "method" "PaymentMethod" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'COP',
    "createdById" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "cufe" TEXT,
    "status" "InvoiceStatus" NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "responseJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "neighborhood" TEXT,
    "notes" TEXT,
    "printed" BOOLEAN NOT NULL DEFAULT false,
    "type" "OrderType" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "restaurantId" TEXT NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashMovement" (
    "id" TEXT NOT NULL,
    "type" "CashType" NOT NULL,
    "concept" TEXT NOT NULL,
    "reference" TEXT,
    "amountCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,

    CONSTRAINT "CashMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Order_restaurantId_idx" ON "Order"("restaurantId");

-- CreateIndex
CREATE INDEX "Order_tableId_idx" ON "Order"("tableId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_restaurantId_orderNumber_key" ON "Order"("restaurantId", "orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "sale_orderId_key" ON "sale"("orderId");

-- CreateIndex
CREATE INDEX "sale_restaurantId_idx" ON "sale"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_saleId_key" ON "Payment"("saleId");

-- CreateIndex
CREATE INDEX "Payment_restaurantId_idx" ON "Payment"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_saleId_key" ON "invoice"("saleId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_paymentId_key" ON "invoice"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_number_key" ON "invoice"("number");

-- CreateIndex
CREATE INDEX "invoice_restaurantId_idx" ON "invoice"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_orderId_key" ON "Delivery"("orderId");

-- CreateIndex
CREATE INDEX "Delivery_restaurantId_idx" ON "Delivery"("restaurantId");

-- CreateIndex
CREATE INDEX "CashMovement_restaurantId_idx" ON "CashMovement"("restaurantId");

-- CreateIndex
CREATE INDEX "category_restaurant_id_idx" ON "category"("restaurant_id");

-- CreateIndex
CREATE INDEX "menu_item_restaurant_id_idx" ON "menu_item"("restaurant_id");

-- CreateIndex
CREATE INDEX "order_item_orderId_idx" ON "order_item"("orderId");

-- CreateIndex
CREATE INDEX "order_status_history_orderId_idx" ON "order_status_history"("orderId");

-- CreateIndex
CREATE INDEX "table_entity_restaurantId_idx" ON "table_entity"("restaurantId");

-- CreateIndex
CREATE INDEX "user_restaurant_id_idx" ON "user"("restaurant_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item" ADD CONSTRAINT "menu_item_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_entity" ADD CONSTRAINT "table_entity_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "table_entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale" ADD CONSTRAINT "sale_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale" ADD CONSTRAINT "sale_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
