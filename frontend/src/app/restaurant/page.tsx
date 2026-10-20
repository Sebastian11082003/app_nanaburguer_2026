"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Always start at staff login. That screen is platform-branded until
 * the operator types a slug that matches a restaurant.
 */
export default function RestaurantIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/restaurant/login");
  }, [router]);

  return <main className="p-8 text-muted">Cargando...</main>;
}
