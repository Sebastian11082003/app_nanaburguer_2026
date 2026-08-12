"use client";

import { usePathname } from "next/navigation";

import { PlatformShell } from "@/src/components/layaout/platform-shell";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/platform/login") {
    return children;
  }

  return <PlatformShell>{children}</PlatformShell>;
}
