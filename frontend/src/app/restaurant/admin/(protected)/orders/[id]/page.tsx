"use client";

import { useParams } from "next/navigation";

import { OrderDetailView } from "@/src/components/orders/order-detail-view";

/** Thin wrapper: admin can view any order and force-close/cancel it. */
export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <OrderDetailView
      orderId={params.id}
      role="admin"
      backHref="/restaurant/admin/orders"
    />
  );
}
