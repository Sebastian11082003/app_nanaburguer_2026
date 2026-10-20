import { useAuthStore } from "@/src/store/auth.store";
import { useRestaurantStore } from "@/src/store/restaurant.store";

/** Cerrar sesión de personal: el local queda identificado. */
export function logoutStaffKeepLocal() {
  useAuthStore.getState().logout();
}

/** Cambiar local: suelta personal y el tenant persistido. */
export function changeLocal() {
  useAuthStore.getState().logout();
  useRestaurantStore.getState().logout();
}
