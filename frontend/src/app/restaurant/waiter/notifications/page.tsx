import { redirect } from "next/navigation";

/** No hay backend de notificaciones; el mesero opera desde mesas/órdenes. */
export default function WaiterNotificationsRedirectPage() {
  redirect("/restaurant/waiter");
}
