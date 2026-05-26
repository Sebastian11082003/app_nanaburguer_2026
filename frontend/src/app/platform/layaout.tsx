import { PlatformShell } from "@/src/components/layaout/platform-shell";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlatformShell>{children}</PlatformShell>;
}
