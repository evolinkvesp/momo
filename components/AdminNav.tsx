"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  ShoppingBag,
  Bell,
  DollarSign,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",    href: "/admin",              icon: LayoutDashboard },
  { label: "Fornecedores", href: "/admin/fornecedores", icon: Building2 },
  { label: "Usuários",     href: "/admin/usuarios",     icon: Users },
  { label: "Pedidos",      href: "/admin/pedidos",      icon: ShoppingBag },
  { label: "Notificações", href: "/admin/notificacoes", icon: Bell },
  { label: "Financeiro",   href: "/admin/financeiro",   icon: DollarSign },
];

export function AdminNav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────── */}
      <aside
        className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 flex-col py-8 px-4 z-50"
        style={{
          background: "#0a0a0a",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Brand */}
        <div className="px-2 mb-10">
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center text-[11px] font-black"
              style={{ background: "linear-gradient(135deg, #e11d48, #9f1239)", color: "white", boxShadow: "0 4px 12px rgba(225,29,72,0.35)" }}
            >
              A
            </div>
            <span
              className="text-[16px] font-black text-white tracking-tight"
              style={{ fontFamily: "var(--font-syne, sans-serif)" }}
            >
              Admin
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] ml-0.5 mt-2" style={{ color: "rgba(255,255,255,0.18)" }}>
            Command Center
          </p>
          {/* Red separator */}
          <div className="mt-4 h-px" style={{ background: "linear-gradient(to right, rgba(225,29,72,0.4), transparent)" }} />
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {navItems.map((navItem) => {
            const active = isActive(navItem.href);
            const Icon = navItem.icon;
            const isFornecedores = navItem.href === "/admin/fornecedores";
            return (
              <Link
                key={navItem.href}
                href={navItem.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-[13px] font-semibold relative"
                style={
                  active
                    ? {
                        background: "rgba(225,29,72,0.10)",
                        color: "#f43f5e",
                        borderLeft: "2px solid #e11d48",
                        paddingLeft: "10px",
                      }
                    : {
                        color: "rgba(255,255,255,0.32)",
                        borderLeft: "2px solid transparent",
                        paddingLeft: "10px",
                      }
                }
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.32)";
                    (e.currentTarget as HTMLElement).style.background = "";
                  }
                }}
              >
                <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                {navItem.label}
                {isFornecedores && pendingCount > 0 && (
                  <span
                    className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none"
                    style={{ background: "#e11d48", color: "white" }}
                  >
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-2.5 px-2">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-black"
              style={{ background: "rgba(225,29,72,0.10)", color: "#e11d48", border: "1px solid rgba(225,29,72,0.18)" }}
            >
              R
            </div>
            <div className="overflow-hidden">
              <p className="text-[12px] font-bold text-white leading-tight">Ryan</p>
              <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.22)" }}>
                ryan@gmail.com
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center pt-2 pb-6 px-1"
        style={{
          background: "#0a0a0a",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {navItems.slice(0, 5).map((navItem) => {
          const active = isActive(navItem.href);
          const Icon = navItem.icon;
          const isFornecedores = navItem.href === "/admin/fornecedores";
          return (
            <Link
              key={navItem.href}
              href={navItem.href}
              className="flex flex-col items-center gap-1 px-2 py-1 relative transition-colors"
              style={{ color: active ? "#e11d48" : "rgba(255,255,255,0.25)" }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.6} />
              <span className="text-[9px] font-black uppercase tracking-widest">
                {navItem.label.split(" ")[0]}
              </span>
              {isFornecedores && pendingCount > 0 && (
                <span
                  className="absolute top-0 right-1 h-4 w-4 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none"
                  style={{ background: "#e11d48" }}
                >
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
