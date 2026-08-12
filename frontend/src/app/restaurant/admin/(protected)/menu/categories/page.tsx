"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { menuService } from "@/src/services/menu.service";
import { Category } from "@/src/types/menu";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setCategories(await menuService.getCategories());
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar las categorías"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setBusy(true);
      setError("");
      setMessage("");
      await menuService.createCategory({ name: name.trim() });
      setName("");
      setMessage("Categoría creada");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo crear la categoría"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Categorías</h1>
        <p className="text-zinc-400">Administración de categorías del menú.</p>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-emerald-400">{message}</p>}

      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 md:flex-row"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de categoría"
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
        />
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="rounded-xl bg-white px-5 py-3 font-bold text-black disabled:opacity-50"
        >
          {busy ? "Creando..." : "Crear"}
        </button>
      </form>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4"
            >
              <div>
                <p className="font-bold">{category.name}</p>
                <p className="text-sm text-zinc-500">
                  {category.isActive ? "Activa" : "Inactiva"}
                </p>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-zinc-400">Aún no hay categorías</p>
          )}
        </div>
      )}
    </div>
  );
}
