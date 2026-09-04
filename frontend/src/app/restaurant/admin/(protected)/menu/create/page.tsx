import { redirect } from "next/navigation";

/** El alta de producto vive en la lista de ítems. */
export default function MenuCreateRedirectPage() {
  redirect("/restaurant/admin/menu/items");
}
