const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

// Documented local password. A VPS that copied the example must not
// keep this as the platform admin credential.
const INSECURE_SEED_PASSWORDS = new Set([
  "123456",
  "password",
  "change-me",
  "replace-with-admin-password",
]);

function envFlag(name, defaultValue) {
  const value = process.env[name];
  if (value === undefined || value === "") {
    return defaultValue;
  }
  return value === "true" || value === "1";
}

async function main() {
  console.log("INICIANDO SEED...");

  const allowInsecure = envFlag(
    "ALLOW_INSECURE_DEFAULTS",
    process.env.NODE_ENV !== "production",
  );
  const email = process.env.PLATFORM_ADMIN_EMAIL || "admin@nanaburger.com";
  const password = process.env.PLATFORM_ADMIN_PASSWORD || "123456";

  if (!allowInsecure && INSECURE_SEED_PASSWORDS.has(password)) {
    console.error(
      "Refusing to seed a documented default password. Set PLATFORM_ADMIN_PASSWORD or ALLOW_INSECURE_DEFAULTS=true (local only).",
    );
    process.exit(1);
  }

  if (!allowInsecure && password.length < 8) {
    console.error("PLATFORM_ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  const existingAdmin = await prisma.platformAdmin.findUnique({
    where: { email },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.platformAdmin.create({
      data: {
        email,
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
