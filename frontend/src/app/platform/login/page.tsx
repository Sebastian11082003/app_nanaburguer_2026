"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthShell } from "@/src/components/brand/auth-shell";
import { getErrorMessage } from "@/src/lib/get-error-message";
import { platformAuthService } from "@/src/services/platform-auth.service";
import { usePlatformAuthStore } from "@/src/store/platform-auth.store";

export default function PlatformLoginPage() {
  const router = useRouter();
  const { setAuth } = usePlatformAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      const response = await platformAuthService.login({ email, password });
      setAuth(response.accessToken, response.admin);
      router.push("/platform/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Error al iniciar sesión"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="SaaS Platform"
      title="Panel SaaS"
      description="Administra restaurantes, altas y todo el ecosistema de la plataforma."
      footerHref="/"
      footerLabel="Volver al inicio"
    >
      <form onSubmit={handleLogin} className="space-y-4">
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
