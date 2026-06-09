"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Package, Settings, Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/providers";

export function SupplierBottomNav() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: "Painel", href: "/fornecedor", icon: LayoutDashboard },
    { label: "Pedidos", href: "/fornecedor/pedidos", icon: ClipboardList },
    { label: "Produtos", href: "/fornecedor/produtos", icon: Package },
    { label: "Perfil", href: "/fornecedor/configuracoes", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-surface-border px-6 pt-3 pb-8 flex justify-around items-center shadow-[0_-4px_16px_rgba(0,0,0,0.05)] transition-colors duration-300">
      {navItems.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-all ${
              active ? "text-ember" : "text-text-dim"
            } active:scale-90`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.6} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </Link>
        );
      })}
      
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="flex flex-col items-center gap-1 text-text-dim active:scale-90 transition-all"
      >
        {theme === "dark" ? (
          <Sun size={22} strokeWidth={1.6} />
        ) : (
          <Moon size={22} strokeWidth={1.6} />
        )}
        <span className="text-[10px] font-bold uppercase tracking-widest">Tema</span>
      </button>
    </nav>
  );
}
