"use client";

import { useState } from "react";

import { AuthShell } from "@/src/components/brand/auth-shell";
import { BrandMark } from "@/src/components/brand/brand-mark";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { useRestaurantStore } from "@/src/store/restaurant.store";

interface RoleLoginFormProps {
  title: string;
  description: string;
  onSubmit: (email: string, password: string) => Promise<void>;
}

/**
 * Shared shell for every role login (admin/waiter/cashier/kitchen/
 * delivery). These screens are reached AFTER `/restaurant/login`, so the
 * tenant is already known — show that tenant's own logo/name instead of
 * the generic platform mark.
 */
export function RoleLoginForm({
  title,
  description,
  onSubmit,
}: RoleLoginFormProps) {
  const restaurant = useRestaurantStore((state) => state.restaurant);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      await onSubmit(email, password);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Error al iniciar sesión"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={title}
      description={description}
      footerHref="/restaurant/roles"
      footerLabel="Volver a roles"
      brand={
        <BrandMark
          size={88}
          name={restaurant?.name ?? "Restaurante"}
          logoUrl={restaurant?.logoUrl}
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-input"
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field-input"
          required
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </AuthShell>
  );
}
