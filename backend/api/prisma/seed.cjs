const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("INICIANDO SEED...");

  const existingAdmin = await prisma.platformAdmin.findUnique({
    where: { email: "admin@nanaburger.com" },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("123456", 10);

    await prisma.platformAdmin.create({
      data: {
        email: "admin@nanaburger.com",
        fullName: "Super Admin",
        passwordHash,
      },
    });

    console.log("SUPER ADMIN CREADO");
    return;
  }

  console.log("SUPER ADMIN YA EXISTE");
}

main()
  .catch((error) => {
    console.error("ERROR EN SEED:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
