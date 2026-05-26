import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "@/src/components/shared/theme-toggle";

const roles = [
  {
    name: "Administrador",
    description: "Gestión total del restaurante",
    icon: "👑",
    href: "/restaurant/admin",
    color: "from-yellow-500/20 to-yellow-700/10",
  },
  {
    name: "Cajero",
    description: "Punto de venta y cobros",
    icon: "💳",
    href: "/restaurant/cashier",
    color: "from-emerald-500/20 to-emerald-700/10",
  },
  {
    name: "Mesero",
    description: "Órdenes y mesas",
    icon: "🍽️",
    href: "/restaurant/waiter",
    color: "from-blue-500/20 to-blue-700/10",
  },
  {
    name: "Delivery",
    description: "Gestión de domicilios",
    icon: "🛵",
    href: "/restaurant/delivery",
    color: "from-purple-500/20 to-purple-700/10",
  },
];

export default function RestaurantPage() {
  return (
    <>
      <ThemeToggle />

      <main className="min-h-screen bg-[var(--background)] px-4 py-10">
        <div className="mx-auto flex min-h-[90vh] max-w-6xl items-center justify-center">
          <section
            className="
              relative
              w-full
              overflow-hidden
              rounded-[32px]
              border
              border-[var(--border)]
              bg-[var(--card)]
              shadow-2xl
            "
          >
            {/* BACKGROUND EFFECT */}
            <div
              className="
                absolute
                inset-0
                bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_40%)]
                pointer-events-none
              "
            />

            {/* HEADER */}
            <header
              className="
                relative
                border-b
                border-[var(--border)]
                bg-black
                px-6
                py-12
                md:px-12
              "
            >
              <div
                className="
                  flex
                  flex-col
                  items-center
                  justify-between
                  gap-8
                  md:flex-row
                "
              >
                {/* LEFT */}
                <div className="flex items-center gap-6">
                  {/* LOGO */}
                  <div
                    className="
                      overflow-hidden
                      rounded-3xl
                      border
                      border-zinc-800
                      bg-white
                      p-4
                      shadow-2xl
                    "
                  >
                    <Image
                      src="/logo/nana-logo.jpeg"
                      alt="NanaBurger"
                      width={140}
                      height={140}
                      priority
                      className="h-auto w-28 object-contain md:w-32"
                    />
                  </div>

                  {/* TITLE */}
                  <div>
                    <h1
                      className="
                        text-4xl
                        font-black
                        tracking-tight
                        text-white
                        md:text-5xl
                      "
                    >
                      NanaBurger
                    </h1>

                    <p
                      className="
                        mt-3
                        max-w-md
                        text-sm
                        leading-relaxed
                        text-zinc-400
                        md:text-base
                      "
                    >
                      Plataforma inteligente de operación multi-tenant para
                      restaurantes.
                    </p>
                  </div>
                </div>

                {/* STATUS */}
                <div
                  className="
                    rounded-2xl
                    border
                    border-emerald-500/20
                    bg-emerald-500/10
                    px-5
                    py-3
                    text-sm
                    font-medium
                    text-emerald-400
                    backdrop-blur-xl
                  "
                >
                  Sistema operativo activo
                </div>
              </div>
            </header>

            {/* CONTENT */}
            <div className="relative px-6 py-8 md:px-12 md:py-10">
              {/* TITLE */}
              <div className="mb-8">
                <h2
                  className="
                    text-2xl
                    font-bold
                    text-[var(--foreground)]
                  "
                >
                  Selecciona un módulo
                </h2>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  Accede rápidamente a las áreas operativas del restaurante.
                </p>
              </div>

              {/* GRID */}
              <div
                className="
                  grid
                  gap-5
                  md:grid-cols-2
                "
              >
                {roles.map((role) => (
                  <Link
                    key={role.name}
                    href={role.href}
                    className="
                      group
                      relative
                      overflow-hidden
                      rounded-3xl
                      border
                      border-[var(--border)]
                      bg-[var(--card)]
                      p-6
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-zinc-700
                      hover:shadow-2xl
                    "
                  >
                    {/* GRADIENT */}
                    <div
                      className={`
                        absolute
                        inset-0
                        bg-gradient-to-br
                        ${role.color}
                        opacity-0
                        transition-opacity
                        duration-300
                        group-hover:opacity-100
                      `}
                    />

                    <div className="relative flex items-start gap-5">
                      {/* ICON */}
                      <div
                        className="
                          flex
                          h-16
                          w-16
                          items-center
                          justify-center
                          rounded-2xl
                          border
                          border-zinc-800
                          bg-black
                          text-3xl
                          shadow-xl
                        "
                      >
                        {role.icon}
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1">
                        <h3
                          className="
                            text-xl
                            font-bold
                            text-[var(--foreground)]
                          "
                        >
                          {role.name}
                        </h3>

                        <p
                          className="
                            mt-2
                            text-sm
                            leading-relaxed
                            text-[var(--muted)]
                          "
                        >
                          {role.description}
                        </p>

                        {/* ACTION */}
                        <div
                          className="
                            mt-5
                            inline-flex
                            items-center
                            gap-2
                            text-sm
                            font-semibold
                            text-white
                            transition-all
                            group-hover:translate-x-1
                          "
                        >
                          Ingresar
                          <span>→</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
