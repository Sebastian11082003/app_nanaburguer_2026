import { ReactNode } from "react";

export default function RestaurantLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink text-paper antialiased">{children}</div>
  );
}
