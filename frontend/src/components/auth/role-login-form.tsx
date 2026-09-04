"use client";

import { useEffect, useState } from "react";

import { AuthShell } from "@/src/components/brand/auth-shell";
import { BrandMark } from "@/src/components/brand/brand-mark";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { stationEmail } from "@/src/lib/stations";
import {
  RestaurantBranding,
  restaurantAuthService,
} from "@/src/services/restaurant-auth.service";
import { useRestaurantStore } from "@/src/store/restaurant.store";

interface RoleLoginFormProps {
  title: string;
  description: string;
  /** Prefills `{prefix}@{slug}.test` once the slug is known. */
  emailPrefix?: string;
  onSubmit: (email: string, password: string, slug: string) => Promise<void>;
}

/**
 * Shared shell for every role login. Station tablets should not need a
 * prior restaurant-login: slug is typed here and emailed from the
 * default station account when the operator left the field empty.
 */
export function RoleLoginForm({
  title,
  description,
  emailPrefix,
  onSubmit,
}: RoleLoginFormProps) {
  const stored = useRestaurantStore((state) => state.restaurant);
  const setTenantPreview = useRestaurantStore((state) => state.setTenantPreview);
  const [slug, setSlug] = useState(stored?.slug ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [branding, setBranding] = useState<RestaurantBranding | null>(
    stored ? { name: stored.name, logoUrl: stored.logoUrl ?? null } : null,
  );

  useEffect(() => {
    if (stored?.slug && !slug) setSlug(stored.slug);
  }, [stored?.slug, slug]);

  useEffect(() => {
    const trimmed = slug.trim().toLowerCase();
    if (!trimmed || !emailPrefix) return;
    const hinted = stationEmail(emailPrefix, trimmed);
    setEmail((current) => {
      if (!current.trim()) return hinted;
      if (current.endsWith(".test") && current.startsWith(`${emailPrefix}@`)) {
        return hinted;
      }
      return current;
    });
  }, [slug, emailPrefix]);

  useEffect(() => {
    const trimmed = slug.trim();
    if (!trimmed) {
      setBranding(null);
      return;
    }
    const timer = setTimeout(() => {
      restaurantAuthService
        .getBranding(trimmed)
        .then((next) => {
          setBranding(next);
          if (next) {
            setTenantPreview({
              id: "",
              name: next.name,
              slug: trimmed.toLowerCase(),
              logoUrl: next.logoUrl,
            });
          }
        })
        .catch(() => setBranding(null));
    }, 400);
    return () => clearTimeout(timer);
  }, [slug, setTenantPreview]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextSlug = slug.trim().toLowerCase();
    if (!nextSlug) {
      setError("Indica el slug del restaurante");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onSubmit(email.trim(), password, nextSlug);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Error al iniciar sesión"));
    } finally {
      setLoading(false);
    }
  }

  const hintEmail =
    emailPrefix && slug.trim()
      ? stationEmail(emailPrefix, slug)
      : emailPrefix
        ? `${emailPrefix}@slug.test`
        : null;

  return (
    <AuthShell
      title={title}
      description={description}
      footerHref="/restaurant/roles"
      footerLabel="Volver a roles"
      brand={
        <BrandMark
          size={88}
          name={branding?.name ?? stored?.name ?? "Restaurante"}
          logoUrl={branding?.logoUrl ?? stored?.logoUrl}
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="slug"
          placeholder="Slug del restaurante"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="field-input"
          required
          autoComplete="organization"
        />

        <input
          type="email"
          placeholder={hintEmail ? `Correo (${hintEmail})` : "Correo"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-input"
          required
          autoComplete="username"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field-input"
          required
          autoComplete="current-password"
        />

        {hintEmail && (
          <p className="text-xs text-muted">
            Cuenta de estación por defecto: {hintEmail}
          </p>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </AuthShell>
  );
}
