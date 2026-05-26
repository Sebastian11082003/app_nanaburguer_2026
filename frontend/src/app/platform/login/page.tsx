"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

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

      const response = await platformAuthService.login({
        email,
        password,
      });
      console.log(response);

      setAuth(response.accessToken, response.admin);

      router.push("/platform/dashboard");
    } catch (error: any) {
      setError(error?.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8"
      >
        <h1 className="mb-2 text-3xl font-bold text-white">Platform Login</h1>

        <p className="mb-6 text-zinc-400">Acceso administrativo SaaS</p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white py-3 font-bold text-black transition-all hover:opacity-90"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </div>
      </form>
    </main>
  );
}
