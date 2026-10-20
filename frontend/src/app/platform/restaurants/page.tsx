"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { getErrorMessage } from "@/src/lib/get-error-message";
import { platformService } from "@/src/services/platform.service";

import { PlatformRestaurant } from "@/src/types/platform";

import { Card, CardContent } from "@/src/components/ui/card";

import { Button } from "@/src/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

export default function PlatformRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<PlatformRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadRestaurants() {
    try {
      setError("");
      const data = await platformService.getRestaurants();
      setRestaurants(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar restaurantes"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRestaurants();
  }, []);

  async function toggleActive(row: PlatformRestaurant) {
    const next = !row.isActive;
    const ok = window.confirm(
      next
        ? `¿Activar ${row.name}? El personal podrá volver a entrar.`
        : `¿Inhabilitar ${row.name}? Nadie del local podrá entrar (falta de pago u otro motivo). Los datos no se borran.`,
    );
    if (!ok) return;

    try {
      setBusyId(row.id);
      setError("");
      const updated = await platformService.setRestaurantActive(row.id, next);
      setRestaurants((current) =>
        current.map((item) =>
          item.id === row.id ? { ...item, isActive: updated.isActive } : item,
        ),
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo cambiar el estado"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Restaurantes</h1>

          <p className="mt-2 text-zinc-400">
            Gestión de tenants SaaS. Inhabilitar corta el acceso del personal
            (mensualidad, mora, etc.) sin borrar el local.
          </p>
        </div>

        <Link
          href="/platform/restaurants/create"
          className="
         rounded-2xl
         bg-white
            px-6
             py-3
             font-bold
             text-black
                     "
        >
          <Button>Crear restaurante</Button>
        </Link>
      </div>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      <Card className="border-zinc-800 bg-zinc-950">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-zinc-400">Cargando restaurantes...</div>
          ) : restaurants.length === 0 ? (
            <div className="p-10 text-zinc-400">
              No existen restaurantes registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>

                  <TableHead>Slug</TableHead>

                  <TableHead>NIT</TableHead>

                  <TableHead>Teléfono</TableHead>

                  <TableHead>Estado</TableHead>
                  <TableHead>Estaciones</TableHead>
                  <TableHead>Acceso</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {restaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell>{restaurant.name}</TableCell>

                    <TableCell>{restaurant.slug}</TableCell>

                    <TableCell>{restaurant.nit}</TableCell>

                    <TableCell>{restaurant.phone || "-"}</TableCell>

                    <TableCell>
                      {restaurant.isActive ? "Activo" : "Inhabilitado"}
                    </TableCell>
                    <TableCell className="max-w-sm text-xs text-zinc-400">
                      {restaurant.users?.length
                        ? restaurant.users
                            .map((user) => `${user.role}: ${user.email}`)
                            .join(" · ")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        disabled={busyId === restaurant.id}
                        onClick={() => void toggleActive(restaurant)}
                        className="rounded-xl border border-zinc-600 px-3 py-2 text-xs font-bold hover:bg-zinc-800 disabled:opacity-50"
                      >
                        {busyId === restaurant.id
                          ? "Guardando..."
                          : restaurant.isActive
                            ? "Inhabilitar"
                            : "Activar"}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
