"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import {
  canOpenTable,
  deliveryHref,
  pickupHref,
  tableOrderHref,
} from "@/src/lib/pos-nav";
import { tablesService } from "@/src/services/tables.service";
import { Table } from "@/src/services/tables.service";
import { useAuthStore } from "@/src/store/auth.store";

/**
 * Occupied cards used to always paint a currency amount, so a CREATED
 * ticket with no lines looked like a $0 bill. Only underline a real total.
 */
function OccupancyAmount({ cents }: { cents: number }) {
  if (cents <= 0) {
    return (
      <p className="mt-auto pt-3 text-[11px] font-medium text-muted sm:text-sm">
        Sin cuenta
      </p>
    );
  }
  return (
    <p className="mt-auto pt-3 text-sm font-semibold text-sky-400 underline">
      {formatCents(cents)}
    </p>
  );
}

function ChannelCard({
  title,
  occupied,
  totalCents,
  onClick,
}: {
  title: string;
  occupied: boolean;
  totalCents: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[132px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 text-left transition hover:-translate-y-0.5 hover:border-flame/40 sm:min-h-[140px]"
    >
      <div
        className={`w-1.5 shrink-0 ${occupied ? "bg-red-500" : "bg-emerald-400"}`}
      />
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted sm:text-xs sm:tracking-[0.16em]">
          {occupied ? "Ocupada" : "Disponible"}
        </p>
        <h2 className="mt-1.5 font-display text-base leading-tight sm:mt-2 sm:text-xl">
          {title}
        </h2>
        {occupied && <OccupancyAmount cents={totalCents} />}
      </div>
    </button>
  );
}

/**
 * Loggro-style occupancy board: tables + Llevar + Domicilios.
 * Poll like KDS so caja sees a mesa turn red without a refresh.
 * Empty CREATED pickup/delivery drafts are omitted by the floor API so
 * opening Llevar by mistake does not leave the channel card occupied.
 */
const FLOOR_POLL_MS = 8000;

export function FloorBoard() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const [tables, setTables] = useState<Table[]>([]);
  const [pickup, setPickup] = useState({ count: 0, totalCents: 0 });
  const [delivery, setDelivery] = useState({ count: 0, totalCents: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) {
        setLoading(true);
        setError("");
      }
      const data = await tablesService.getFloor();
      setTables(data.tables.filter((table) => table.isActive));
      setPickup(data.pickup);
      setDelivery(data.delivery);
      if (opts?.silent) setError("");
    } catch (err: unknown) {
      if (!opts?.silent) {
        setError(getErrorMessage(err, "No se pudo cargar el piso"));
      }
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      void load({ silent: true });
    }, FLOOR_POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  function openTable(table: Table) {
    if (!canOpenTable(role)) return;
    router.push(`${tableOrderHref()}?tableId=${table.id}`);
  }

  const pickupHrefForRole = pickupHref(role);
  const deliveryHrefForRole = deliveryHref(role);

  if (loading) return <p className="text-muted">Cargando mesas...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
      {tables.map((table) => {
        const occupied = Boolean(table.activeOrder);
        return (
          <button
            key={table.id}
            type="button"
            onClick={() => openTable(table)}
            className="flex min-h-[132px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 text-left transition hover:-translate-y-0.5 hover:border-flame/40 sm:min-h-[140px]"
          >
            <div
              className={`w-1.5 shrink-0 ${
                occupied ? "bg-red-500" : "bg-emerald-400"
              }`}
            />
            <div className="flex flex-1 flex-col p-3 sm:p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted sm:text-xs sm:tracking-[0.16em]">
                {occupied ? "Ocupada" : "Disponible"}
              </p>
              <h2 className="mt-1.5 font-display text-base leading-tight sm:mt-2 sm:text-xl">
                Mesa {table.label}
              </h2>
              {occupied && (
                <OccupancyAmount cents={table.activeOrder?.totalCents ?? 0} />
              )}
            </div>
          </button>
        );
      })}

      {pickupHrefForRole ? (
        <ChannelCard
          title="Llevar · Recoger"
          occupied={pickup.count > 0}
          totalCents={pickup.totalCents}
          onClick={() => router.push(pickupHrefForRole)}
        />
      ) : null}
      {deliveryHrefForRole ? (
        <ChannelCard
          title="Domicilios"
          occupied={delivery.count > 0}
          totalCents={delivery.totalCents}
          onClick={() => router.push(deliveryHrefForRole)}
        />
      ) : null}
    </div>
  );
}
