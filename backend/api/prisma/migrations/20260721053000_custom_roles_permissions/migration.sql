-- CreateTable
CREATE TABLE "permission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "group_name" TEXT NOT NULL,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "systemKey" "UserRole",
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "stationKey" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "permission_code_key" ON "permission"("code");

-- CreateIndex
CREATE INDEX "role_restaurantId_isActive_idx" ON "role"("restaurantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "role_restaurantId_name_key" ON "role"("restaurantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "role_restaurantId_systemKey_key" ON "role"("restaurantId", "systemKey");

-- CreateIndex
CREATE INDEX "User_role_id_idx" ON "User"("role_id");

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
