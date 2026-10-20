"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { formatCents } from "@/src/lib/money";
import { menuService } from "@/src/services/menu.service";
import { Category, MenuItem } from "@/src/types/menu";

export default function MenuItemsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    categoryId: "",
    name: "",
    description: "",
    price: "",
  });

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [cats, menuItems] = await Promise.all([
        menuService.getCategories(),
        menuService.getItems(),
      ]);
      setCategories(cats);
      setItems(menuItems);
      setForm((prev) => ({
        ...prev,
        categoryId: prev.categoryId || cats[0]?.id || "",
      }));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cargar el menú"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();

    const priceNumber = Number(form.price);
    if (!form.categoryId || !form.name.trim() || Number.isNaN(priceNumber)) {
      setError("Completa categoría, nombre y precio válido");
      return;
    }

    try {
      setBusy(true);
      setError("");
      setMessage("");
      await menuService.createItem({
        categoryId: form.categoryId,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        priceCents: Math.round(priceNumber * 100),
      });
      setForm((prev) => ({
        ...prev,
        name: "",
        description: "",
        price: "",
      }));
      setMessage("Producto creado");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo crear el producto"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Productos</h1>
        <p className="text-zinc-400">Administración de productos del menú.</p>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-emerald-400">{message}</p>}

      <form
        onSubmit={handleCreate}
        className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 md:grid-cols-2"
      >
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 md:col-span-2"
        >
          <option value="">Selecciona categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nombre del producto"
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
        />

        <input
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="Precio (ej: 15000)"
          type="number"
          min="0"
          step="100"
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
        />

        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Descripción (opcional)"
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 md:col-span-2"
        />

        <button
          type="submit"
          disabled={busy || categories.length === 0}
          className="rounded-xl bg-white px-5 py-3 font-bold text-black disabled:opacity-50 md:col-span-2"
        >
          {busy ? "Creando..." : "Crear producto"}
        </button>
      </form>

      {categories.length === 0 && !loading && (
        <p className="text-amber-400">
          Primero crea al menos una categoría en Menú → Categorías.
        </p>
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4"
            >
              <div>
                <p className="font-bold">{item.name}</p>
                <p className="text-sm text-zinc-500">
                  {categoryMap.get(item.categoryId) ?? "Sin categoría"}
                  {item.description ? ` · ${item.description}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatCents(item.priceCents)}</p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    try {
                      setBusy(true);
                      setError("");
                      setMessage("");
                      await menuService.updateItem(item.id, {
                        isAvailable: !item.isAvailable,
                      });
                      setMessage(
                        item.isAvailable
                          ? `${item.name} fuera de menú`
                          : `${item.name} disponible`,
                      );
                      await load();
                    } catch (err: unknown) {
                      setError(
                        getErrorMessage(err, "No se pudo actualizar"),
                      );
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className={`mt-1 text-sm ${
                    item.isAvailable ? "text-emerald-400" : "text-zinc-500"
                  }`}
                >
                  {item.isAvailable ? "Disponible" : "No disponible"}
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-zinc-400">Aún no hay productos</p>
          )}
        </div>
      )}
    </div>
  );
}
