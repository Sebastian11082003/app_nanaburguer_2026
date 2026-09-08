"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthShell } from "@/src/components/brand/auth-shell";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { userAuthService } from "@/src/services/user-auth.service";

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [resetUrl, setResetUrl] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const result = await userAuthService.forgotPassword(email);
      setDone(true);
      setResetUrl(result.resetUrl ?? "");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo enviar el enlace"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Recuperar acceso"
      description="Ingresa tu correo y te enviaremos un enlace. El enlace vale 6 horas."
      footerHref="/restaurant/login"
      footerLabel="Volver al inicio de sesión"
    >
      {done ? (
        <div className="space-y-3 text-sm text-muted">
          <p>
            Si el correo existe, el enlace de recuperación ya está listo.
          </p>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
            required
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
