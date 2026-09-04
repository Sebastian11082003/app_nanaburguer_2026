"use client";

import { ReactNode } from "react";

import { StationGate } from "@/src/components/auth/station-gate";

export default function WaiterLayout({ children }: { children: ReactNode }) {
  return <StationGate role="WAITER">{children}</StationGate>;
}
