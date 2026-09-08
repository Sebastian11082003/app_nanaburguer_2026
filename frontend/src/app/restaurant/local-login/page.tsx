"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AuthShell } from "@/src/components/brand/auth-shell";
import { BrandMark } from "@/src/components/brand/brand-mark";
import { getErrorMessage } from "@/src/lib/get-error-message";
import {
  RestaurantBranding,
  restaurantAuthService,
} from "@/src/services/restaurant-auth.service";
import { useRestaurantStore } from "@/src/store/restaurant.store";

const BRANDING_LOOKUP_DEBOUNCE_MS = 400;

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
  const [branding, setBranding] = useState<RestaurantBranding | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    clearTimeout(debounceRef.current);

    if (!form.slug.trim()) {
      setBranding(null);
      return;
    }

    debounceRef.current = setTimeout(() => {
      restaurantAuthService
        .getBranding(form.slug)
        .then(setBranding)
        .catch(() => setBranding(null));
    }, BRANDING_LOOKUP_DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [form.slug]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      const response = await restaurantAuthService.login(form);
      setRestaurantAuth(response.accessToken, response.restaurant);
      router.push("/restaurant/home");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Error al iniciar sesión"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Acceso del local"
      title={branding?.name ?? "Restaurante"}
      description="Credenciales del restaurante (slug), no las de un mesero o cajero."
      footerHref="/restaurant/login"
      footerLabel="Soy personal del local"
      brand={
        branding ? (
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
        />
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
