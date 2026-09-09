"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthShell } from "@/src/components/brand/auth-shell";
import { BrandMark } from "@/src/components/brand/brand-mark";
import { PLATFORM_BRAND } from "@/src/config/platform-brand";
import { useRestaurantBrandingLookup } from "@/src/hooks/use-restaurant-branding-lookup";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { restaurantAuthService } from "@/src/services/restaurant-auth.service";
import { useRestaurantStore } from "@/src/store/restaurant.store";

/** Tenant (restaurant) credentials — not staff. Staff uses /restaurant/login. */
export default function RestaurantLocalLoginPage() {
  const router = useRouter();
  const { setRestaurantAuth } = useRestaurantStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    slug: "",
    email: "",
    password: "",
  });
  const { branding, status } = useRestaurantBrandingLookup(form.slug);
  const identified = status === "found" && branding;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      const response = await restaurantAuthService.login({
        ...form,
        slug: form.slug.trim().toLowerCase(),
      });
      setRestaurantAuth(response.accessToken, response.restaurant);
      router.push("/restaurant/login");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Error al iniciar sesión"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Acceso del local"
      title={identified ? branding.name : PLATFORM_BRAND.name}
      description="Credenciales del restaurante (slug), no las de un mesero o cajero."
      footerHref="/restaurant/login"
      footerLabel="Soy personal del local"
      brand={
        identified ? (
          <BrandMark size={88} name={branding.name} logoUrl={branding.logoUrl} />
        ) : undefined
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="slug"
          placeholder="Slug del restaurante"
          value={form.slug}
          onChange={handleChange}
          className="field-input"
          required
          autoCapitalize="none"
        />
        {status === "missing" && (
          <p className="text-sm text-danger">
            No hay un restaurante activo con ese slug
          </p>
        )}
        <input
          type="email"
          name="email"
          placeholder="Correo del restaurante"
          value={form.email}
          onChange={handleChange}
          className="field-input"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña del restaurante"
          value={form.password}
          onChange={handleChange}
          className="field-input"
          required
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Ingresando..." : "Entrar al portal"}
        </button>
      </form>
    </AuthShell>
  );
}
