"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import {
  paymentMethodsService,
  RestaurantPaymentMethod,
} from "@/src/services/payment-methods.service";

/**
 * Restaurant settings hub. Phase 0: configure which payment methods are
 * offered at checkout (enable/disable + display label).
 */
export default function AdminSettingsPage() {
  const [methods, setMethods] = useState<RestaurantPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [draftLabels, setDraftLabels] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const rows = await paymentMethodsService.getAll(false);
      setMethods(rows);
      setDraftLabels(
        Object.fromEntries(rows.map((row) => [row.id, row.label])),
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar los métodos"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggle(row: RestaurantPaymentMethod) {
    try {
      setBusyId(row.id);
      setError("");
      setMessage("");
      await paymentMethodsService.update(row.id, { isActive: !row.isActive });
      setMessage(
        row.isActive
          ? `${row.label} desactivado`
          : `${row.label} activado`,
      );
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo actualizar el método"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleSaveLabel(row: RestaurantPaymentMethod) {
    const next = (draftLabels[row.id] ?? "").trim();
    if (!next || next === row.label) return;

    try {
      setBusyId(row.id);
      setError("");
      setMessage("");
      await paymentMethodsService.update(row.id, { label: next });
      setMessage("Nombre actualizado");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo guardar el nombre"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black">Configuración</h1>
        <p className="text-zinc-400">
          Ajustes del restaurante. Más opciones se irán sumando aquí.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Métodos de pago</h2>
            <p className="text-sm text-zinc-400">
              Activa o renombra los métodos que aparecen al cobrar. Debe
              quedar al menos uno activo.
            </p>
          </div>
          <Link
            href="/restaurant/admin/restaurant"
            className="text-sm text-zinc-400 underline hover:text-white"
          >
            Datos del restaurante →
          </Link>
        </div>

        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-emerald-400">{message}</p>}

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <ul className="space-y-3">
            {methods.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="min-w-[5.5rem]">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                    Código
                  </p>
                  <p className="font-mono text-sm">{row.method}</p>
                </div>

                <label className="min-w-[12rem] flex-1 space-y-1 text-sm">
                  <span className="text-zinc-500">Nombre visible</span>
                  <input
                    type="text"
                    value={draftLabels[row.id] ?? ""}
                    disabled={busyId === row.id}
                    onChange={(e) =>
                      setDraftLabels((prev) => ({
                        ...prev,
                        [row.id]: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
                  />
                </label>

                <button
                  type="button"
                  disabled={
                    busyId === row.id ||
                    (draftLabels[row.id] ?? "").trim() === row.label ||
                    !(draftLabels[row.id] ?? "").trim()
                  }
                  onClick={() => handleSaveLabel(row)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold hover:bg-zinc-900 disabled:opacity-40"
                >
                  Guardar nombre
                </button>

                <button
                  type="button"
                  disabled={busyId === row.id}
                  onClick={() => handleToggle(row)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-40 ${
                    row.isActive
                      ? "bg-emerald-600/20 text-emerald-400"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {row.isActive ? "Activo" : "Inactivo"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
