"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import {
  RestaurantRole,
  rolesService,
} from "@/src/services/roles.service";
import { usersService } from "@/src/services/users.service";

export default function CreateUserPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState<RestaurantRole[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    roleId: "",
  });

  useEffect(() => {
    rolesService
      .getAll()
      .then((rows) => {
        const active = rows.filter((r) => r.isActive);
        setRoles(active);
        const waiter = active.find((r) => r.systemKey === "WAITER");
        setForm((prev) => ({
          ...prev,
          roleId: waiter?.id ?? active[0]?.id ?? "",
        }));
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, "No se pudieron cargar los roles"));
      });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      setBusy(true);
      setError("");
      await usersService.create({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        roleId: form.roleId,
      });
      router.push("/restaurant/admin/users");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo crear el usuario"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Crear usuario</h1>
          <p className="text-zinc-400">
            Asigna un rol del sistema o uno custom
          </p>
        </div>
        <Link
          href="/restaurant/admin/users"
          className="text-zinc-400 hover:text-white"
        >
          ← Volver
        </Link>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
      >
        <input
          required
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          placeholder="Nombre completo"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
        />

        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Correo"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
        />

        <input
          required
          type="password"
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Contraseña"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
        />

        <label className="block space-y-1 text-sm">
          <span className="text-zinc-400">Rol</span>
          <select
            required
            value={form.roleId}
            onChange={(e) => setForm({ ...form, roleId: e.target.value })}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
                {role.isSystem ? " (sistema)" : ""} · login {role.stationKey}
              </option>
            ))}
          </select>
        </label>

        <p className="text-xs text-zinc-500">
          ¿Necesitas un perfil distinto? Crea un rol custom en{" "}
          <Link href="/restaurant/admin/roles" className="underline">
            Roles y permisos
          </Link>
          .
        </p>

        <button
          type="submit"
          disabled={busy || !form.roleId}
          className="w-full rounded-xl bg-white py-3 font-bold text-black disabled:opacity-40"
        >
          {busy ? "Creando..." : "Crear usuario"}
        </button>
      </form>
    </div>
  );
}
