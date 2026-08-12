"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { deliveryService, DeliveryRecord } from "@/src/services/delivery.service";

export default function CashierDeliveryPage() {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await deliveryService.getAll();
      setDeliveries(data.filter((d) => d.status === "PENDING"));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar pedidos"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDispatch(id: string) {
    try {
      setBusyId(id);
      setError("");
      await deliveryService.dispatch(id);
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo despachar el pedido"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="brand-atmosphere min-h-screen px-6 py-10 text-paper">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-flame">
              Caja
            </p>
            <h1 className="mt-2 font-display text-4xl">Despachar domicilios</h1>
            <p className="mt-2 text-muted">
              Asigna repartidor a los pedidos pendientes.
            </p>
          </div>
          <Link href="/restaurant/cashier" className="text-sm text-muted hover:text-paper">
            ← Volver
          </Link>
        </div>

        {error && <p className="text-danger">{error}</p>}

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="space-y-3">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="panel-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl">
                      {delivery.customerName}
                    </h2>
                    <p className="text-sm text-muted">
                      {delivery.address ?? "Pickup"} · {delivery.phone}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busyId === delivery.id}
                    onClick={() => handleDispatch(delivery.id)}
                    className="btn-primary px-5 py-3 text-sm disabled:opacity-50"
                  >
                    {busyId === delivery.id ? "..." : "Despachar"}
                  </button>
                </div>
              </div>
            ))}
            {deliveries.length === 0 && (
              <p className="text-muted">No hay pedidos pendientes por despachar</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
