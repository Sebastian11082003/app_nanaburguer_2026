-- Pickup ETA (HU-014) and audited line cancel (HU-012).
ALTER TABLE "Order" ADD COLUMN "pickupAt" TIMESTAMP(3);

ALTER TABLE "OrderItem" ADD COLUMN "canceledAt" TIMESTAMP(3);
ALTER TABLE "OrderItem" ADD COLUMN "cancelReason" TEXT;
