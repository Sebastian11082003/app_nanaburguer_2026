import { redirect } from "next/navigation";

/** Same staff login for every station — role is applied after JWT. */
export default function RoleLoginRedirectPage() {
  redirect("/restaurant/login");
}
