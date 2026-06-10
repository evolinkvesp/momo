"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Settings,
  MoreHorizontal,
  X,
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useTheme } from "@/app/providers";
import { ThemeToggle } from "./ThemeToggle";

function isActive(pathname: string, href: string) {
  return href === "/fornecedor" ? pathname === "/fornecedor" : pathname.startsWith(href);
}

const navItems = [
  { label: "Painel",   href: "/fornecedor",                icon: LayoutDashboard },
  { label: "Pedidos",  href: "/fornecedor/pedidos",        icon: ClipboardList },
  { label: "Produtos", href: "/fornecedor/produtos",       icon: Package },
  { label: "Perfil",   href: "/fornecedor/configuracoes",  icon: Settings },
];

export function SupplierBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);
  const isDark = theme === "dark";

  const inactiveColor = isDark ? "rgba(255,255,255,0.35)" : "rgba(15,23,42,0.35)";
  const pillBg     = isDark ? "rgba(10,10,10,0.95)"   : "rgba(255,255,255,0.97)";
  const pillBorder = isDark ? "#2d2d2d"                : "#e2e8f0";
  const pillShadow = isDark
    ? "0 4px 24px rgba(0,0,0,0.5)"
    : "0 4px 24px rgba(0,0,0,0.08)";

  return (
    <>
      <AnimatePresence>
        {sheetOpen && (
          <div
            className="fixed inset-0 flex items-end justify-center"
            style={{ zIndex: "var(--z-modal)" }}
          >
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSheetOpen(false)}
              style={{ zIndex: "var(--z-overlay)" }}
            />
            <m.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative m-4 w-full max-w-md rounded-[32px] p-6 shadow-2xl"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-surface-border)",
                zIndex: "var(--z-modal)",
              }}
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
                  Mais opções
                </h3>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="rounded-full p-2 transition-colors"
                  style={{
                    background: "var(--color-surface-mid)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ThemeToggle />
            </m.div>
          </div>
        )}
      </AnimatePresence>

      <nav
        className="fixed bottom-0 left-0 right-0 px-4 pt-3 pointer-events-none"
        style={{
          paddingBottom: "max(16px, env(safe-area-inset-bottom))",
          background: "linear-gradient(to top, var(--color-bg) 80%, transparent)",
          zIndex: "var(--z-nav)",
        }}
      >
        <div
          className="mx-auto flex w-full max-w-[340px] items-center justify-around gap-1 rounded-full p-1.5 pointer-events-auto"
          style={{
            background: pillBg,
            backdropFilter: "blur(20px)",
            border: `1px solid ${pillBorder}`,
            boxShadow: pillShadow,
          }}
        >
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => router.prefetch(item.href)}
                className="flex items-center gap-2 rounded-full transition-all duration-300"
                style={
                  active
                    ? { background: "#ff6500", padding: "8px 16px", boxShadow: "0 4px 16px rgba(255,101,0,0.35)" }
                    : { padding: "12px" }
                }
              >
                <Icon
                  className="h-5 w-5 shrink-0"
                  strokeWidth={2.5}
                  style={{ color: active ? "#ffffff" : inactiveColor }}
                />
                {active && (
                  <m.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[11px] font-bold text-white whitespace-nowrap"
                  >
                    {item.label}
                  </m.span>
                )}
              </Link>
            );
          })}

          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-2 rounded-full transition-all duration-300"
            style={{ padding: "12px" }}
          >
            <MoreHorizontal
              className="h-5 w-5 shrink-0"
              strokeWidth={2.5}
              style={{ color: inactiveColor }}
            />
          </button>
        </div>
      </nav>
    </>
  );
}
