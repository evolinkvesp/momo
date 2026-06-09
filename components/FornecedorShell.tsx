"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Package, ShoppingBag, Settings, Store } from "lucide-react";

interface FornecedorShellProps {
  children: React.ReactNode;
  fornecedorNome?: string;
  status?: string;
}

export function FornecedorShell({ children, fornecedorNome, status }: FornecedorShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isCadastroOrAguardando = pathname === '/fornecedor/cadastro' || pathname === '/fornecedor/aguardando';

  if (isCadastroOrAguardando) {
    return <main className="min-h-screen" style={{ background: "#0d0d0d" }}>{children}</main>;
  }

  const getStatusBadge = () => {
    if (status === 'ativo') return (
      <span className="px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider"
        style={{ background: "rgba(255,101,0,0.12)", color: "#ff6500", border: "1px solid rgba(255,101,0,0.2)" }}>
        Ativo
      </span>
    );
    if (status === 'pendente') return (
      <span className="px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider"
        style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
        Pendente
      </span>
    );
    return (
      <span className="px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider"
        style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
        Suspenso
      </span>
    );
  };

  const navItems = [
    { label: "Dashboard", href: "/fornecedor", icon: LayoutDashboard },
    { label: "Pedidos", href: "/fornecedor/pedidos", icon: ShoppingBag },
    { label: "Produtos", href: "/fornecedor/produtos", icon: Package },
    { label: "Configurações", href: "/fornecedor/configuracoes", icon: Settings },
  ];

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="px-5 py-6">
        <div className="flex items-center gap-2 mb-2">
          <Store className="h-6 w-6" style={{ color: "#ff6500" }} />
          <p className="text-sm font-bold text-white">Momo</p>
        </div>
        <div
          className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
          style={{ background: "rgba(255,101,0,0.12)", color: "#ff6500", border: "1px solid rgba(255,101,0,0.2)" }}
        >
          Painel Fornecedor
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
              style={
                active
                  ? { background: "rgba(255,101,0,0.12)", color: "#ff6500", border: "1px solid rgba(255,101,0,0.15)" }
                  : { color: "#9ca3af" }
              }
            >
              <Icon className="h-5 w-5" style={{ color: active ? "#ff6500" : "#555" }} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex" style={{ background: "#0d0d0d" }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden w-64 shrink-0 lg:flex lg:flex-col"
        style={{ background: "#111111", borderRight: "1px solid #1e1e1e" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-hidden />
          <aside
            className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col shadow-2xl"
            style={{ background: "#111111", borderRight: "1px solid #1e1e1e" }}
          >
            <div className="flex items-center justify-end px-4 py-3" style={{ borderBottom: "1px solid #1e1e1e" }}>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 transition-colors"
                style={{ color: "#9ca3af" }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 backdrop-blur lg:px-8"
          style={{ background: "rgba(17,17,17,0.9)", borderBottom: "1px solid #1e1e1e" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg p-2 -ml-2 transition-colors lg:hidden"
              style={{ color: "#9ca3af" }}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-white">{fornecedorNome || 'Carregando...'}</h1>
              {getStatusBadge()}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
