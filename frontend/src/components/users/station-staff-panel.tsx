"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import {
  RestaurantUser,
  usersService,
} from "@/src/services/users.service";
import { UserRole } from "@/src/types/auth";

const STATIONS: Array<{ role: UserRole; label: string; href: string }> = [
  { role: "CASHIER", label: "Cajero", href: "/restaurant/admin/users/create?station=CASHIER" },
  { role: "WAITER", label: "Mesero", href: "/restaurant/admin/users/create?station=WAITER" },
  { role: "KITCHEN", label: "Cocina", href: "/restaurant/admin/users/create?station=KITCHEN" },
  { role: "DELIVERY", label: "Domicilio", href: "/restaurant/admin/users/create?station=DELIVERY" },
];

/**
 * Shown when the tenant only has admin. One form creates the four
 * station logins (`cashier|waiter|kitchen|delivery@{slug}.test`).
 */
export function StationStaffPanel({
  users,
  onCreated,
}: {
  users: RestaurantUser[];
  onCreated: () => Promise<void>;
}) {
  const missing = useMemo(() => {
    const present = new Set(users.map((user) => user.role));
    return STATIONS.filter((station) => !present.has(station.role));
  }, [users]);

  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (missing.length === 0) return null;

  async function handleProvision(event: FormEvent) {
    event.preventDefault();
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setBusy(true);
      setError("");
      setMessage("");
      const result = await usersService.provisionStationStaff(password);
      setPassword("");
      setMessage(
        result.created.length
          ? `Creados ${result.created.map((u) => u.email).join(", ")}`
          : "Esas estaciones ya existían",
      );
      await onCreated();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo crear el personal"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-amber-900/60 bg-zinc-950 px-5 py-4">
      <div>
        <h2 className="text-xl font-bold">Faltan estaciones</h2>
        <p className="text-sm text-zinc-400">
          Solo el admin puede entrar. Crea mesero, cocina, caja y domicilio
          de un golpe, o uno por uno.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {missing.map((station) => (
          <Link
            key={station.role}
            href={station.href}
            className="rounded-xl border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900"
          >
            Crear {station.label}
          </Link>
        ))}
      </div>

      <form onSubmit={handleProvision} className="flex flex-wrap gap-3">
        <input
          type="password"
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Contraseña de las estaciones"
          className="min-w-[14rem] flex-1 rounded-xl border border-zinc-700 bg-black px-3 py-2"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-white px-4 py-2 font-bold text-black disabled:opacity-50"
        >
          {busy ? "Creando..." : "Crear las que faltan"}
        </button>
      </form>
      <p className="text-xs text-zinc-500">
        Emails: cashier/waiter/kitchen/delivery@&#123;slug&#125;.test
      </p>
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-emerald-400">{message}</p>}
    </section>
  );
}
