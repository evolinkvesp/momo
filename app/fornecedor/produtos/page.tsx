"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Plus, Package, Edit2, Trash2, X, ChevronDown } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TIPO_PRODUTO_LABEL, formatBRL } from "@/lib/fornecedores";
import toast from "react-hot-toast";

const DOSES = [2.5, 5, 7.5, 10, 12.5, 15];

type Produto = {
  id: string;
  fornecedor_id: string;
  tipo_produto: "ampola_avulsa" | "caixa";
  dose_mg: number;
  unidades_por_caixa: number | null;
  preco: number;
  preco_promocional: number | null;
  estoque_disponivel: number;
  ativo: boolean;
};

const emptyForm = {
  tipo_produto: "ampola_avulsa" as "ampola_avulsa" | "caixa",
  dose_mg: "5",
  unidades_por_caixa: "",
  preco: "",
  preco_promocional: "",
  estoque_disponivel: "0",
  ativo: true,
};

export default function FornecedorProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [fornecedorId, setFornecedorId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Produto | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Produto | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: fornecedor } = await supabase
      .from("fornecedores")
      .select("id")
      .eq("user_id", session.user.id)
      .single();
    if (fornecedor) {
      setFornecedorId(fornecedor.id);
      const { data } = await supabase
        .from("fornecedor_produtos")
        .select("*")
        .eq("fornecedor_id", fornecedor.id)
        .order("dose_mg", { ascending: true });
      setProdutos((data as Produto[]) || []);
    }
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(p: Produto) {
    setEditing(p);
    setForm({
      tipo_produto: p.tipo_produto,
      dose_mg: String(p.dose_mg),
      unidades_por_caixa: p.unidades_por_caixa?.toString() || "",
      preco: String(p.preco),
      preco_promocional: p.preco_promocional?.toString() || "",
      estoque_disponivel: String(p.estoque_disponivel ?? 0),
      ativo: p.ativo,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!fornecedorId) return;
    if (!form.preco || Number(form.preco) <= 0) {
      toast.error("Informe um preço válido.");
      return;
    }
    if (form.tipo_produto === "caixa" && !form.unidades_por_caixa) {
      toast.error("Informe as unidades por caixa.");
      return;
    }
    setSaving(true);
    const payload = {
      fornecedor_id: fornecedorId,
      tipo_produto: form.tipo_produto,
      dose_mg: Number(form.dose_mg),
      unidades_por_caixa: form.tipo_produto === "caixa" && form.unidades_por_caixa ? Number(form.unidades_por_caixa) : null,
      preco: Number(form.preco),
      preco_promocional: form.preco_promocional ? Number(form.preco_promocional) : null,
      estoque_disponivel: form.estoque_disponivel ? Number(form.estoque_disponivel) : 0,
      ativo: form.ativo,
    };

    if (editing) {
      const { error } = await supabase.from("fornecedor_produtos").update(payload).eq("id", editing.id);
      if (error) { toast.error("Erro ao salvar."); setSaving(false); return; }
      toast.success("Produto atualizado!");
    } else {
      const { error } = await supabase.from("fornecedor_produtos").insert(payload);
      if (error) { toast.error("Erro ao criar."); setSaving(false); return; }
      toast.success("Produto cadastrado!");
    }
    setSaving(false);
    setShowForm(false);
    loadData();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const { error } = await supabase.from("fornecedor_produtos").delete().eq("id", deleteTarget.id);
    if (error) toast.error("Erro ao excluir.");
    else {
      toast.success("Produto excluído.");
      setProdutos((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-[800] text-white tracking-[-0.5px]">Meus Produtos</h2>
          <p className="text-[12px] font-medium text-[rgba(255,255,255,0.3)] mt-0.5">Gerencie seu catálogo</p>
        </div>
        <button
          onClick={openCreate}
          className="h-10 w-10 flex items-center justify-center rounded-full text-white shadow-lg transition-all active:scale-90"
          style={{ background: "linear-gradient(135deg, #ff6500, #e05500)", boxShadow: "0 4px 16px rgba(255,101,0,0.4)" }}
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Product list */}
      <div className="space-y-3">
        {produtos.length === 0 ? (
          <div
            className="text-center py-20 rounded-[28px] border border-dashed"
            style={{ background: "#111111", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <Package className="mx-auto mb-4" size={40} style={{ color: "rgba(255,255,255,0.1)" }} />
            <p className="text-[rgba(255,255,255,0.3)] font-medium text-sm">Nenhum produto cadastrado.</p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 text-sm font-bold text-[#ff6500] hover:underline"
            >
              + Adicionar produto
            </button>
          </div>
        ) : (
          produtos.map((p) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={p.id}
              className="f-card p-4 flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className="h-12 w-12 rounded-[16px] flex items-center justify-center font-black text-[#ff6500] text-sm"
                    style={{ background: "rgba(255,101,0,0.1)" }}
                  >
                    {p.dose_mg}
                  </div>
                  {p.preco_promocional != null && (
                    <div
                      className="absolute -top-2 -right-2 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm uppercase"
                      style={{ background: "#ff6500" }}
                    >
                      Oferta
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{TIPO_PRODUTO_LABEL[p.tipo_produto]}</p>
                    {!p.ativo && (
                      <span
                        className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
                      >
                        Inativo
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <p className="text-xs font-bold text-[#ff6500]">
                      {formatBRL(p.preco_promocional ?? p.preco)}
                    </p>
                    {p.preco_promocional != null && (
                      <span className="text-[10px] font-medium text-[rgba(255,255,255,0.3)] line-through">{formatBRL(p.preco)}</span>
                    )}
                  </div>
                  <p className="text-[10px] font-medium text-[rgba(255,255,255,0.3)]">
                    Estoque:{" "}
                    <span className={p.estoque_disponivel <= 2 ? "text-amber-400 font-bold" : "text-[rgba(255,255,255,0.5)]"}>
                      {p.estoque_disponivel} un
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="p-2.5 rounded-xl transition-all"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ff6500"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,101,0,0.08)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLButtonElement).style.background = ""; }}
                >
                  <Edit2 size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(p)}
                  className="p-2.5 rounded-xl transition-all"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#f87171"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,113,113,0.08)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLButtonElement).style.background = ""; }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.8)" }}>
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-[101] w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl"
              style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-6 sm:hidden" style={{ background: "rgba(255,255,255,0.1)" }} />
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-white">{editing ? "Editar produto" : "Novo produto"}</h2>
                  <p className="text-xs text-[rgba(255,255,255,0.3)]">Gerencie a oferta do seu catálogo</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="h-10 w-10 flex items-center justify-center rounded-full transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                {/* Tipo de produto */}
                <div>
                  <label className="mb-2.5 block text-[10px] font-bold uppercase tracking-widest ml-1" style={{ color: "rgba(255,255,255,0.3)" }}>Tipo de Produto</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["ampola_avulsa", "caixa"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, tipo_produto: t })}
                        className="rounded-2xl py-3.5 text-xs font-bold transition-all"
                        style={
                          form.tipo_produto === t
                            ? { background: "linear-gradient(135deg, #ff6500, #e05500)", color: "white", boxShadow: "0 4px 16px rgba(255,101,0,0.3)" }
                            : { background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }
                        }
                      >
                        {TIPO_PRODUTO_LABEL[t]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dose */}
                <div>
                  <label className="mb-2.5 block text-[10px] font-bold uppercase tracking-widest ml-1" style={{ color: "rgba(255,255,255,0.3)" }}>Dose (mg)</label>
                  <div className="flex flex-wrap gap-2">
                    {DOSES.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setForm({ ...form, dose_mg: String(d) })}
                        className="min-w-[48px] px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
                        style={
                          form.dose_mg === String(d)
                            ? { background: "#ff6500", color: "white" }
                            : { background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }
                        }
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {form.tipo_produto === "caixa" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <DarkField label="Unidades por caixa">
                      <input type="number" value={form.unidades_por_caixa} onChange={(e) => setForm({ ...form, unidades_por_caixa: e.target.value })} className="w-full h-12 rounded-2xl px-4 text-sm text-white bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] focus:outline-none focus:border-[rgba(255,101,0,0.4)]" placeholder="Ex: 4" />
                    </DarkField>
                  </motion.div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <DarkField label="Preço (R$)">
                    <input type="number" step="0.01" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} className="w-full h-12 rounded-2xl px-4 text-sm text-white bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] focus:outline-none focus:border-[rgba(255,101,0,0.4)]" placeholder="0,00" />
                  </DarkField>
                  <DarkField label="Promoção (R$)">
                    <input type="number" step="0.01" value={form.preco_promocional} onChange={(e) => setForm({ ...form, preco_promocional: e.target.value })} className="w-full h-12 rounded-2xl px-4 text-sm text-white bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] focus:outline-none focus:border-[rgba(255,101,0,0.4)]" placeholder="opcional" />
                  </DarkField>
                </div>

                <DarkField label="Estoque disponível">
                  <input type="number" value={form.estoque_disponivel} onChange={(e) => setForm({ ...form, estoque_disponivel: e.target.value })} className="w-full h-12 rounded-2xl px-4 text-sm text-white bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] focus:outline-none focus:border-[rgba(255,101,0,0.4)]" />
                </DarkField>

                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl transition-all" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-5 w-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                    onClick={() => setForm({ ...form, ativo: !form.ativo })}
                    style={form.ativo ? { background: "#ff6500" } : { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                  >
                    {form.ativo && <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Disponível para venda</p>
                    <p className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>Desative para ocultar este item da busca</p>
                  </div>
                </label>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-bold text-white transition-all active:scale-[0.98] disabled:opacity-70"
                    style={{ background: "linear-gradient(135deg, #ff6500, #e05500)", boxShadow: "0 8px 24px rgba(255,101,0,0.35)" }}
                  >
                    {saving ? <LoadingSpinner size="sm" color="white" /> : editing ? "Salvar alterações" : "Cadastrar produto"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Excluir produto"
        message="Tem certeza que deseja remover este produto do seu catálogo?"
        confirmText="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function DarkField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest ml-1" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</label>
      {children}
    </div>
  );
}
