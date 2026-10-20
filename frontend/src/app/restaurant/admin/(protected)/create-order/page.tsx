"use client";

import { Suspense } from "react";

import { CreateOrderScreen } from "@/src/components/orders/create-order-screen";

/**
 * Admin dine-in ordering — same flow as the waiter screen. Backend already
 * allows ADMIN on create/add/remove/transfer; this route keeps the admin
 * inside the admin shell (Loggro-style: admin can operate tables).
 */
export default function AdminCreateOrderPage() {
  return (
    <Suspense fallback={<main className="p-8">Cargando...</main>}>
      <CreateOrderScreen
        role="admin"
        tablesHref="/restaurant/admin/tables"
        createOrderPath="/restaurant/admin/create-order"
      />
    </Suspense>
  );
}
