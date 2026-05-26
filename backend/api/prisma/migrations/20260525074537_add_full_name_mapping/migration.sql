/*
  Warnings:

  - You are about to drop the column `fullName` on the `PlatformAdmin` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `PlatformAdmin` table. All the data in the column will be lost.
  - Added the required column `full_name` to the `PlatformAdmin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `PlatformAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlatformAdmin" DROP COLUMN "fullName",
DROP COLUMN "passwordHash",
ADD COLUMN     "full_name" TEXT NOT NULL,
ADD COLUMN     "password_hash" TEXT NOT NULL;
