"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { authService } from "@/src/services/auth.service";

import { useAuthStore } from "@/src/store/auth.store";

export default function LoginPage() {
  const router = useRouter();

  const { setAuth } = useAuthStore();

  const [slug, setSlug] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      setError("");

      const response = await authService.login({
        slug,
        email,
        password,
      });

      setAuth(response.accessToken, response.user);

      switch (response.user.role) {
        case "ADMIN":
          router.push("/restaurant/admin");
          break;

        case "CASHIER":
          router.push("/restaurant/cashier");
          break;

        case "WAITER":
          router.push("/restaurant/waiter");
          break;

        case "DELIVERY":
          router.push("/restaurant/delivery");
          break;

        case "KITCHEN":
          router.push("/restaurant/kitchen");
          break;

        default:
          router.push("/restaurant");
      }
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
        <h1 className="mb-6 text-3xl font-bold text-white">Iniciar sesión</h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Slug restaurante"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="
    w-full
    rounded-xl
    border
    border-zinc-700
    bg-zinc-900
    px-4
    py-3
    text-white
    outline-none
  "
          />
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
