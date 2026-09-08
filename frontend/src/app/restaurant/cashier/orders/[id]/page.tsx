"use client";

import { useParams } from "next/navigation";

import { OrderDetailView } from "@/src/components/orders/order-detail-view";
import { useAuthStore } from "@/src/store/auth.store";

/** Thin wrapper: caja/admin see the same ticket; admin keeps void powers. */
export default function CashierOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const role = useAuthStore((s) => s.user?.role);
  const screenRole = role === "ADMIN" ? "admin" : "cashier";

  return (
    <OrderDetailView
      orderId={params.id}
      role={screenRole}
      backHref="/restaurant/cashier/orders"
    />
  );
}
