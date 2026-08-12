"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import {
  Permission,
  RestaurantRole,
  rolesService,
} from "@/src/services/roles.service";
import { UserRole } from "@/src/types/auth";

const STATIONS: UserRole[] = [
  "ADMIN",
  "CASHIER",
  "WAITER",
  "KITCHEN",
  "DELIVERY",
];

/**
 * Admin matrix for system + custom roles. System templates can be tuned;
 * custom roles pick a login station and any permission set.
 */
export default function AdminRolesPage() {
  const [roles, setRoles] = useState<RestaurantRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [draftName, setDraftName] = useState("");
  const [draftStation, setDraftStation] = useState<UserRole>("WAITER");
  const [draftCodes, setDraftCodes] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [roleRows, permRows] = await Promise.all([
        rolesService.getAll(),
        rolesService.listPermissions(),
      ]);
      setRoles(roleRows);
      setPermissions(permRows);
      if (!selectedId && roleRows[0]) {
        selectRole(roleRows[0]);
      } else if (selectedId) {
        const fresh = roleRows.find((r) => r.id === selectedId);
        if (fresh) selectRole(fresh);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar los roles"));
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, []);

  function selectRole(role: RestaurantRole) {
    setCreating(false);
    setSelectedId(role.id);
    setDraftName(role.name);
    setDraftStation(role.stationKey);
    setDraftCodes(new Set(role.permissions.map((p) => p.permission.code)));
  }

  function startCreate() {
    setCreating(true);
    setSelectedId(null);
    setDraftName("");
    setDraftStation("WAITER");
    setDraftCodes(new Set());
  }

  function toggleCode(code: string) {
    setDraftCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  const grouped = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const p of permissions) {
      const list = map.get(p.groupName) ?? [];
      list.push(p);
      map.set(p.groupName, list);
    }
    return [...map.entries()];
  }, [permissions]);

  const selected = roles.find((r) => r.id === selectedId) ?? null;

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const codes = [...draftCodes];

    try {
      setBusy(true);
      setError("");
      setMessage("");

      if (creating) {
        const created = await rolesService.create({
          name: draftName.trim(),
          stationKey: draftStation,
          permissionCodes: codes,
        });
        setMessage(`Rol "${created.name}" creado`);
        setCreating(false);
        setSelectedId(created.id);
      } else if (selected) {
        await rolesService.update(selected.id, {
          name: draftName.trim(),
          stationKey: selected.isSystem ? undefined : draftStation,
          permissionCodes: codes,
        });
        setMessage("Rol actualizado");
      }

      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo guardar el rol"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black">Roles y permisos</h1>
          <p className="text-zinc-400">
            Plantillas del sistema + roles custom. La estación define el login
            (admin, mesero, etc.); la matriz define qué puede hacer.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="rounded-xl bg-white px-5 py-3 font-bold text-black"
        >
          + Rol custom
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-emerald-400">{message}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-2">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => selectRole(role)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                  selectedId === role.id && !creating
                    ? "border-white bg-white text-black"
                    : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-600"
                }`}
              >
                <span className="font-semibold">{role.name}</span>
                <span className="mt-0.5 block text-[10px] uppercase tracking-wide opacity-70">
                  {role.isSystem ? "Sistema" : "Custom"} · {role.stationKey}
                  {role._count ? ` · ${role._count.users} users` : ""}
                </span>
              </button>
            ))}
          </aside>

          <form
            onSubmit={handleSave}
            className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
          >
            <div className="flex flex-wrap gap-3">
              <label className="min-w-[12rem] flex-1 space-y-1 text-sm">
                <span className="text-zinc-500">Nombre</span>
                <input
                  required
                  value={draftName}
                  disabled={busy || (!!selected?.isSystem && !creating)}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 disabled:opacity-60"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-zinc-500">Estación de login</span>
                <select
                  value={draftStation}
                  disabled={busy || (!!selected?.isSystem && !creating)}
                  onChange={(e) =>
                    setDraftStation(e.target.value as UserRole)
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 disabled:opacity-60"
                >
                  {STATIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selected?.isSystem && !creating && (
              <p className="text-xs text-zinc-500">
                Rol del sistema: puedes ajustar permisos; el nombre y la
                estación están fijos.
              </p>
            )}

            <div className="space-y-4">
              {grouped.map(([group, perms]) => (
                <fieldset key={group} className="space-y-2">
                  <legend className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                    {group}
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {perms.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex cursor-pointer items-start gap-2 rounded-xl border border-zinc-800 px-3 py-2 text-sm hover:border-zinc-600"
                      >
                        <input
                          type="checkbox"
                          checked={draftCodes.has(perm.code)}
                          disabled={busy}
                          onChange={() => toggleCode(perm.code)}
                          className="mt-1"
                        />
                        <span>
                          <span className="font-medium">{perm.name}</span>
                          <span className="mt-0.5 block font-mono text-[10px] text-zinc-500">
                            {perm.code}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="submit"
                disabled={busy || !draftName.trim()}
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-40"
              >
                {busy
                  ? "Guardando..."
                  : creating
                    ? "Crear rol"
                    : "Guardar cambios"}
              </button>
              {creating && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setCreating(false);
                    if (roles[0]) selectRole(roles[0]);
                  }}
                  className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm"
                >
                  Cancelar
                </button>
              )}
              <Link
                href="/restaurant/admin/users"
                className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-400 hover:text-white"
              >
                Ir a usuarios
              </Link>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
