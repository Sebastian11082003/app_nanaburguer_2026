"use client";

import { Suspense } from "react";

import { CreateOrderScreen } from "@/src/components/orders/create-order-screen";
import { useAuthStore } from "@/src/store/auth.store";

export default function WaiterCreateOrderPage() {
  const role = useAuthStore((s) => s.user?.role);
  const screenRole =
    role === "ADMIN" ? "admin" : role === "CASHIER" ? "cashier" : "waiter";

  return (
    <Suspense fallback={<main className="p-8">Cargando...</main>}>
      <CreateOrderScreen
        role={screenRole}
        tablesHref="/restaurant/app"
        createOrderPath="/restaurant/waiter/create-order"
      />
    </Suspense>
  );
}
