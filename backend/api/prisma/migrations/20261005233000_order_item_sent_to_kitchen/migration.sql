-- HU-030: line-level pending vs sent kitchen rounds.

ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "sentToKitchenAt" TIMESTAMP(3);

-- Existing lines on tickets already in the kitchen flow count as sent.
UPDATE "OrderItem" AS oi
SET "sentToKitchenAt" = COALESCE(o."updatedAt", o."createdAt")
FROM "Order" AS o
WHERE oi."orderId" = o.id
  AND oi."sentToKitchenAt" IS NULL
  AND oi."canceledAt" IS NULL
  AND o.status NOT IN ('CREATED', 'CANCELED');
