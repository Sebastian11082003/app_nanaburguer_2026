"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { platformService } from "@/src/services/platform.service";

export default function CreateRestaurantPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    nit: "",
    email: "",
    phone: "",
    address: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
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

      await platformService.createRestaurant(form);

      router.push("/platform/restaurants");
    } catch (error: any) {
      console.error(error);

      setError(error?.response?.data?.message || "Error al crear restaurante");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-5xl font-black">Crear restaurante</h1>

        <p className="mt-2 text-zinc-400">Registrar nuevo tenant SaaS</p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="mb-6 text-2xl font-bold">Información restaurante</h2>

            <div className="grid gap-4">
              <input
                name="name"
                placeholder="Nombre restaurante"
                value={form.name}
                onChange={handleChange}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
              />

              <input
                name="slug"
                placeholder="Slug"
                value={form.slug}
                onChange={handleChange}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
              />

              <input
                name="nit"
                placeholder="NIT"
                value={form.nit}
                onChange={handleChange}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
              />
              <input
                name="email"
                type="email"
                placeholder="Correo"
                value={form.email}
                onChange={handleChange}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
              />
              <input
                name="phone"
                placeholder="Teléfono"
                value={form.phone}
                onChange={handleChange}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
              />

              <input
                name="address"
                placeholder="Dirección"
                value={form.address}
                onChange={handleChange}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="mb-6 text-2xl font-bold">Administrador</h2>

            <div className="grid gap-4">
              <input
                name="adminName"
                placeholder="Nombre administrador"
                value={form.adminName}
                onChange={handleChange}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
              />

              <input
                name="adminEmail"
                placeholder="Correo administrador"
                value={form.adminEmail}
                onChange={handleChange}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
              />

              <input
                type="password"
                name="adminPassword"
                placeholder="Contraseña administrador"
                value={form.adminPassword}
                onChange={handleChange}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
              />
            </div>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="
              rounded-2xl
              bg-white
              px-8
              py-4
              font-bold
              text-black
              transition-all
              hover:scale-105
            "
          >
            {loading ? "Creando..." : "Crear restaurante"}
          </button>
        </form>
      </div>
    </main>
  );
}
