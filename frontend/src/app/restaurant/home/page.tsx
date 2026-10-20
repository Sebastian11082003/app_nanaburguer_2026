"use client";

import { useResumeStaffSession } from "@/src/hooks/use-resume-staff-session";

/**
 * Old portal after restaurant-entity login. One staff login is enough;
 * send an existing session to the POS, otherwise to that login.
 */
export default function RestaurantHomePage() {
  useResumeStaffSession({ unauthenticatedHref: "/restaurant/login" });

  return <main className="p-8 text-muted">Cargando...</main>;
}
