"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { BrandMark } from "@/src/components/brand/brand-mark";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { restaurantService } from "@/src/services/restaurant.service";
import { useRestaurantStore } from "@/src/store/restaurant.store";

const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Self-service branding/settings for the current tenant. This is THE
 * place any restaurant on this platform sets its own logo/name/contact
 * info — deliberately generic (no hardcoded restaurant), since the same
 * screen is used by every tenant the SaaS is sold to.
 *
 * On save, also pushes the fresh values into `useRestaurantStore` so the
 * new logo/name shows immediately everywhere (admin sidebar, home,
 * roles, role logins) without requiring the user to log out and back in.
 */
export default function RestaurantSettingsPage() {
  const restaurant = useRestaurantStore((state) => state.restaurant);
  const setRestaurantAuth = useRestaurantStore(
    (state) => state.setRestaurantAuth,
  );
  const accessToken = useRestaurantStore((state) => state.accessToken);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    phone: "",
    address: "",
    primaryColor: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Pushes the given logo/name into the persisted tenant session so it shows up everywhere immediately. */
  const syncBrandToStore = useCallback(
    (name: string, logoUrl: string | null) => {
      if (accessToken && restaurant) {
        setRestaurantAuth(accessToken, {
          id: restaurant.id,
          slug: restaurant.slug,
          name,
          logoUrl,
        });
      }
    },
    [accessToken, restaurant, setRestaurantAuth],
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await restaurantService.getMe();
      setForm({
        name: data.name ?? "",
        logoUrl: data.logoUrl ?? "",
        phone: data.phone ?? "",
        address: data.address ?? "",
        primaryColor: data.primaryColor ?? "",
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cargar la configuración"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setBusy(true);
      setError("");
      setMessage("");

      const updated = await restaurantService.updateSettings({
        name: form.name.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        primaryColor: form.primaryColor.trim() || undefined,
      });

      // Keep the persisted tenant session in sync so the new branding
      // shows up immediately across the app, not just after a re-login.
      syncBrandToStore(updated.name, updated.logoUrl ?? null);

      setMessage("Configuración guardada");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo guardar la configuración"));
    } finally {
      setBusy(false);
    }
  }

  /**
   * Uploads the picked file immediately (no separate "save" step for the
   * logo) — it's the pattern users expect from a "profile picture"
   * control, and it avoids sending a stale `logoUrl` if `handleSubmit`
   * runs before the previous upload finished.
   */
  async function handleLogoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file) return;

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      setError("La imagen es demasiado grande (máximo 5MB).");
      return;
    }

    try {
      setUploadingLogo(true);
      setError("");
      setMessage("");

      const updated = await restaurantService.uploadLogo(file);
      setForm((prev) => ({ ...prev, logoUrl: updated.logoUrl ?? "" }));
      syncBrandToStore(updated.name, updated.logoUrl ?? null);

      setMessage("Logo actualizado");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo subir el logo"));
    } finally {
      setUploadingLogo(false);
    }
  }

  if (loading) {
    return <p>Cargando configuración...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-4xl font-black">Restaurante</h1>
        <p className="text-zinc-400">
          Configura el nombre, logo y datos de contacto de tu restaurante.
        </p>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-emerald-400">{message}</p>}

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:flex-row">
        <BrandMark
          size={72}
          name={form.name || "Restaurante"}
          logoUrl={form.logoUrl}
        />
        <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
          <p className="text-sm text-zinc-500">
            Como si fuera la foto de perfil de tu restaurante: aparece en el
            inicio de sesión de tu equipo, el panel y tus facturas.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingLogo}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-900 disabled:opacity-50"
            >
              {uploadingLogo ? "Subiendo..." : "Cambiar logo"}
            </button>
            <span className="text-xs text-zinc-500">
              JPG, PNG, WEBP o GIF · máx. 5MB
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleLogoPick}
            className="hidden"
          />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
      >
        <div>
          <label className="mb-1 block text-sm text-zinc-400">
            Nombre del restaurante
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-zinc-400">
              Teléfono
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-400">
              Color principal
            </label>
            <input
              value={form.primaryColor}
              onChange={(e) =>
                setForm({ ...form, primaryColor: e.target.value })
              }
              placeholder="#e8a317"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-zinc-400">
            Dirección
          </label>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-white px-5 py-3 font-bold text-black disabled:opacity-50"
        >
          {busy ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
