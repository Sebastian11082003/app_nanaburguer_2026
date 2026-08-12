"use client";

import { useRouter } from "next/navigation";

import { RoleHub } from "@/src/components/ops/role-hub";
import { useAuthStore } from "@/src/store/auth.store";

export default function KitchenPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <RoleHub
      eyebrow="Estación cocina"
      title="Cocina"
      subtitle={`${user?.fullName ?? "Cocina"} — cola, preparación y platos listos.`}
      onLogout={() => {
        logout();
        router.push("/restaurant/roles");
      }}
      links={[
        {
          href: "/restaurant/kitchen/queue",
          title: "Cola",
          description: "Órdenes recién enviadas",
        },
        {
          href: "/restaurant/kitchen/preparing",
          title: "Preparando",
          description: "Tickets en cocina",
        },
        {
          href: "/restaurant/kitchen/ready",
          title: "Listas",
          description: "Listas para servir o cobrar",
        },
      ]}
    />
  );
}
