"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { platformService } from "@/src/services/platform.service";
import { usePlatformAuthStore } from "@/src/store/platform-auth.store";
import { PlatformRestaurant } from "@/src/types/platform";

export default function PlatformDashboardPage() {
  const { admin } = usePlatformAuthStore();
  const [rows, setRows] = useState<PlatformRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    platformService
      .getRestaurants()
      .then(setRows)
      .catch((err: unknown) =>
        setError(getErrorMessage(err, "No se pudieron cargar restaurantes")),
      )
      .finally(() => setLoading(false));
  }, []);

  const active = rows.filter((r) => r.isActive).length;

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">Platform Dashboard</h1>
            <p className="mt-2 text-zinc-400">Bienvenido {admin?.fullName}</p>
          </div>
          <Link
            href="/platform/restaurants"
            className="rounded-2xl bg-white px-6 py-3 font-bold text-black transition-all hover:scale-105"
          >
            Restaurantes
          </Link>
        </div>

        {error && <p className="mb-6 text-red-500">{error}</p>}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400">Restaurantes</p>
            <h2 className="mt-2 text-5xl font-black">
              {loading ? "…" : rows.length}
            </h2>
          </div>
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400">Tenants activos</p>
            <h2 className="mt-2 text-5xl font-black">
              {loading ? "…" : active}
            </h2>
          </div>
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400">Revenue</p>
            <h2 className="mt-2 text-5xl font-black">—</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Por tenant, en el dashboard del restaurante. La plataforma no
              consolida ventas todavía.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
