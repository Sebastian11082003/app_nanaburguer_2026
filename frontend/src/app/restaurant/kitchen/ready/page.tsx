"use client";

import Link from "next/link";

import { KitchenBoard } from "@/src/components/kitchen/kitchen-board";

export default function KitchenReadyPage() {
  return (
    <div>
      <div className="px-8 pt-6">
        <Link href="/restaurant/kitchen" className="text-zinc-400 hover:text-white">
          ← Cocina
        </Link>
      </div>
      <KitchenBoard
        title="Listas"
        description="Órdenes listas para servir / cobrar"
        status="READY"
      />
    </div>
  );
}
