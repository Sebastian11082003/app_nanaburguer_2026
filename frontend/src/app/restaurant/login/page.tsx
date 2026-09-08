"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthShell } from "@/src/components/brand/auth-shell";
import { BrandMark } from "@/src/components/brand/brand-mark";
import { useHydratedRestaurant } from "@/src/hooks/use-hydrated-restaurant";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { homeForRole, userAuthService } from "@/src/services/user-auth.service";
import { useAuthStore } from "@/src/store/auth.store";
import { useRestaurantStore } from "@/src/store/restaurant.store";

export default function StaffLoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setTenantPreview = useRestaurantStore((s) => s.setTenantPreview);
  const { restaurant, ready } = useHydratedRestaurant();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loginWith(form: HTMLFormElement) {
    const data = new FormData(form);
    const nextEmail = String(data.get("email") ?? "").trim();
    const nextPassword = String(data.get("password") ?? "");
    try {
      setLoading(true);
      setError("");
      const response = await userAuthService.staffLogin({
        email: nextEmail,
        password: nextPassword,
      });
      setAuth(response.accessToken, response.user);
      setTenantPreview(response.restaurant);
      void remember;
      router.push(homeForRole(response.user.role));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Correo o contraseña incorrectos"));
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return <main className="p-8 text-muted">Cargando...</main>;
  }

  return (
    <AuthShell
      eyebrow={restaurant ? "Personal del local" : "Personal"}
      title={restaurant?.name ?? "Bienvenido"}
      description={
        restaurant
          ? "El mismo acceso para mesero, caja y domicilio. El rol decide el menú."
          : "El mismo acceso para mesero, caja y domicilio. Lo que cambia después es el menú, no el login."
      }
      footerHref="/restaurant/local-login"
      footerLabel={
        restaurant
          ? `Cambiar local (${restaurant.slug})`
          : "Identificar el local (slug del restaurante)"
      }
      brand={
        restaurant ? (
          <BrandMark
            size={88}
            name={restaurant.name}
            logoUrl={restaurant.logoUrl}
          />
        ) : undefined
      }
    >
      {restaurant && (
        <p className="-mt-2 mb-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm">
          <span className="text-muted">Slug del restaurante </span>
          <span className="font-mono font-semibold text-flame">
            {restaurant.slug}
          </span>
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void loginWith(e.currentTarget);
        }}
        className="space-y-4"
      >
        <input
          type="email"
          name="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-input"
          required
          autoComplete="username"
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field-input"
          required
          autoComplete="current-password"
        />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Recordar sesión
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="button"
          disabled={loading}
          className="btn-primary w-full"
          onClick={(e) => {
            const form = e.currentTarget.form;
            if (!form || !form.reportValidity()) return;
            void loginWith(form);
          }}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
        <p className="text-center text-sm">
          <Link href="/restaurant/recover" className="text-flame underline">
            Olvidé mi contraseña
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
