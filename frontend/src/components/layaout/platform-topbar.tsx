"use client";

import { usePlatformAuthStore } from "@/src/store/platform-auth.store";

export function PlatformTopbar() {
  const admin = usePlatformAuthStore((state) => state.admin);

  return (
    <header className="flex h-20 items-center justify-between border-b border-zinc-800 px-8">
      <div>
        <h2 className="text-xl font-bold">Plataforma</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-semibold">{admin?.fullName}</p>

          <p className="text-sm text-zinc-400">Super Admin</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 font-bold">
          {admin?.fullName?.charAt(0)}
        </div>
      </div>
    </header>
  );
}
