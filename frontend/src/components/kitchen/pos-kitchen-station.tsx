"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { KitchenBoard } from "@/src/components/kitchen/kitchen-board";
import { posNavForUser } from "@/src/lib/pos-nav";
import { homeForRole } from "@/src/services/user-auth.service";
import { useAuthStore } from "@/src/store/auth.store";
import { OrderStatus } from "@/src/types/order";

type KitchenPane = "queue" | "preparing" | "ready";

const PANES: Array<{
  key: KitchenPane;
  label: string;
  title: string;
  description: string;
  status: OrderStatus;
  nextStatus?: OrderStatus;
  nextLabel?: string;
}> = [
  {
    key: "queue",
    label: "Cola",
    title: "Cola de cocina",
    description: "Órdenes de hoy enviadas — inicia preparación",
    status: "SENT_TO_KITCHEN",
    nextStatus: "IN_PREPARATION",
    nextLabel: "Empezar",
  },
  {
    key: "preparing",
    label: "Preparando",
    title: "En preparación",
    description: "Marca como listas cuando terminen",
    status: "IN_PREPARATION",
    nextStatus: "READY",
    nextLabel: "Marcar lista",
  },
  {
    key: "ready",
    label: "Listas",
    title: "Listas",
    description: "Listas para servir o cobrar",
    status: "READY",
  },
];

export function PosKitchenStation() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [pane, setPane] = useState<KitchenPane>("queue");
  const current = PANES.find((item) => item.key === pane) ?? PANES[0];

  useEffect(() => {
    const allowed = posNavForUser(user).some((item) => item.key === "kitchen");
    if (user && !allowed) {
      router.replace(homeForRole(user.role));
    }
  }, [router, user]);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto print:hidden">
        {PANES.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setPane(item.key)}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-4 py-1.5 text-sm ${
              item.key === pane
                ? "bg-paper text-ink"
                : "text-muted hover:bg-white/5 hover:text-paper"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <KitchenBoard
        key={current.key}
        embedded
        title={current.title}
        description={current.description}
        status={current.status}
        nextStatus={current.nextStatus}
        nextLabel={current.nextLabel}
      />
    </div>
  );
}
