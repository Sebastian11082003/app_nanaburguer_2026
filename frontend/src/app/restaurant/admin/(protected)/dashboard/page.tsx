import { redirect } from "next/navigation";

/** Old bookmark; the live dashboard lives at the admin root. */
export default function DashboardRedirectPage() {
  redirect("/restaurant/admin");
}
