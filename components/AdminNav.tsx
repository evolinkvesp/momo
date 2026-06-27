"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { InteractiveMenu } from "./InteractiveMenu";

const navItems = [
  { label: "Dashboard",    href: "/admin",              icon: LayoutDashboard },
  { label: "Crescimento",  href: "/admin/crescimento",  icon: TrendingUp },
  { label: "Usuários",     href: "/admin/usuarios",     icon: Users },
  { label: "Pedidos",      href: "/admin/pedidos",      icon: ShoppingBag },
  { label: "Financeiro",   href: "/admin/financeiro",   icon: DollarSign },
];

export function AdminNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col py-8 px-5 z-50 bg-surface border-r border-surface-border shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Brand */}
        <div className="px-2 mb-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center text-[13px] font-black bg-gradient-to-br from-[#ff7a1a] to-[#cc4c00] text-white shadow-[0_4px_12px_rgba(255,101,0,0.25)]">
              M
            </div>
            <span className="text-[18px] font-bold text-text tracking-tight font-sans">
              Admin
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] ml-1 mt-2 text-text-muted">
            Command Center
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map((navItem) => {
            const active = isActive(navItem.href);
            const Icon = navItem.icon;
            return (
              <Link
                key={navItem.href}
                href={navItem.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-[14px] font-semibold relative group ${
                  active
                    ? "bg-[#ff6500]/10 text-[#ff6500] shadow-[inset_2px_0_0_#ff6500]"
                    : "text-text-muted hover:bg-surface-hover hover:text-text"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 2} className={active ? "text-[#ff6500]" : "text-text-dim group-hover:text-text-muted"} />
                {navItem.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-4 pt-5 border-t border-surface-border">
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-[13px] font-black bg-surface-mid border border-surface-border text-text">
              R
            </div>
            <div className="overflow-hidden">
              <p className="text-[13px] font-bold text-text leading-tight">Administrador</p>
              <p className="text-[11px] truncate text-text-muted mt-0.5">
                Sistema Operacional
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-surface/80 backdrop-blur-xl border-t border-surface-border pb-safe">
        <InteractiveMenu items={navItems} accentColor="#ff6500" />
      </div>
    </>
  );
}
