"use client";

import Link from "next/link";
import { useState } from "react";

import { RestaurantAuthShell } from "@/src/components/brand/restaurant-auth-shell";
import { useHydratedRestaurant } from "@/src/hooks/use-hydrated-restaurant";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { userAuthService } from "@/src/services/user-auth.service";

export default function RecoverPasswordPage() {
  const { restaurant } = useHydratedRestaurant();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [resetUrl, setResetUrl] = useState("");

  async function sendReset(form: HTMLFormElement) {
    const data = new FormData(form);
    const nextEmail = String(data.get("email") ?? "").trim();
    try {
      setLoading(true);
      setError("");
      const result = await userAuthService.forgotPassword(nextEmail);
      setDone(true);
      setResetUrl(result.resetUrl ?? "");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo enviar el enlace"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <RestaurantAuthShell
      title="Recuperar acceso"
      description={
        restaurant
          ? `Te enviaremos un enlace para ${restaurant.name} (${restaurant.slug}). Vale 6 horas.`
          : "Ingresa tu correo y te enviaremos un enlace. El enlace vale 6 horas."
      }
      footerHref="/restaurant/login"
      footerLabel="Volver al inicio de sesión"
    >
      {done ? (
        <div className="space-y-3 text-sm text-muted">
          <p>Si el correo existe, el enlace de recuperación ya está listo.</p>
          {resetUrl && (
            <p>
              Entorno local:{" "}
              <Link href={resetUrl} className="text-flame underline">
                abrir enlace de restablecer
              </Link>
            </p>
          )}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendReset(e.currentTarget);
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
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="button"
            disabled={loading}
            className="btn-primary w-full"
            onClick={(e) => {
              const form = e.currentTarget.form;
              if (!form || !form.reportValidity()) return;
              void sendReset(form);
            }}
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </form>
      )}
    </RestaurantAuthShell>
  );
}
