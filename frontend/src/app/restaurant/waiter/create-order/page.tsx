"use client";

import { Suspense } from "react";

import { CreateOrderScreen } from "@/src/components/orders/create-order-screen";

export default function WaiterCreateOrderPage() {
  return (
    <Suspense fallback={<main className="p-8">Cargando...</main>}>
      <CreateOrderScreen
        role="waiter"
        tablesHref="/restaurant/waiter/tables"
        createOrderPath="/restaurant/waiter/create-order"
      />
    </Suspense>
  );
}
