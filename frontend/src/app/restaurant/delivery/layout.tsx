"use client";

import { ReactNode } from "react";

import { StationGate } from "@/src/components/auth/station-gate";

export default function DeliveryLayout({ children }: { children: ReactNode }) {
  return <StationGate role="DELIVERY">{children}</StationGate>;
}
