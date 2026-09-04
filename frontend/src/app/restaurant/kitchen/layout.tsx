"use client";

import { ReactNode } from "react";

import { StationGate } from "@/src/components/auth/station-gate";

export default function KitchenLayout({ children }: { children: ReactNode }) {
  return <StationGate role="KITCHEN">{children}</StationGate>;
}
