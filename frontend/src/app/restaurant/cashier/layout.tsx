"use client";

import { ReactNode } from "react";

import { StationGate } from "@/src/components/auth/station-gate";

export default function CashierLayout({ children }: { children: ReactNode }) {
  return <StationGate role="CASHIER">{children}</StationGate>;
}
