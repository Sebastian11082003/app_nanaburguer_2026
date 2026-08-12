"use client";

import { useRouter } from "next/navigation";

import { RoleHub } from "@/src/components/ops/role-hub";
import { useAuthStore } from "@/src/store/auth.store";

export default function DeliveryPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <RoleHub
      eyebrow="Estación delivery"
      title="Delivery"
      subtitle={`${user?.fullName ?? "Delivery"} — toma pedidos a domicilio y para recoger.`}
      onLogout={() => {
        logout();
        router.push("/restaurant/roles");
      }}
      links={[
        {
          href: "/restaurant/delivery/orders",
          title: "Nuevo pedido",
          description: "Registrar domicilio o pickup",
        },
        {
          href: "/restaurant/delivery/active",
          title: "Activos",
          description: "Pedidos en curso",
        },
        {
          href: "/restaurant/delivery/history",
          title: "Historial",
          description: "Pedidos cerrados o entregados",
        },
      ]}
    />
  );
}
