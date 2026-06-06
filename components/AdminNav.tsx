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
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 bg-[#111] border-r border-[rgba(255,255,255,0.07)] flex-col py-8 px-4 z-50">
        <div className="px-2 mb-8">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[17px] font-black text-white tracking-tight">Momo Admin</span>
            <span className="a-badge-red text-[9px] py-0.5 px-2 font-black tracking-widest">ADMIN</span>
          </div>
          <p className="text-[11px] text-[rgba(255,255,255,0.25)] font-medium">Painel administrativo</p>
        </div>

        <nav className="flex flex-col gap-0.5 flex-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const isFornecedores = item.href === "/admin/fornecedores";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-[13px] font-semibold relative ${
                  active
                    ? "bg-[rgba(239,68,68,0.1)] text-[#ef4444]"
                    : "text-[rgba(255,255,255,0.38)] hover:text-white hover:bg-[rgba(255,255,255,0.04)]"
                }`}
              >
                <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
                {item.label}
                {isFornecedores && pendingCount > 0 && (
                  <span className="ml-auto bg-[#ef4444] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[rgba(255,255,255,0.07)] pt-4 mt-4">
          <div className="flex items-center gap-2.5 px-2">
            <div className="h-8 w-8 rounded-full bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center shrink-0">
              <span className="text-[11px] font-black text-[#ef4444]">A</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-[12px] font-bold text-white">Admin</p>
              <p className="text-[10px] text-[rgba(255,255,255,0.28)] truncate">evolinkbr@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111111] border-t border-[rgba(255,255,255,0.07)] flex justify-around items-center pt-2 pb-6 px-1">
        {navItems.slice(0, 5).map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const isFornecedores = item.href === "/admin/fornecedores";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-2 py-1 relative transition-colors ${
                active ? "text-[#ef4444]" : "text-[rgba(255,255,255,0.28)]"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.6} />
              <span className="text-[9px] font-bold uppercase tracking-widest">
                {item.label.split(" ")[0]}
              </span>
              {isFornecedores && pendingCount > 0 && (
                <span className="absolute top-0 right-1 h-4 w-4 bg-[#ef4444] text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
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
