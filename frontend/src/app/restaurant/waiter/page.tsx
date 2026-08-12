"use client";

import { useRouter } from "next/navigation";

import { RoleHub } from "@/src/components/ops/role-hub";
import { useAuthStore } from "@/src/store/auth.store";

export default function WaiterPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <RoleHub
      eyebrow="Estación salón"
      title="Mesero"
      subtitle={`${user?.fullName ?? "Mesero"} — abre mesas, arma la orden y mándala a cocina.`}
      onLogout={() => {
        logout();
        router.push("/restaurant/roles");
      }}
      links={[
        {
          href: "/restaurant/waiter/tables",
          title: "Mesas",
          description: "Abrir o continuar orden por mesa",
        },
        {
          href: "/restaurant/waiter/orders",
          title: "Órdenes activas",
          description: "Seguimiento de pedidos del salón",
        },
      ]}
    />
  );
}
