"use client";

import { useParams } from "next/navigation";

import { OrderDetailView } from "@/src/components/orders/order-detail-view";

/** Thin wrapper: cashier's view of a single order, with the close+charge shortcut. */
export default function CashierOrderDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <OrderDetailView
      orderId={params.id}
      role="cashier"
      backHref="/restaurant/cashier/orders"
    />
  );
}
