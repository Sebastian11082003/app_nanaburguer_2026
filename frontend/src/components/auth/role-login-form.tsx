"use client";

import { useState } from "react";

interface RoleLoginFormProps {
  title: string;
  description: string;
  onSubmit: (email: string, password: string) => Promise<void>;
}

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
    } catch (error: any) {
      setError(error?.response?.data?.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8"
      >
        <h1 className="text-4xl font-black text-white">{title}</h1>

        <p className="mt-2 text-zinc-400">{description}</p>

        <div className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
          />
        </div>

        {error && <p className="mt-4 text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full rounded-xl bg-white py-3 font-bold text-black"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
