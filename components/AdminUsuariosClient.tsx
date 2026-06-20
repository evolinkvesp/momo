"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, MoreVertical, ChevronRight, Crown, RotateCcw, Shield, ShieldOff, Store, User as UserIcon } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Usuario = {
  id: string; nome: string | null; email: string; plano_ativo: string | null;
  trial_expira_em: string | null; assinatura_expira_em: string | null;
  created_at: string; ultima_dose: string | null;
  is_fornecedor: boolean;
};

const FILTROS = [
  { key: "todos", label: "Todos" }, 
  { key: "pacientes", label: "Pacientes" },
  { key: "fornecedores", label: "Fornecedores" },
  { key: "premium", label: "Premium" },
  { key: "trial", label: "Trial" }, 
  { key: "expirado", label: "Expirado" }, 
  { key: "bloqueado", label: "Bloqueado" },
];

function isExpired(u: Usuario) {
  if (u.plano_ativo === "premium") return !!u.assinatura_expira_em && new Date(u.assinatura_expira_em) < new Date();
  if (u.plano_ativo === "trial") return !!u.trial_expira_em && new Date(u.trial_expira_em) < new Date();
  return false;
}

const badgeBase = "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border";

function planoBadge(u: Usuario) {
  if (u.plano_ativo === "bloqueado") return { label: "BLOQUEADO", cls: `${badgeBase} bg-red-500/10 text-red-500 border-red-500/20` };
  if (isExpired(u)) return { label: "EXPIRADO", cls: `${badgeBase} bg-surface-mid text-text-muted border-surface-border` };
  if (u.plano_ativo === "premium") return { label: "PREMIUM", cls: `${badgeBase} bg-emerald-500/10 text-emerald-500 border-emerald-500/20` };
  if (u.plano_ativo === "trial") return { label: "TRIAL", cls: `${badgeBase} bg-amber-500/10 text-amber-500 border-amber-500/20` };
  return { label: u.plano_ativo?.toUpperCase() || "–", cls: `${badgeBase} bg-surface-mid text-text-muted border-surface-border` };
}

function iniciais(nome: string | null) {
  if (!nome) return "?";
  return nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export function AdminUsuariosClient({ usuarios: initial }: { usuarios: Usuario[] }) {
  const [usuarios, setUsuarios] = useState(initial);
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = usuarios.filter((u) => {
    const matchSearch = !search || (u.nome || "").toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    
    if (filtro === "pacientes") return !u.is_fornecedor;
    if (filtro === "fornecedores") return u.is_fornecedor;
    if (filtro === "premium") return u.plano_ativo === "premium" && !isExpired(u);
    if (filtro === "trial") return u.plano_ativo === "trial" && !isExpired(u);
    if (filtro === "expirado") return isExpired(u);
    if (filtro === "bloqueado") return u.plano_ativo === "bloqueado";
    return true;
  });

  async function handleAction(id: string, action: string) {
    setLoading(id + action);
    setActionMenu(null);
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      if (!res.ok) throw new Error((await res.json()).error);
      const updates: Record<string, Partial<Usuario>> = { dar_premium: { plano_ativo: "premium" }, resetar_trial: { plano_ativo: "trial" }, bloquear: { plano_ativo: "bloqueado" }, desbloquear: { plano_ativo: "trial" } };
      const msgs: Record<string, string> = { dar_premium: "Premium concedido por 30 dias", resetar_trial: "Trial resetado por 7 dias", bloquear: "Usuário bloqueado", desbloquear: "Usuário desbloqueado" };
      setUsuarios((prev) => prev.map((u) => u.id === id ? { ...u, ...(updates[action] || {}) } : u));
      toast.success(msgs[action] || "Ação realizada");
    } catch (e: any) {
      toast.error(e.message || "Erro");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto" onClick={() => setActionMenu(null)}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text tracking-tight">Usuários & Fornecedores</h1>
          <p className="text-text-muted text-sm mt-1">{usuarios.length} registros no total</p>
        </div>
        <div className="flex gap-6 bg-surface border border-surface-border px-5 py-3 rounded-2xl">
          <div className="text-right">
             <p className="text-[10px] font-bold text-[#ff6500] uppercase tracking-widest">Pacientes</p>
             <p className="text-xl font-black text-text leading-none mt-1">{usuarios.filter(u => !u.is_fornecedor).length}</p>
          </div>
          <div className="w-px bg-surface-border" />
          <div className="text-right">
             <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Fornecedores</p>
             <p className="text-xl font-black text-text leading-none mt-1">{usuarios.filter(u => u.is_fornecedor).length}</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input 
          type="text" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Buscar por nome ou email..." 
          className="w-full bg-surface border border-surface-border rounded-xl text-text text-sm pl-11 pr-4 py-3.5 outline-none focus:border-[#ff6500] focus:ring-1 focus:ring-[#ff6500] transition-all shadow-sm" 
        />
      </div>

      <div className="flex gap-2.5 flex-wrap">
        {FILTROS.map((f) => (
          <button 
            key={f.key} 
            onClick={() => setFiltro(f.key)} 
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              filtro === f.key 
                ? "bg-[#ff6500]/10 border-[#ff6500]/30 text-[#ff6500]" 
                : "bg-surface border-surface-border text-text-muted hover:text-text hover:bg-surface-hover"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-surface border border-surface-border rounded-2xl">
            <Users size={40} className="mx-auto mb-4 text-text-dim" />
            <p className="text-text-muted text-sm font-medium">Nenhum registro encontrado</p>
          </div>
        )}

        {filtered.map((u, i) => {
          const badge = planoBadge(u);
          const isMenuOpen = actionMenu === u.id;
          const isLoading = loading?.startsWith(u.id);

          return (
            <motion.div 
              key={u.id} 
              initial={{ opacity: 0, y: 8 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: Math.min(i * 0.03, 0.3) }} 
              className="bg-surface border border-surface-border rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 group hover:shadow-md transition-all relative"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border ${u.is_fornecedor ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-[#ff6500]/10 border-[#ff6500]/20 text-[#ff6500]'}`}>
                  {u.is_fornecedor ? <Store size={20} /> : <UserIcon size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-text truncate">{u.nome || "Sem nome"}</p>
                    {u.is_fornecedor && <span className="text-[9px] font-black bg-blue-500/10 border border-blue-500/20 text-blue-500 px-1.5 py-0.5 rounded leading-tight tracking-widest uppercase">Fornecedor</span>}
                    <span className={badge.cls}>{badge.label}</span>
                  </div>
                  <p className="text-xs text-text-muted truncate">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full pt-3 sm:pt-0 border-t sm:border-t-0 border-surface-border mt-1 sm:mt-0">
                <div className="text-left sm:text-right shrink-0">
                  <p className="text-[11px] font-semibold text-text-dim">Registro: {format(new Date(u.created_at), "dd MMM yyyy", { locale: ptBR })}</p>
                  {!u.is_fornecedor && u.ultima_dose && <p className="text-[11px] font-medium text-text-muted mt-0.5">Última dose: {formatDistanceToNow(new Date(u.ultima_dose), { locale: ptBR, addSuffix: true })}</p>}
                </div>
                <div className="relative shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setActionMenu(isMenuOpen ? null : u.id)} className="h-9 w-9 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-mid transition-all border border-transparent hover:border-surface-border" disabled={!!isLoading}>
                    <MoreVertical size={18} />
                  </button>
                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div initial={{ opacity: 0, scale: 0.95, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -8 }} className="absolute right-0 top-12 z-50 w-60 bg-surface border border-surface-border rounded-2xl shadow-xl overflow-hidden py-1">
                        <Link href={`/admin/usuarios/${u.id}`} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-text hover:bg-surface-hover transition-colors">
                          <ChevronRight size={16} className="text-text-muted" /> Ver Perfil Completo
                        </Link>
                        {!u.is_fornecedor && (
                          <>
                            <div className="h-px bg-surface-border my-1 mx-3" />
                            <button onClick={() => handleAction(u.id, "dar_premium")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-emerald-500 hover:bg-emerald-500/10 transition-colors">
                              <Crown size={16} /> Premium Grátis (30d)
                            </button>
                            <button onClick={() => handleAction(u.id, "resetar_trial")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-amber-500 hover:bg-amber-500/10 transition-colors">
                              <RotateCcw size={16} /> Resetar Trial (7d)
                            </button>
                          </>
                        )}
                        <div className="h-px bg-surface-border my-1 mx-3" />
                        {u.plano_ativo !== "bloqueado" ? (
                          <button onClick={() => handleAction(u.id, "bloquear")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors">
                            <ShieldOff size={16} /> Bloquear Conta
                          </button>
                        ) : (
                          <button onClick={() => handleAction(u.id, "desbloquear")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-emerald-500 hover:bg-emerald-500/10 transition-colors">
                            <Shield size={16} /> Desbloquear Conta
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
