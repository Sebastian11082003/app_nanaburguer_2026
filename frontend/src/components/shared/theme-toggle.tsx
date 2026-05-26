"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="
        fixed
        bottom-5
        right-5
        z-50
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-full
        border
        border-[var(--border)]
        bg-[var(--card)]
        shadow-xl
        transition-all
        hover:scale-105
      "
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
