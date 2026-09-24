-- Repair local DBs that still have the Aug 2026 snake_case cash_session
-- columns. Fresh installs already have camelCase from 20260904203100;
-- those skip this block.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cash_session'
      AND column_name = 'opened_by_id'
  ) THEN
    ALTER TABLE "cash_session" RENAME COLUMN "opened_by_id" TO "openedById";
    ALTER TABLE "cash_session" RENAME COLUMN "closed_by_id" TO "closedById";
    ALTER TABLE "cash_session" RENAME COLUMN "opened_at" TO "openedAt";
    ALTER TABLE "cash_session" RENAME COLUMN "closed_at" TO "closedAt";
    ALTER TABLE "cash_session" RENAME COLUMN "opening_float_cents" TO "openingCents";
    ALTER TABLE "cash_session" RENAME COLUMN "counted_cash_cents" TO "countedCents";
    ALTER TABLE "cash_session" RENAME COLUMN "expected_cash_cents" TO "expectedCashCents";
    ALTER TABLE "cash_session" RENAME COLUMN "difference_cents" TO "differenceCents";
    ALTER TABLE "cash_session" RENAME COLUMN "close_notes" TO "notes";

    DROP INDEX IF EXISTS "cash_session_restaurantId_opened_at_idx";
    CREATE INDEX IF NOT EXISTS "cash_session_restaurantId_openedAt_idx"
      ON "cash_session"("restaurantId", "openedAt");
  END IF;
END $$;

ALTER TABLE "cash_session" ADD COLUMN IF NOT EXISTS "salesTotalCents" INTEGER;
ALTER TABLE "cash_session" ADD COLUMN IF NOT EXISTS "cashSalesCents" INTEGER;
ALTER TABLE "cash_session" ADD COLUMN IF NOT EXISTS "cardSalesCents" INTEGER;
ALTER TABLE "cash_session" ADD COLUMN IF NOT EXISTS "transferSalesCents" INTEGER;
ALTER TABLE "cash_session" ADD COLUMN IF NOT EXISTS "otherSalesCents" INTEGER;
ALTER TABLE "cash_session" ADD COLUMN IF NOT EXISTS "manualIncomeCents" INTEGER;
ALTER TABLE "cash_session" ADD COLUMN IF NOT EXISTS "expenseCents" INTEGER;
