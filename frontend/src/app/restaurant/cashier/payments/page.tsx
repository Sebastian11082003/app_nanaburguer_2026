import { redirect } from "next/navigation";

/** Cobrar is mesa or Ventas; this list had no nav entry. */
export default function CashierPaymentsRedirectPage() {
  redirect("/restaurant/cashier/orders");
}
