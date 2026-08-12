-- CreateTable
CREATE TABLE "restaurant_payment_method" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_payment_method_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "restaurant_payment_method_restaurantId_isActive_idx" ON "restaurant_payment_method"("restaurantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_payment_method_restaurantId_method_key" ON "restaurant_payment_method"("restaurantId", "method");

-- AddForeignKey
ALTER TABLE "restaurant_payment_method" ADD CONSTRAINT "restaurant_payment_method_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
