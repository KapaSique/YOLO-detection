"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const next = theme === "light" ? "dark" : "light";

  return (
    <button
      className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-sm font-semibold hover:border-brand"
      onClick={() => setTheme(next)}
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
      {next}
    </button>
  );
}
