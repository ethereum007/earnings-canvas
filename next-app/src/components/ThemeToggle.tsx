"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Avoid hydration mismatch — render placeholder until mounted
  if (!mounted) {
    return <div className="w-9 h-9" aria-hidden />;
  }

  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "w-9 h-9 flex items-center justify-center rounded-md transition-colors",
        "text-zinc-400 hover:text-white hover:bg-white/5",
        "light:text-zinc-600 light:hover:text-zinc-900 light:hover:bg-zinc-100"
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
