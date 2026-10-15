"use client";

import { StaffPosLayout } from "@/src/components/pos/staff-pos-layout";

export default function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffPosLayout station="cashier">{children}</StaffPosLayout>;
}
