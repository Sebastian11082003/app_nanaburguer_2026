"use client";

import { StaffPosLayout } from "@/src/components/pos/staff-pos-layout";

export default function WaiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffPosLayout station="waiter">{children}</StaffPosLayout>;
}
