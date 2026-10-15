"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { StationStaffPanel } from "@/src/components/users/station-staff-panel";
import { usersService, RestaurantUser } from "@/src/services/users.service";

export default function UsersPage() {
  const [users, setUsers] = useState<RestaurantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setUsers(await usersService.getAll());
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar los usuarios"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black">Usuarios</h1>
          <p className="text-zinc-400">
            Personal del restaurante por rol (admin, mesero, caja, cocina,
            delivery)
          </p>
        </div>

        <Link
          href="/restaurant/admin/users/create"
          className="rounded-xl bg-white px-5 py-3 font-bold text-black"
        >
          + Nuevo usuario
        </Link>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {!loading && (
        <StationStaffPanel users={users} onCreated={load} />
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/restaurant/admin/users/${user.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 transition hover:border-white/40"
            >
              <div>
                <p className="font-bold">{user.fullName}</p>
                <p className="text-sm text-zinc-500">{user.email}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  {user.assignedRole?.name ?? user.role}
                </p>
                <p className="text-sm text-zinc-500">
                  Login {user.role} · {user.isActive ? "Activo" : "Inactivo"}
                </p>
              </div>
            </Link>
          ))}
          {users.length === 0 && (
            <p className="text-zinc-400">No hay usuarios registrados</p>
          )}
        </div>
      )}
    </div>
  );
}
