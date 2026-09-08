"use client";

import { useState } from "react";

import { RestaurantAuthShell } from "@/src/components/brand/restaurant-auth-shell";
import { getErrorMessage } from "@/src/lib/get-error-message";

interface RoleLoginFormProps {
  title: string;
  description: string;
  onSubmit: (email: string, password: string) => Promise<void>;
}

/**
 * Legacy per-role login. Role routes redirect to staff login; this
 * still inherits tenant chrome if a leftover screen is opened.
 */
export function RoleLoginForm({
  title,
  description,
  onSubmit,
}: RoleLoginFormProps) {
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
    <RestaurantAuthShell
      title={title}
      description={description}
      footerHref="/restaurant/login"
      footerLabel="Volver al inicio de sesión"
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
    </RestaurantAuthShell>
  );
}
