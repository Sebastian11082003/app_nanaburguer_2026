"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import {
  cashService,
  CashMovement,
  CashType,
} from "@/src/services/cash.service";

/**
 * Shared cash book for admin and cashier. Movements are tenant-scoped on
 * the API; this UI never sends restaurantId. When `from` is set (open
 * shift), the list and running balance cover that window only.
 */
export function CashMovementsPanel({ from }: { from?: string }) {
  const [rows, setRows] = useState<CashMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<CashType>("INCOME");
  const [concept, setConcept] = useState("");
  const [pesos, setPesos] = useState("");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setLoading(true);
      setError("");
      setRows(await cashService.getAll(from));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar los movimientos"));
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [from]);

  useEffect(() => {
    load();
  }, [load]);

  const balanceCents = useMemo(() => {
    return rows.reduce((acc, row) => {
      return row.type === "INCOME"
        ? acc + row.amountCents
        : acc - row.amountCents;
    }, 0);
  }, [rows]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const amountCents = Math.round(Number(pesos) * 100);
    if (!concept.trim() || !Number.isFinite(amountCents) || amountCents < 1) {
      setError("Concepto y un monto mayor a 0 son obligatorios");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");
      const created = await cashService.create({
        type,
        concept: concept.trim(),
        amountCents,
        reference: reference.trim() || undefined,
      });
      setRows((prev) => [created, ...prev]);
      setMessage("Movimiento registrado");
      setConcept("");
      setPesos("");
      setReference("");
      await load({ silent: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo registrar el movimiento"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">
        <p className="text-sm text-zinc-400">
          {from ? "Saldo del turno" : "Saldo de movimientos"}
        </p>
        <p className="mt-1 text-2xl font-black">{formatCents(balanceCents)}</p>
        <p className="mt-1 text-sm text-zinc-500">
          Ingresos menos egresos del libro. Un cobro en efectivo también
          deja un ingreso automático (SALE_PAYMENT).
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
      >
        <p className="font-bold">Nuevo movimiento</p>
        <div className="flex flex-wrap gap-3">
          <select
            value={type}
            onChange={(event) => setType(event.target.value as CashType)}
            className="rounded-xl border border-zinc-700 bg-black px-3 py-2"
          >
            <option value="INCOME">Ingreso</option>
            <option value="EXPENSE">Egreso</option>
          </select>
          <input
            value={concept}
            onChange={(event) => setConcept(event.target.value)}
            placeholder="Concepto"
            className="min-w-[12rem] flex-1 rounded-xl border border-zinc-700 bg-black px-3 py-2"
          />
          <input
            value={pesos}
            onChange={(event) => setPesos(event.target.value)}
            placeholder="Monto (COP)"
            inputMode="decimal"
            className="w-36 rounded-xl border border-zinc-700 bg-black px-3 py-2"
          />
          <input
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="Referencia (opcional)"
            className="min-w-[10rem] flex-1 rounded-xl border border-zinc-700 bg-black px-3 py-2"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-white px-4 py-2 font-bold text-black disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Registrar"}
          </button>
        </div>
      </form>

      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-emerald-400">{message}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4"
            >
              <div>
                <p className="font-bold">{row.concept}</p>
                <p className="text-sm text-zinc-500">
                  {row.type === "INCOME" ? "Ingreso" : "Egreso"}
                  {row.createdBy?.fullName
                    ? ` · ${row.createdBy.fullName}`
                    : ""}
                  {" · "}
                  {new Date(row.createdAt).toLocaleString()}
                  {row.reference ? ` · ${row.reference}` : ""}
                </p>
              </div>
              <p
                className={`font-bold ${
                  row.type === "EXPENSE" ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {row.type === "EXPENSE" ? "−" : "+"}
                {formatCents(row.amountCents)}
              </p>
            </div>
          ))}

          {rows.length === 0 && (
            <p className="text-zinc-400">Aún no hay movimientos de caja</p>
          )}
        </div>
      )}
    </div>
  );
}
