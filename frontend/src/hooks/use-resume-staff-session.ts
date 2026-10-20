"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthHydrated } from "@/src/hooks/use-store-hydration";
import { homeForRole } from "@/src/services/user-auth.service";
import { useAuthStore } from "@/src/store/auth.store";

/**
 * Reuse an existing staff JWT instead of showing another login.
 * Admin of the local is already a staff ADMIN — no second "role" screen.
 */
export function useResumeStaffSession(options?: {
  unauthenticatedHref?: string;
}) {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const unauthenticatedHref = options?.unauthenticatedHref;

  useEffect(() => {
    if (!hydrated) return;
    if (isAuthenticated && user) {
      router.replace(homeForRole(user.role));
      return;
    }
    if (unauthenticatedHref) {
      router.replace(unauthenticatedHref);
    }
  }, [hydrated, isAuthenticated, user, router, unauthenticatedHref]);

  return { hydrated, isAuthenticated, user };
}
