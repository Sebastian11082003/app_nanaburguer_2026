import "./globals.css";

import type { Metadata } from "next";
import { Archivo_Black, Outfit, Pacifico } from "next/font/google";

import { PLATFORM_BRAND } from "@/src/config/platform-brand";
import { QueryProvider } from "@/src/providers/query-provider";
import { ThemeProvider } from "@/src/providers/theme-provider";

const display = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const body = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
});

const script = Pacifico({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
});

// Default (tenant-agnostic) metadata — a specific restaurant's own name
// is never appropriate here since this layout wraps every tenant.
export const metadata: Metadata = {
  title: `${PLATFORM_BRAND.name} · SaaS`,
  description: `${PLATFORM_BRAND.tagline}. Pedidos, cocina, caja y delivery.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${script.variable}`}
    >
      <body className="font-body antialiased">
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
