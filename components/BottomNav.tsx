"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Syringe,
  HeartPulse,
  MoreHorizontal,
  PackageOpen,
  Bot,
  Settings,
  X,
  ShoppingBag,
  Store,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { m, AnimatePresence } from "framer-motion";

interface Item {
  label: string;
  href: string;
  icon: LucideIcon;
  role?: 'paciente' | 'fornecedor';
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [role, setRole] = useState<'paciente' | 'fornecedor'>('paciente');
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    async function checkRole() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: fornecedor } = await supabase
        .from('fornecedores')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (fornecedor) {
        setRole('fornecedor');
        const { count } = await supabase
          .from('pedidos')
          .select('*', { count: 'exact', head: true })
          .eq('fornecedor_id', fornecedor.id)
          .eq('status', 'novo');

        setPendingOrders(count || 0);

        const channel = supabase
          .channel('nav-orders')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos', filter: `fornecedor_id=eq.${fornecedor.id}` },
          () => setPendingOrders(prev => prev + 1))
          .subscribe();

        return () => { supabase.removeChannel(channel); };
      }
    }
    checkRole();
  }, []);

  const primaryItems: Item[] = role === 'paciente' ? [
    { label: "Home", href: "/", icon: Home },
    { label: "Doses", href: "/doses", icon: Syringe },
    { label: "Saúde", href: "/saude", icon: HeartPulse },
  ] : [
    { label: "Home", href: "/", icon: Home },
    { label: "Pedidos", href: "/fornecedor/pedidos", icon: ShoppingBag },
    { label: "Produtos", href: "/fornecedor/produtos", icon: Store },
    { label: "Estoque", href: "/estoque", icon: PackageOpen },
  ];

  const secondaryItems: Item[] = [
    { label: "Assistente IA", href: "/assistente", icon: Bot },
    { label: "Configurações", href: "/configuracoes", icon: Settings },
    ...(role === 'paciente' ? [
      { label: "Estoque", href: "/estoque", icon: PackageOpen },
      { label: "Meus Pedidos", href: "/meus-pedidos", icon: ShoppingBag },
    ] : []),
  ];

  const maisActive = secondaryItems.some((s) => isActive(pathname, s.href));

  return (
    <>
      <AnimatePresence>
        {sheetOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSheetOpen(false)}
            />
            <m.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative m-4 w-full max-w-md rounded-[32px] p-6 shadow-2xl z-[101]"
              style={{ background: "#161616", border: "1px solid #2d2d2d" }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Explorar</h3>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="rounded-full p-2 transition-colors"
                  style={{ background: "#222222", color: "#9ca3af" }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 pb-4">
                {secondaryItems.map((s) => {
                  const Icon = s.icon;
                  const active = isActive(pathname, s.href);
                  return (
                    <Link
                      key={s.href}
                      href={s.href}
                      onMouseEnter={() => router.prefetch(s.href)}
                      onClick={() => setSheetOpen(false)}
                      className="flex flex-col items-center gap-2 rounded-[24px] p-4 text-center transition-all"
                      style={{
                        background: active ? "rgba(255,101,0,0.12)" : "#1e1e1e",
                        border: active ? "1px solid rgba(255,101,0,0.25)" : "1px solid #2d2d2d",
                      }}
                    >
                      <span
                        className="flex h-12 w-12 items-center justify-center rounded-full"
                        style={{
                          background: active ? "rgba(255,101,0,0.2)" : "#2a2a2a",
                          color: active ? "#ff6500" : "#9ca3af",
                        }}
                      >
                        <Icon className="h-5 w-5" strokeWidth={2.5} />
                      </span>
                      <span className="text-[11px] font-bold" style={{ color: active ? "#ff6500" : "#ffffff" }}>
                        {s.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
        <div
          className="mx-auto flex w-full max-w-[340px] items-center justify-around gap-1 rounded-full p-1.5 shadow-2xl pointer-events-auto"
          style={{
            background: "rgba(10,10,10,0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid #2d2d2d",
          }}
        >
          {primaryItems.map((item) => {
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
                    ? {
                        background: "#ff6500",
                        padding: "8px 16px",
                        boxShadow: "0 4px 16px rgba(255,101,0,0.35)",
                      }
                    : { padding: "12px" }
                }
              >
                <Icon
                  className="h-5 w-5 shrink-0"
                  strokeWidth={2.5}
                  style={{ color: active ? "#ffffff" : "rgba(255,255,255,0.35)" }}
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
            style={
              maisActive
                ? {
                    background: "#ff6500",
                    padding: "8px 16px",
                    boxShadow: "0 4px 16px rgba(255,101,0,0.35)",
                  }
                : { padding: "12px" }
            }
          >
            <MoreHorizontal
              className="h-5 w-5 shrink-0"
              strokeWidth={2.5}
              style={{ color: maisActive ? "#ffffff" : "rgba(255,255,255,0.35)" }}
            />
            {maisActive && (
              <m.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[11px] font-bold text-white whitespace-nowrap"
              >
                Mais
              </m.span>
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
