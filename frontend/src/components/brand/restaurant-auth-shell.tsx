"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { AuthShell } from "@/src/components/brand/auth-shell";
import { BrandMark } from "@/src/components/brand/brand-mark";
import { TenantSlug } from "@/src/components/brand/tenant-slug";
import { useHydratedRestaurant } from "@/src/hooks/use-hydrated-restaurant";
import { changeLocal as changeLocalSession } from "@/src/lib/staff-session";

interface RestaurantAuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  eyebrow?: string;
  footerHref?: string;
  footerLabel?: string;
  /** Footer becomes "Cambiar local (slug)" when the tenant is already known. */
  changeLocal?: boolean;
}

/**
 * Auth chrome for screens inside a resolved tenant. Platform login must
 * keep using `AuthShell` so it never reads restaurant persist.
 */
export function RestaurantAuthShell({
  title,
  description,
  children,
  eyebrow,
  footerHref = "/restaurant/login",
  footerLabel,
  changeLocal = false,
}: RestaurantAuthShellProps) {
  const router = useRouter();
  const { restaurant, ready } = useHydratedRestaurant();

  if (!ready) {
    return <main className="p-8 text-muted">Cargando...</main>;
  }

  const changeLocalLabel = restaurant
    ? `Cambiar local (${restaurant.slug})`
    : "Identificar el local (slug del restaurante)";

  return (
    <AuthShell
      eyebrow={eyebrow ?? (restaurant ? "Personal del local" : "Personal")}
      title={title}
      description={description}
      footerHref={footerHref}
      footerLabel={footerLabel}
      footerAction={
        changeLocal
          ? {
              label: changeLocalLabel,
              onClick: () => {
                changeLocalSession();
                router.push("/restaurant/login");
              },
            }
          : undefined
      }
      brand={
        restaurant ? (
          <BrandMark
            size={88}
            name={restaurant.name}
            logoUrl={restaurant.logoUrl}
          />
        ) : undefined
      }
    >
      {restaurant && (
        <div className="-mt-2 mb-6">
          <TenantSlug slug={restaurant.slug} />
        </div>
      )}
      {children}
    </AuthShell>
  );
}
