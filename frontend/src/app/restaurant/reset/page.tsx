"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { AuthShell } from "@/src/components/brand/auth-shell";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { userAuthService } from "@/src/services/user-auth.service";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Falta el token del enlace");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await userAuthService.resetPassword(token, password);
      router.push("/restaurant/login");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "El enlace no es válido o ya venció"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Nueva contraseña"
      description="Elige una contraseña de al menos 6 caracteres."
      footerHref="/restaurant/login"
      footerLabel="Volver al inicio de sesión"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          name="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field-input"
          required
          minLength={6}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="button"
          disabled={loading}
          className="btn-primary w-full"
          onClick={(e) => {
            const form = e.currentTarget.form;
            if (form) form.requestSubmit();
          }}
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="p-8 text-muted">Cargando...</main>}>
      <ResetForm />
    </Suspense>
  );
}
