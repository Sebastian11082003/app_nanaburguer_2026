"use client";

import { useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import {
  paymentMethodsService,
  RestaurantPaymentMethod,
} from "@/src/services/payment-methods.service";
import { PaymentMethod } from "@/src/services/payment.service";

type Props = {
  open: boolean;
  totalCents: number;
  busy?: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    method: PaymentMethod;
    receivedCents?: number;
  }) => void;
};

/**
 * Confirms close+pay using the restaurant's *active* payment methods.
 * For CASH, collects amount received and shows change.
 */
export function ClosePayModal({
  open,
  totalCents,
  busy = false,
  onClose,
  onConfirm,
}: Props) {
  const [methods, setMethods] = useState<RestaurantPaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [receivedInput, setReceivedInput] = useState("");

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setReceivedInput((totalCents / 100).toFixed(0));
    setLoadError("");
    setLoadingMethods(true);

    paymentMethodsService
      .getAll(true)
      .then((rows) => {
        if (cancelled) return;
        setMethods(rows);
        setMethod(rows[0]?.method ?? null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setMethods([]);
        setMethod(null);
        setLoadError(
          getErrorMessage(err, "No se pudieron cargar los métodos de pago"),
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingMethods(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, totalCents]);

  if (!open) return null;

  const receivedPesos = Number(receivedInput.replace(",", "."));
  const receivedCents = Number.isFinite(receivedPesos)
    ? Math.round(receivedPesos * 100)
    : NaN;
  const changeCents =
    method === "CASH" && Number.isFinite(receivedCents)
      ? receivedCents - totalCents
      : 0;
  const cashOk =
    method !== "CASH" ||
    (Number.isFinite(receivedCents) && receivedCents >= totalCents);
  const canConfirm =
    !!method && cashOk && totalCents > 0 && !loadingMethods && methods.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="close-pay-title"
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl"
      >
        <h2 id="close-pay-title" className="text-xl font-bold">
          Cerrar y cobrar
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Total a cobrar:{" "}
          <span className="font-semibold text-white">
            {formatCents(totalCents)}
          </span>
        </p>

        {loadError && <p className="mt-3 text-sm text-red-400">{loadError}</p>}
        {loadingMethods && (
          <p className="mt-3 text-sm text-zinc-500">Cargando métodos...</p>
        )}
        {!loadingMethods && methods.length === 0 && !loadError && (
          <p className="mt-3 text-sm text-amber-400">
            No hay métodos de pago activos. Actívalos en Configuración.
          </p>
        )}

        {methods.length > 0 && (
          <fieldset className="mt-4 space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Método de pago
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {methods.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={busy}
                  onClick={() => setMethod(option.method)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    method === option.method
                      ? "border-white bg-white text-black"
                      : "border-zinc-700 text-zinc-300 hover:border-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {method === "CASH" && (
          <label className="mt-4 block space-y-1 text-sm">
            <span className="text-zinc-400">Recibido</span>
            <input
              type="number"
              min={0}
              step={1}
              value={receivedInput}
              disabled={busy}
              onChange={(e) => setReceivedInput(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
            />
            <span
              className={`block text-xs ${
                changeCents < 0 ? "text-red-400" : "text-zinc-500"
              }`}
            >
              {Number.isFinite(receivedCents)
                ? `Cambio: ${formatCents(Math.max(changeCents, 0))}`
                : "Ingresa un monto válido"}
            </span>
          </label>
        )}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-sm font-semibold hover:bg-zinc-900 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={busy || !canConfirm}
            onClick={() => {
              if (!method) return;
              onConfirm({
                method,
                receivedCents: method === "CASH" ? receivedCents : undefined,
              });
            }}
            className="flex-1 rounded-xl bg-white py-2.5 text-sm font-bold text-black disabled:opacity-40"
          >
            {busy ? "Procesando..." : "Confirmar cobro"}
          </button>
        </div>
      </div>
    </div>
  );
}
