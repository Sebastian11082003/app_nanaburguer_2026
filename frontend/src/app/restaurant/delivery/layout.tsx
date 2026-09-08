"use client";

import { StaffPosLayout } from "@/src/components/pos/staff-pos-layout";

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffPosLayout station="delivery">{children}</StaffPosLayout>;
}
