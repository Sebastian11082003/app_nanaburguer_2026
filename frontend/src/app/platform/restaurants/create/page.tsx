"use client";

import { useState } from "react";
import Link from "next/link";

import { platformService } from "@/src/services/platform.service";
import { PlatformRestaurant } from "@/src/types/platform";

export default function CreateRestaurantPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<PlatformRestaurant | null>(null);

  const [form, setForm] = useState({
    // Restaurante
    name: "",
    slug: "",
    nit: "",
    email: "",
    phone: "",
    address: "",

    // Login Restaurante
    restaurantEmail: "",
    restaurantPassword: "",

    // Admin Principal
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const restaurant = await platformService.createRestaurant(form);
      setCreated(restaurant);
    } catch (error: any) {
      console.error(error);

      setError(error?.response?.data?.message ?? "Error al crear restaurante");
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    const stationLogins =
      created.stationLogins ??
      created.users
        ?.filter((user) => user.role !== "ADMIN")
        .map((user) => ({ role: user.role, email: user.email })) ??
      [];

    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-5xl font-black">Restaurante creado</h1>
          <p className="text-zinc-400">
            {created.name} · slug {created.slug}. Las cinco estaciones ya
            tienen usuario. La clave de cajero/mesero/cocina/domicilio es la
            misma que la del administrador.
          </p>
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-2xl font-bold">Logins de estación</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                Admin · {form.adminEmail}
              </li>
              {stationLogins.map((login) => (
                <li key={login.email}>
                  {login.role} · {login.email}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-zinc-400">
              Portal: /restaurant/roles — cada rol entra con slug + su correo.
            </p>
          </div>
          <Link
            href="/platform/restaurants"
            className="inline-block rounded-2xl bg-white px-8 py-4 font-bold text-black"
          >
            Ver restaurantes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-black">Crear Restaurante</h1>

        <p className="mt-2 text-zinc-400">
          Registrar nuevo tenant SaaS. Además del admin se crean cajero,
          mesero, cocina y domicilio (`rol@slug.test`) con la misma clave
          del admin.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          {/* ========================= */}
          {/* RESTAURANTE */}
          {/* ========================= */}
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="mb-6 text-2xl font-bold">Información Restaurante</h2>

            <div className="grid gap-4">
              <input
                name="name"
                placeholder="Nombre restaurante"
                value={form.name}
                onChange={handleChange}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
                required
              />

              <input
                name="slug"
                placeholder="Slug"
                value={form.slug}
                onChange={handleChange}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
                required
              />

              <input
                name="nit"
                placeholder="NIT"
                value={form.nit}
                onChange={handleChange}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
                required
              />

              <input
                name="email"
                type="email"
                placeholder="Correo corporativo"
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
          </section>

          {/* ========================= */}
          {/* LOGIN RESTAURANTE */}
          {/* ========================= */}
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="mb-2 text-2xl font-bold">Login Restaurante</h2>

            <p className="mb-6 text-sm text-zinc-400">
              Credenciales utilizadas para ingresar al portal principal del
              restaurante.
            </p>

            <div className="grid gap-4">
              <input
                type="email"
                name="restaurantEmail"
                placeholder="Correo login restaurante"
                value={form.restaurantEmail}
                onChange={handleChange}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
                required
              />

              <input
                type="password"
                name="restaurantPassword"
                placeholder="Contraseña login restaurante"
                value={form.restaurantPassword}
                onChange={handleChange}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
                required
              />
            </div>
          </section>

          {/* ========================= */}
          {/* ADMIN PRINCIPAL */}
          {/* ========================= */}
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="mb-2 text-2xl font-bold">Administrador Principal</h2>

            <p className="mb-6 text-sm text-zinc-400">
              Usuario que administrará el restaurante y podrá crear cajeros,
              meseros, cocina y domiciliarios.
            </p>

            <div className="grid gap-4">
              <input
                name="adminName"
                placeholder="Nombre administrador"
                value={form.adminName}
                onChange={handleChange}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
                required
              />

              <input
                type="email"
                name="adminEmail"
                placeholder="Correo administrador"
                value={form.adminEmail}
                onChange={handleChange}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
                required
              />

              <input
                type="password"
                name="adminPassword"
                placeholder="Contraseña administrador"
                value={form.adminPassword}
                onChange={handleChange}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
                required
              />
            </div>
          </section>

          {error && (
            <div className="rounded-xl border border-red-800 bg-red-950 p-4 text-red-400">
              {error}
            </div>
          )}

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
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading ? "Creando restaurante..." : "Crear restaurante"}
          </button>
        </form>
      </div>
    </main>
  );
}
