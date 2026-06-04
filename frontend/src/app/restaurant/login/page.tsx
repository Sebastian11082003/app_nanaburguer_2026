"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRestaurantStore } from "@/src/store/restaurant.store";

import { restaurantAuthService } from "@/src/services/restaurant-auth.service";

export default function RestaurantLoginPage() {
  const router = useRouter();
  const { setRestaurantAuth } = useRestaurantStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    slug: "",
    email: "",
    password: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await restaurantAuthService.login(form);

      localStorage.setItem("restaurant_token", response.accessToken);

      setRestaurantAuth(response.accessToken, response.restaurant);
      router.push("/restaurant/home");
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
        <h1 className="text-4xl font-black text-white">Login Restaurante</h1>

        <p className="mt-2 text-zinc-400">Acceso principal del restaurante</p>

        <div className="mt-8 space-y-4">
          <input
            name="slug"
            placeholder="Slug restaurante"
            value={form.slug}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
          />

          <input
            type="email"
            name="email"
            placeholder="Correo restaurante"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña restaurante"
            value={form.password}
            onChange={handleChange}
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
