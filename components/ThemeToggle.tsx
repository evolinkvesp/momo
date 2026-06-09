"use client";

import { m, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/providers";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Ativar modo dia" : "Ativar modo noite"}
      className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-colors active:scale-[0.98] ${className}`}
      style={{
        background: "var(--color-surface-mid)",
        border: "1px solid var(--color-surface-border)",
      }}
    >
      {/* Toggle pill */}
      <div
        className="relative h-8 w-14 shrink-0 rounded-full p-1 transition-colors duration-300"
        style={{ background: isDark ? "#ff6500" : "#e2e8f0" }}
      >
        <m.div
          animate={{ x: isDark ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="h-6 w-6 rounded-full bg-white shadow-md flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <m.span
                key="moon"
                initial={{ rotate: -30, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 30, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center"
              >
                <Moon className="h-3.5 w-3.5" style={{ color: "#ff6500" }} />
              </m.span>
            ) : (
              <m.span
                key="sun"
                initial={{ rotate: 30, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -30, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center"
              >
                <Sun className="h-3.5 w-3.5" style={{ color: "#f59e0b" }} />
              </m.span>
            )}
          </AnimatePresence>
        </m.div>
      </div>

      {/* Label */}
      <div className="flex-1">
        <p className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
          {isDark ? "Modo noite" : "Modo dia"}
        </p>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {isDark ? "Toque para ativar o dia" : "Toque para ativar a noite"}
        </p>
      </div>
    </button>
  );
}
