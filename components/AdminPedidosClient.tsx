"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, AlertTriangle, RefreshCw, Check, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Pedido = {
  id: string; codigo: string; status: string; preco_total: number;
  cancelamento_motivo: string | null; observacoes_paciente: string | null;
  observacoes_fornecedor: string | null; created_at: string;
  paciente: { nome: string | null; email: string } | null;
  fornecedor: { nome_fantasia: string | null; razao_social: string; email_contato: string } | null;
  produto: { tipo_produto: string; dose_mg: number } | null;
};

const TIPO_PRODUTO_LABEL: Record<string, string> = { ampola_avulsa: "Ampola avulsa", caixa: "Caixa" };
const STATUS_COLOR: Record<string, string> = { novo: "#60a5fa", confirmado: "#4ade80", enviado: "#fbbf24", entregue: "#4ade80", cancelado: "#ef4444" };
const formatBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const FILTROS = [{ key: "todos", label: "Todos" }, { key: "problema", label: "Com problema" }, { key: "cancelado", label: "Cancelados" }];

export function AdminPedidosClient({ pedidos: initial }: { pedidos: Pedido[] }) {
  const [pedidos, setPedidos] = useState(initial);
  const [filtro, setFiltro] = useState("todos");
  const [loading, setLoading] = useState<string | null>(null);
  const [mediacao, setMediacao] = useState<{ id: string; codigo: string } | null>(null);
  const [mensagemMediacao, setMensagemMediacao] = useState("");

  const filtered = pedidos.filter((p) => {
    if (filtro === "cancelado") return p.status === "cancelado";
    if (filtro === "problema") return p.status === "cancelado" || !!p.cancelamento_motivo || !!p.observacoes_paciente;
    return true;
  });

  async function handleAction(id: string, action: string, mensagem?: string) {
    setLoading(id + action);
    try {
      const res = await fetch(`/api/admin/pedidos/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, mensagem }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPedidos((prev) => prev.map((p) => p.id === id ? { ...p, status: data.novoStatus } : p));
      const msgs: Record<string, string> = { reembolso: "Reembolso registrado", forcar_entregue: "Marcado como entregue", cancelar: "Pedido cancelado" };
      toast.success(msgs[action] || "Ação realizada");
    } catch (e: any) {
      toast.error(e.message || "Erro");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-black text-white tracking-tight">Pedidos</h1>
        <p className="text-[rgba(255,255,255,0.35)] text-[13px] mt-0.5">{pedidos.length} total</p>
      </div>

      <div className="flex gap-2">
        {FILTROS.map((f) => <button key={f.key} onClick={() => setFiltro(f.key)} className={`a-tab ${filtro === f.key ? "active" : ""}`}>{f.label}</button>)}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-16 a-card">
            <ShoppingBag size={32} className="mx-auto mb-3 text-[rgba(255,255,255,0.12)]" />
            <p className="text-[rgba(255,255,255,0.25)] text-[13px]">Nenhum pedido encontrado</p>
          </div>
        )}

        {filtered.map((p, i) => {
          const color = STATUS_COLOR[p.status] || "#ffffff";
          const prodLabel = p.produto ? `${TIPO_PRODUTO_LABEL[p.produto.tipo_produto] || p.produto.tipo_produto} · ${p.produto.dose_mg}mg` : "–";
          const isLoading = loading?.startsWith(p.id);
          const fornecedorNome = p.fornecedor?.nome_fantasia || p.fornecedor?.razao_social || "–";

          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }} className="a-card-lg p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-black text-white font-mono">{p.codigo}</p>
                  <p className="text-[11px] text-[rgba(255,255,255,0.35)] mt-0.5">{format(new Date(p.created_at), "dd 'de' MMM yyyy, HH:mm", { locale: ptBR })}</p>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full shrink-0" style={{ background: `${color}18`, color }}>{p.status}</span>
              </div>

              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-white font-semibold truncate max-w-[120px]">{p.paciente?.nome || p.paciente?.email || "Paciente"}</span>
                <span className="text-[rgba(255,255,255,0.2)]">→</span>
                <span className="text-[rgba(255,255,255,0.55)] truncate">{fornecedorNome}</span>
              </div>

              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[rgba(255,255,255,0.5)]">{prodLabel}</span>
                <span className="font-bold text-white">{formatBRL(p.preco_total || 0)}</span>
              </div>

              {(p.cancelamento_motivo || p.observacoes_paciente) && (
                <div className="bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.12)] rounded-xl p-3">
                  <p className="text-[11px] font-bold text-[#ef4444] uppercase mb-1">{p.cancelamento_motivo ? "Motivo do cancelamento" : "Observação do paciente"}</p>
                  <p className="text-[12px] text-[rgba(255,255,255,0.55)]">{p.cancelamento_motivo || p.observacoes_paciente}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <button onClick={() => handleAction(p.id, "forcar_entregue")} disabled={!!isLoading || p.status === "entregue"} className="a-btn-green text-[12px] py-2 flex items-center gap-1.5">
                  <Check size={13} />Forçar entregue
                </button>
                <button onClick={() => handleAction(p.id, "reembolso")} disabled={!!isLoading} className="a-btn-red text-[12px] py-2 flex items-center gap-1.5">
                  <RefreshCw size={13} />Reembolso
                </button>
                <button onClick={() => setMediacao({ id: p.id, codigo: p.codigo })} disabled={!!isLoading} className="a-btn-ghost text-[12px] py-2 flex items-center gap-1.5">
                  <AlertTriangle size={13} />Mediar
                </button>
                {p.paciente?.email && <a href={`mailto:${p.paciente.email}?subject=Pedido ${p.codigo}`} className="a-btn-ghost text-[12px] py-2 flex items-center gap-1.5"><Mail size={13} />Paciente</a>}
                {p.fornecedor?.email_contato && <a href={`mailto:${p.fornecedor.email_contato}?subject=Pedido ${p.codigo}`} className="a-btn-ghost text-[12px] py-2 flex items-center gap-1.5"><Mail size={13} />Fornecedor</a>}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {mediacao && (
          <MediacaoModal 
            pedido={mediacao} 
            mensagem={mensagemMediacao}
            setMensagem={setMensagemMediacao}
            onClose={() => setMediacao(null)}
            onConfirm={async () => { 
              if (!mensagemMediacao.trim()) return; 
              await handleAction(mediacao.id, "cancelar", mensagemMediacao); 
              setMediacao(null); 
              setMensagemMediacao(""); 
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MediacaoModal({ pedido, mensagem, setMensagem, onClose, onConfirm }: any) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-end md:items-center justify-center p-4 bg-black/80 backdrop-blur-sm" style={{ zIndex: "var(--z-modal)" }}>
      <div className="absolute inset-0" onClick={onClose} />
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="relative a-card-lg p-6 w-full max-w-md space-y-4">
        <h3 className="text-xl font-black text-white">Mediar pedido {pedido.codigo}</h3>
        <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Descreva a decisão ou instrução de mediação..." className="a-input resize-none h-28" />
        <div className="flex gap-3">
          <button onClick={onClose} className="a-btn-ghost flex-1">Cancelar</button>
          <button onClick={onConfirm} disabled={!mensagem.trim()} className="a-btn-blue flex-1">
            Registrar mediação
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
