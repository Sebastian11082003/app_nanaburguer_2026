"use client";

import Link from "next/link";

import { KitchenBoard } from "@/src/components/kitchen/kitchen-board";

export default function KitchenPreparingPage() {
  return (
    <div>
      <div className="px-4 pt-4 sm:px-8 sm:pt-6">
        <Link
          href="/restaurant/kitchen"
          className="inline-flex min-h-11 items-center text-zinc-400 hover:text-white"
        >
          ← Cocina
        </Link>
      </div>
      <KitchenBoard
        title="En preparación"
        description="Marca como listas cuando terminen"
        status="IN_PREPARATION"
        nextStatus="READY"
        nextLabel="Marcar lista"
      />
    </div>
  );
}
