-- AlterTable
ALTER TABLE "Order" ADD COLUMN "discountCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "isComplimentary" BOOLEAN NOT NULL DEFAULT false;
