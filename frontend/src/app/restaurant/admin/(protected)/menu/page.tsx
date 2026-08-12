"use client";

import Link from "next/link";

export default function MenuAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">Menú</h1>
        <p className="text-zinc-400">
          Gestiona categorías y productos del restaurante
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/restaurant/admin/menu/categories"
          className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 transition hover:border-white"
        >
          <h2 className="text-2xl font-bold">Categorías</h2>
          <p className="mt-2 text-zinc-400">Crear y listar categorías</p>
        </Link>

        <Link
          href="/restaurant/admin/menu/items"
          className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 transition hover:border-white"
        >
          <h2 className="text-2xl font-bold">Productos</h2>
          <p className="mt-2 text-zinc-400">Crear y listar productos del menú</p>
        </Link>
      </div>
    </div>
  );
}
