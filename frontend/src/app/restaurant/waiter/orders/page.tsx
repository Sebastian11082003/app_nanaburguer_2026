import { redirect } from "next/navigation";

/** El mesero opera desde el piso; esta lista era un callejón sin nav. */
export default function WaiterOrdersRedirectPage() {
  redirect("/restaurant/app");
}
