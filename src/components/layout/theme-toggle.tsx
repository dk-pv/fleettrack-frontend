"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-lg border border-border" />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-all duration-300 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4.5 w-4.5 transition-transform duration-500 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="h-4.5 w-4.5 transition-transform duration-500 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}