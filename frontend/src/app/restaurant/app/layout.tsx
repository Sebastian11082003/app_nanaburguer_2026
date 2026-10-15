"use client";

import { StaffPosLayout } from "@/src/components/pos/staff-pos-layout";

export default function PosAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffPosLayout station="floor">{children}</StaffPosLayout>;
}
