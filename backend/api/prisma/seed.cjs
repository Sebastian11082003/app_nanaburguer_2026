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
  } else {
    console.log("SUPER ADMIN YA EXISTE");
  }

  await seedDemoTenant(prisma, {
    staffPassword: password,
    allowInsecure,
  });
}

/**
 * Demo tenant created from platform. Brand + one sellable item so the
 * POS can open a ticket without an empty catalog (still scoped to that
 * restaurantId — never a global menu). Also plants a restaurant ADMIN
 * so the local can void tickets, and a KITCHEN user so the KDS is a
 * login, not a hidden URL.
 */
async function seedDemoTenant(prisma, { staffPassword, allowInsecure }) {
  const restaurant = await prisma.restaurant.findFirst({
    where: { slug: "nana-neiva" },
  });
  if (!restaurant) return;

  if (!restaurant.logoUrl) {
    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: { logoUrl: "/logo/nana-logo.jpeg" },
    });
    console.log("LOGO DE NANA-NEIVA ASIGNADO");
  }

  let category = await prisma.category.findFirst({
    where: { restaurantId: restaurant.id, name: "Hamburguesas" },
  });
  if (!category) {
    category = await prisma.category.create({
      data: { name: "Hamburguesas", restaurantId: restaurant.id },
    });
  }

  const existingItem = await prisma.menuItem.findFirst({
    where: { restaurantId: restaurant.id, name: "NANA Clásica" },
  });
  if (!existingItem) {
    await prisma.menuItem.create({
      data: {
        name: "NANA Clásica",
        description: "Hamburguesa de casa",
        priceCents: 18000,
        restaurantId: restaurant.id,
        categoryId: category.id,
      },
    });
    console.log("MENÚ DEMO DE NANA-NEIVA ASIGNADO");
  }

  await seedDemoAdmin(prisma, restaurant.id, staffPassword, allowInsecure);
  await seedDemoKitchen(prisma, restaurant.id, staffPassword, allowInsecure);
}

async function seedDemoAdmin(
  prisma,
  restaurantId,
  staffPassword,
  allowInsecure,
) {
  const email = "admin@nana-neiva.test";
  const existingAdmin = await prisma.user.findFirst({
    where: { restaurantId, role: "ADMIN" },
  });
  if (existingAdmin) {
    console.log("ADMIN DE NANA-NEIVA YA EXISTE");
    return;
  }

  if (!allowInsecure && INSECURE_SEED_PASSWORDS.has(staffPassword)) {
    console.log(
      "Omitiendo admin de nana-neiva: password de seed inseguro en este entorno.",
    );
    return;
  }

  const adminRole = await prisma.role.findFirst({
    where: { restaurantId, systemKey: "ADMIN" },
  });
  const passwordHash = await bcrypt.hash(staffPassword, 10);

  await prisma.user.create({
    data: {
      email,
      fullName: "Admin Nana",
      passwordHash,
      role: "ADMIN",
      roleId: adminRole?.id,
      restaurantId,
    },
  });
  console.log("ADMIN DE NANA-NEIVA CREADO");
}

/**
 * KDS is a RoleHub, not the POS floor. Without a kitchen user the
 * station is only reachable by pasting /restaurant/kitchen.
 */
async function seedDemoKitchen(
  prisma,
  restaurantId,
  staffPassword,
  allowInsecure,
) {
  const email = "kitchen@nana-neiva.test";
  const existing = await prisma.user.findFirst({
    where: { restaurantId, role: "KITCHEN" },
  });
  if (existing) {
    console.log("KITCHEN DE NANA-NEIVA YA EXISTE");
    return;
  }

  if (!allowInsecure && INSECURE_SEED_PASSWORDS.has(staffPassword)) {
    console.log(
      "Omitiendo kitchen de nana-neiva: password de seed inseguro en este entorno.",
    );
    return;
  }

  const kitchenRole = await prisma.role.findFirst({
    where: { restaurantId, systemKey: "KITCHEN" },
  });
  const passwordHash = await bcrypt.hash(staffPassword, 10);

  await prisma.user.create({
    data: {
      email,
      fullName: "Cocina Nana",
      passwordHash,
      role: "KITCHEN",
      roleId: kitchenRole?.id,
      restaurantId,
    },
  });
  console.log("KITCHEN DE NANA-NEIVA CREADO");
}

main()
  .catch((error) => {
    console.error("ERROR EN SEED:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
