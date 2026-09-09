"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { CashMovementsPanel } from "@/src/components/cash/cash-movements-panel";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { paymentMethodLabel } from "@/src/lib/payment-method-label";
import {
  cashService,
  CashSession,
  CashSessionPreview,
} from "@/src/services/cash.service";

function pesosToCents(raw: string): number | null {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

function PreviewGrid({
  preview,
  openingCents,
}: {
  preview: CashSessionPreview;
  openingCents: number;
}) {
  const rows = [
    { label: "Ventas cobradas", value: preview.salesTotalCents },
    { label: "Efectivo", value: preview.cashSalesCents },
    { label: "Tarjeta", value: preview.cardSalesCents },
    { label: "Transferencia", value: preview.transferSalesCents },
    { label: "Otros", value: preview.otherSalesCents },
    { label: "Fondo inicial", value: openingCents },
    { label: "Ingresos manuales", value: preview.manualIncomeCents },
    { label: "Egresos", value: preview.expenseCents },
    { label: "Efectivo esperado", value: preview.expectedCashCents },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {rows.map((row) => (
        <div
          key={row.label}
          className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4"
        >
          <p className="text-sm text-zinc-400">{row.label}</p>
          <p className="mt-1 text-xl font-black">{formatCents(row.value)}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Shift close for admin/cashier. Movements stay in the shared book;
 * this panel owns open/preview/close + historical snapshots.
 */
export function CashShiftPanel() {
  const [session, setSession] = useState<CashSession | null>(null);
  const [preview, setPreview] = useState<CashSessionPreview | null>(null);
  const [history, setHistory] = useState<CashSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [openingPesos, setOpeningPesos] = useState("0");
  const [countedPesos, setCountedPesos] = useState("");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [current, sessions] = await Promise.all([
        cashService.currentSession(),
        cashService.listSessions(),
      ]);
      setSession(current.session);
      setPreview(current.preview);
      setHistory(sessions);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cargar el turno de caja"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleOpen(event: FormEvent) {
    event.preventDefault();
    const openingCents = pesosToCents(openingPesos);
    if (openingCents === null) {
      setError("El fondo inicial no puede ser negativo");
      return;
    }

    try {
      setBusy(true);
      setError("");
      setMessage("");
      await cashService.openSession({
        openingCents,
        notes: notes.trim() || undefined,
      });
      setNotes("");
      setMessage("Turno abierto");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo abrir el turno"));
    } finally {
      setBusy(false);
    }
  }

  async function handleClose(event: FormEvent) {
    event.preventDefault();
    if (!session) return;

    const countedRaw = countedPesos.trim();
    const countedCents =
      countedRaw === "" ? undefined : pesosToCents(countedRaw);
    if (countedRaw !== "" && countedCents === null) {
      setError("El efectivo contado no puede ser negativo");
      return;
    }

    try {
      setBusy(true);
      setError("");
      setMessage("");
      const closed = await cashService.closeSession(session.id, {
        countedCents,
        notes: notes.trim() || undefined,
      });
      setCountedPesos("");
      setNotes("");
      setMessage(
        closed.differenceCents == null
          ? "Turno cerrado"
          : `Turno cerrado · diferencia ${formatCents(closed.differenceCents)}`,
      );
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cerrar el turno"));
    } finally {
      setBusy(false);
    }
  }

  const closedHistory = history.filter((row) => row.status === "CLOSED");

  return (
    <div className="space-y-8">
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-emerald-400">{message}</p>}

      {loading ? (
        <p>Cargando turno...</p>
      ) : session ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Turno abierto</h2>
            <p className="text-sm text-zinc-400">
              Desde {new Date(session.openedAt).toLocaleString()}
              {session.openedBy?.fullName
                ? ` · ${session.openedBy.fullName}`
                : ""}
            </p>
          </div>

          {preview && (
            <PreviewGrid
              preview={preview}
              openingCents={session.openingCents}
            />
          )}

          {preview && preview.byMethod.length > 0 && (
            <ul className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-sm">
              {preview.byMethod.map((row) => (
                <li
                  key={row.method}
                  className="flex justify-between py-1"
                >
                  <span className="text-zinc-400">
                    {paymentMethodLabel(row.method)} ({row.count})
                  </span>
                  <span className="font-bold">
                    {formatCents(row.totalCents)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <form
            onSubmit={handleClose}
            className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
          >
            <p className="font-bold">Cerrar turno</p>
            <div className="flex flex-wrap gap-3">
              <input
                value={countedPesos}
                onChange={(event) => setCountedPesos(event.target.value)}
                placeholder="Efectivo contado (COP)"
                inputMode="decimal"
                className="w-52 rounded-xl border border-zinc-700 bg-black px-3 py-2"
              />
              <input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Notas (opcional)"
                className="min-w-[12rem] flex-1 rounded-xl border border-zinc-700 bg-black px-3 py-2"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-white px-4 py-2 font-bold text-black disabled:opacity-50"
              >
                {busy ? "Cerrando..." : "Cerrar caja"}
              </button>
            </div>
            <p className="text-sm text-zinc-500">
              El efectivo esperado es fondo + ventas en efectivo + ingresos
              manuales − egresos. Tarjeta y transferencia no entran al cajón.
              Si no contás, el cierre igual guarda el resumen.
            </p>
          </form>
        </section>
      ) : (
        <form
          onSubmit={handleOpen}
          className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
        >
          <div>
            <h2 className="text-2xl font-bold">Abrir turno</h2>
            <p className="text-sm text-zinc-400">
              Un solo turno abierto por restaurante. El cierre guarda el
              cuadre de este período.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              value={openingPesos}
              onChange={(event) => setOpeningPesos(event.target.value)}
              placeholder="Fondo inicial (COP)"
              inputMode="decimal"
              className="w-52 rounded-xl border border-zinc-700 bg-black px-3 py-2"
            />
            <input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Notas (opcional)"
              className="min-w-[12rem] flex-1 rounded-xl border border-zinc-700 bg-black px-3 py-2"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-white px-4 py-2 font-bold text-black disabled:opacity-50"
            >
              {busy ? "Abriendo..." : "Abrir caja"}
            </button>
          </div>
        </form>
      )}

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Movimientos</h2>
        <CashMovementsPanel from={session?.openedAt} />
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Cierres anteriores</h2>
        {closedHistory.length === 0 ? (
          <p className="text-zinc-400">Aún no hay cierres guardados</p>
        ) : (
          <div className="space-y-2">
            {closedHistory.map((row) => (
              <div
                key={row.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">
                      {new Date(row.openedAt).toLocaleString()} →{" "}
                      {row.closedAt
                        ? new Date(row.closedAt).toLocaleString()
                        : "—"}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {row.closedBy?.fullName
                        ? `Cerró ${row.closedBy.fullName}`
                        : "Cierre"}
                      {row.notes ? ` · ${row.notes}` : ""}
                    </p>
                  </div>
                  <p className="font-black">
                    {formatCents(row.salesTotalCents ?? 0)}
                  </p>
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  Efectivo {formatCents(row.cashSalesCents ?? 0)} · Tarjeta{" "}
                  {formatCents(row.cardSalesCents ?? 0)} · Transferencia{" "}
                  {formatCents(row.transferSalesCents ?? 0)} · Esperado{" "}
                  {formatCents(row.expectedCashCents ?? 0)}
                  {row.countedCents != null
                    ? ` · Contado ${formatCents(row.countedCents)}`
                    : ""}
                  {row.differenceCents != null
                    ? ` · Dif. ${formatCents(row.differenceCents)}`
                    : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
