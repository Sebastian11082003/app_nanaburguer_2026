"use client";

import { useParams } from "next/navigation";

import { OrderDetailView } from "@/src/components/orders/order-detail-view";

/** Thin wrapper: waiter's read-only view of an order, with a shortcut back into its table. */
export default function WaiterOrderDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <OrderDetailView
      orderId={params.id}
      role="waiter"
      backHref="/restaurant/waiter/orders"
    />
  );
}
