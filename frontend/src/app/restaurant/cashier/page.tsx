"use client";

import { useRouter } from "next/navigation";

import { RoleHub } from "@/src/components/ops/role-hub";
import { useAuthStore } from "@/src/store/auth.store";

export default function CashierPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <RoleHub
      eyebrow="Estación caja"
      title="Cajero"
      subtitle={`${user?.fullName ?? "Cajero"} — cierra ventas y registra el cobro.`}
      onLogout={() => {
        logout();
        router.push("/restaurant/roles");
      }}
      links={[
        {
          href: "/restaurant/cashier/payments",
          title: "Cobrar órdenes",
          description: "READY → cerrar venta → pago",
        },
        {
          href: "/restaurant/cashier/pos",
          title: "POS mostrador",
          description: "Pickup sin mesa, cobrar o mandar a cocina",
        },
        {
          href: "/restaurant/cashier/orders",
          title: "Órdenes",
          description: "Vista general para caja",
        },
        {
          href: "/restaurant/cashier/delivery",
          title: "Despachar domicilios",
          description: "Pedidos pending → en camino",
        },
        {
          href: "/restaurant/cashier/cash",
          title: "Caja",
          description: "Ingresos y egresos manuales",
        },
      ]}
    />
  );
}
