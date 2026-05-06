/*
  Warnings:

  - A unique constraint covering the columns `[nit]` on the table `restaurant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "restaurant_nit_key" ON "restaurant"("nit");
