"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import {
  RestaurantRole,
  rolesService,
} from "@/src/services/roles.service";
import {
  RestaurantUser,
  usersService,
} from "@/src/services/users.service";
import { useAuthStore } from "@/src/store/auth.store";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const actorId = useAuthStore((s) => s.user?.id);
  const [user, setUser] = useState<RestaurantUser | null>(null);
  const [roles, setRoles] = useState<RestaurantRole[]>([]);
  const [fullName, setFullName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [next, roleRows] = await Promise.all([
        usersService.getById(id),
        rolesService.getAll(),
      ]);
      setUser(next);
      setFullName(next.fullName);
      setRoleId(next.roleId ?? "");
      setRoles(roleRows.filter((r) => r.isActive));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cargar el usuario"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    try {
      setBusy(true);
      setError("");
      setMessage("");
      const updated = await usersService.update(user.id, {
        fullName: fullName.trim(),
        roleId: roleId || undefined,
        ...(password.trim() ? { password: password.trim() } : {}),
      });
      setUser(updated);
      setPassword("");
      setMessage("Usuario actualizado");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo guardar"));
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleActive() {
    if (!user) return;
    try {
      setBusy(true);
      setError("");
      setMessage("");
      const updated = await usersService.update(user.id, {
        isActive: !user.isActive,
      });
      setUser(updated);
      setMessage(updated.isActive ? "Usuario activado" : "Usuario desactivado");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cambiar el estado"));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!user) {
    return (
      <div className="space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        <Link href="/restaurant/admin/users" className="text-zinc-400">
          ← Usuarios
        </Link>
      </div>
    );
  }

  const isSelf = actorId === user.id;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{user.fullName}</h1>
          <p className="text-zinc-400">{user.email}</p>
        </div>
        <Link
          href="/restaurant/admin/users"
          className="text-zinc-400 hover:text-white"
        >
          ← Volver
        </Link>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-emerald-400">{message}</p>}

      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
      >
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
        />
        <label className="block space-y-1 text-sm">
          <span className="text-zinc-400">Rol</span>
          <select
            required
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name} · login {role.stationKey}
              </option>
            ))}
          </select>
        </label>
        <input
          type="password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nueva contraseña (opcional)"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-white py-3 font-bold text-black disabled:opacity-40"
        >
          {busy ? "Guardando..." : "Guardar"}
        </button>
      </form>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <p className="text-sm text-zinc-400">
          Estado: {user.isActive ? "Activo" : "Inactivo"}. Un usuario inactivo
          no puede entrar por login de estación.
        </p>
        <button
          type="button"
          disabled={busy || (isSelf && user.isActive)}
          onClick={handleToggleActive}
          className="mt-4 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-bold disabled:opacity-40"
        >
          {user.isActive ? "Desactivar" : "Activar"}
        </button>
        {isSelf && user.isActive ? (
          <p className="mt-2 text-xs text-zinc-500">
            No puedes desactivar tu propio usuario.
          </p>
        ) : null}
      </div>
    </div>
  );
}
