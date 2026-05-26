"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

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

  async function loadRestaurants() {
    try {
      const data = await platformService.getRestaurants();

      console.log(data);

      setRestaurants(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRestaurants();
  }, []);

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Restaurantes</h1>

          <p className="mt-2 text-zinc-400">Gestión de tenants SaaS</p>
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
                      {restaurant.isActive ? "Activo" : "Inactivo"}
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
