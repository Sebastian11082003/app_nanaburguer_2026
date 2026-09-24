"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthShell } from "@/src/components/brand/auth-shell";
import { BrandMark } from "@/src/components/brand/brand-mark";
import { PLATFORM_BRAND } from "@/src/config/platform-brand";
import { useHydratedRestaurant } from "@/src/hooks/use-hydrated-restaurant";
import { useRestaurantBrandingLookup } from "@/src/hooks/use-restaurant-branding-lookup";
import { useResumeStaffSession } from "@/src/hooks/use-resume-staff-session";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { changeLocal as clearLocal } from "@/src/lib/staff-session";
import { homeForRole, userAuthService } from "@/src/services/user-auth.service";
import { useAuthStore } from "@/src/store/auth.store";
import { useRestaurantStore } from "@/src/store/restaurant.store";

export default function StaffLoginPage() {
  const router = useRouter();
  const { hydrated, isAuthenticated } = useResumeStaffSession();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setTenantPreview = useRestaurantStore((s) => s.setTenantPreview);
  const { restaurant: persisted, ready } = useHydratedRestaurant();
  const [slug, setSlug] = useState("");
  const { branding, status } = useRestaurantBrandingLookup(slug);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && persisted?.slug && !slug) {
      setSlug(persisted.slug);
    }
  }, [ready, persisted?.slug, slug]);

  const identified = status === "found" && branding;
  const localLocked = Boolean(persisted?.slug) && slug === persisted?.slug;

  async function loginWith(form: HTMLFormElement) {
    const data = new FormData(form);
    const nextEmail = String(data.get("email") ?? "").trim();
    const nextPassword = String(data.get("password") ?? "");
    const nextSlug = String(data.get("slug") ?? slug).trim();
    try {
      setLoading(true);
      setError("");
      const response = await userAuthService.staffLogin({
        email: nextEmail,
        password: nextPassword,
        slug: nextSlug,
      });
      setAuth(response.accessToken, response.user);
      setTenantPreview(response.restaurant);
      void remember;
      router.push(homeForRole(response.user.role));
    } catch (err: unknown) {
      const raw = getErrorMessage(err, "Correo o contraseña incorrectos");
      setError(
        raw === "Invalid credentials"
          ? "Correo o contraseña incorrectos"
          : raw === "Restaurant not found"
            ? "No se encontró el restaurante de ese correo"
            : raw === "Restaurant disabled"
              ? "Este local está inhabilitado. Contacta a la plataforma."
            : raw === "Staff does not belong to this restaurant"
              ? "Ese correo no pertenece a este local. Cambia de local o revisa el slug."
            : raw,
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChangeLocal() {
    clearLocal();
    setSlug("");
    setEmail("");
    setPassword("");
    setError("");
  }

  if (!ready || !hydrated || isAuthenticated) {
    return <main className="p-8 text-muted">Cargando...</main>;
  }

  return (
    <AuthShell
      eyebrow={identified ? "Personal del local" : "Personal"}
      title={identified ? branding.name : PLATFORM_BRAND.name}
      description={
        identified
          ? "Un solo acceso. El correo del restaurante entra como admin; mesero, caja y domicilio con el suyo. El rol abre el menú, no otra pantalla."
          : "Correo y contraseña. El del restaurante entra como admin. El slug es opcional y solo muestra el logo."
      }
      footerHref="/restaurant/local-login"
      footerLabel="Acceso del local (correo del restaurante)"
      footerAction={
        identified
          ? {
              label: `Cambiar local (${branding.slug})`,
              onClick: handleChangeLocal,
            }
          : undefined
      }
      brand={
        identified ? (
          <BrandMark
            size={88}
            name={branding.name}
            logoUrl={branding.logoUrl}
          />
        ) : undefined
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void loginWith(e.currentTarget);
        }}
        className="space-y-4"
      >
        <input
          name="slug"
          placeholder="Slug del restaurante (opcional)"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setError("");
          }}
          className="field-input"
          autoComplete="organization"
          autoCapitalize="none"
          readOnly={localLocked}
        />
        {status === "missing" && (
          <p className="text-sm text-danger">
            No hay un restaurante activo con ese slug
          </p>
        )}
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
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:transform-none disabled:hover:shadow-none"
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
