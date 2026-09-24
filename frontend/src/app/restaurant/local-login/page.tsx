import { redirect } from "next/navigation";

/**
 * Used to be a restaurant-entity login that then sent the operator to
 * `/restaurant/login` to pick a role. That second gate is gone: restaurant
 * email + password already open an ADMIN staff session on the staff screen.
 */
export default function RestaurantLocalLoginPage() {
  redirect("/restaurant/login");
}
