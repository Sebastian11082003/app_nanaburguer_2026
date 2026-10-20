-- CreateEnum
CREATE TYPE "CashSessionStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "cash_session" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "status" "CashSessionStatus" NOT NULL DEFAULT 'OPEN',
    "openedById" TEXT NOT NULL,
    "closedById" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "openingCents" INTEGER NOT NULL DEFAULT 0,
    "countedCents" INTEGER,
    "notes" TEXT,
    "salesTotalCents" INTEGER,
    "cashSalesCents" INTEGER,
    "cardSalesCents" INTEGER,
    "transferSalesCents" INTEGER,
    "otherSalesCents" INTEGER,
    "manualIncomeCents" INTEGER,
    "expenseCents" INTEGER,
    "expectedCashCents" INTEGER,
    "differenceCents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cash_session_restaurantId_status_idx" ON "cash_session"("restaurantId", "status");

-- CreateIndex
CREATE INDEX "cash_session_restaurantId_openedAt_idx" ON "cash_session"("restaurantId", "openedAt");

-- AddForeignKey
ALTER TABLE "cash_session" ADD CONSTRAINT "cash_session_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_session" ADD CONSTRAINT "cash_session_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_session" ADD CONSTRAINT "cash_session_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
