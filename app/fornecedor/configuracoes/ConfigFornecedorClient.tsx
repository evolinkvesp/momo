"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Save, LogOut, Store, MapPin, X, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const RAIOS = [10, 20, 30, 50, 100];

const inputStyle = {
  background: "#1a1a1a",
  border: "1px solid rgba(255,255,255,0.07)",
  color: "white",
  borderRadius: "16px",
  height: "48px",
  padding: "0 16px",
  fontSize: "14px",
  width: "100%",
  outline: "none",
} as const;

export function ConfigFornecedorClient({ initial }: { initial: any }) {
  const [form, setForm] = useState({
    nome_fantasia: initial.nome_fantasia || "",
    descricao: initial.descricao || "",
    whatsapp: initial.whatsapp || "",
    telefone: initial.telefone || "",
    prazo_entrega_dias: initial.prazo_entrega_dias?.toString() || "",
    entrega_gratis_acima: initial.entrega_gratis_acima?.toString() || "",
  });

  const [raioEntrega, setRaioEntrega] = useState<number>(initial.raio_entrega_km || 50);
  const [cidadesEntrega, setCidadesEntrega] = useState<string[]>(initial.cidades_entrega || []);
  const [novaCidade, setNovaCidade] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addCidade = () => {
    const cidade = novaCidade.trim();
    if (!cidade) return;
    if (cidadesEntrega.some(c => c.toLowerCase() === cidade.toLowerCase())) {
      toast.error("Cidade já adicionada");
      return;
    }
    setCidadesEntrega([...cidadesEntrega, cidade]);
    setNovaCidade("");
  };

  const removeCidade = (cidade: string) => {
    setCidadesEntrega(cidadesEntrega.filter(c => c !== cidade));
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("fornecedores")
      .update({
        nome_fantasia: form.nome_fantasia || null,
        descricao: form.descricao || null,
        whatsapp: form.whatsapp || null,
        telefone: form.telefone || null,
        prazo_entrega_dias: form.prazo_entrega_dias ? Number(form.prazo_entrega_dias) : null,
        entrega_gratis_acima: form.entrega_gratis_acima ? Number(form.entrega_gratis_acima) : null,
        raio_entrega_km: raioEntrega,
        cidades_entrega: cidadesEntrega,
      })
      .eq("id", initial.id);

    if (error) toast.error("Erro ao salvar.");
    else toast.success("Perfil atualizado!");
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-[800] text-white tracking-[-0.5px]">Configurações</h2>
        <p className="text-[12px] font-medium text-[rgba(255,255,255,0.3)] mt-0.5">Gerencie o perfil da sua empresa</p>
      </div>

      {/* Profile Card */}
      <div className="f-card p-6 space-y-6">
        <div className="flex items-center gap-4 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center text-[#ff6500]"
            style={{ background: "rgba(255,101,0,0.1)" }}
          >
            <Store size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-base font-black text-white leading-tight">{initial.razao_social}</h2>
            <p className="text-[10px] font-bold text-[rgba(255,255,255,0.3)] uppercase tracking-widest mt-1">CNPJ {initial.cnpj}</p>
          </div>
        </div>

        <div className="space-y-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.28)]">Dados Públicos</p>
          <DarkField label="Nome Fantasia">
            <input name="nome_fantasia" value={form.nome_fantasia} onChange={handleChange} style={inputStyle} placeholder="Como os clientes te conhecem" />
          </DarkField>
          <DarkField label="Descrição da Empresa">
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              placeholder="Conte aos pacientes sobre seu diferencial, atendimento e prazos."
              rows={3}
              style={{ ...inputStyle, height: "auto", padding: "12px 16px", resize: "none" }}
            />
          </DarkField>
          <div className="grid grid-cols-2 gap-4">
            <DarkField label="WhatsApp">
              <input name="whatsapp" value={form.whatsapp} onChange={handleChange} style={inputStyle} placeholder="(11) 90000-0000" />
            </DarkField>
            <DarkField label="Telefone Fixo">
              <input name="telefone" value={form.telefone} onChange={handleChange} style={inputStyle} placeholder="(11) 4004-0000" />
            </DarkField>
          </div>
        </div>
      </div>

      {/* Delivery Area Card */}
      <div className="f-card p-6 space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#ff6500] animate-pulse" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.28)]">Logística e Entrega</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DarkField label="Prazo médio (dias)">
            <input name="prazo_entrega_dias" type="number" value={form.prazo_entrega_dias} onChange={handleChange} style={inputStyle} placeholder="Ex: 2" />
          </DarkField>
          <DarkField label="Frete Grátis > (R$)">
            <input name="entrega_gratis_acima" type="number" value={form.entrega_gratis_acima} onChange={handleChange} style={inputStyle} placeholder="Ex: 300" />
          </DarkField>
        </div>

        <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

        <DarkField label="Sede / Cidade Base">
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.2)]" size={16} />
            <input
              readOnly
              value={`${initial.endereco_cidade}, ${initial.endereco_estado}`}
              style={{ ...inputStyle, paddingLeft: "44px", opacity: 0.5, cursor: "not-allowed" }}
            />
          </div>
        </DarkField>

        <div>
          <label className="mb-2.5 block text-[10px] font-bold uppercase tracking-widest ml-1 text-[rgba(255,255,255,0.28)]">Raio de atendimento</label>
          <div className="grid grid-cols-5 gap-2">
            {RAIOS.map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => setRaioEntrega(km)}
                className="py-2.5 rounded-xl text-[11px] font-bold transition-all"
                style={
                  raioEntrega === km
                    ? { background: "#ff6500", color: "white" }
                    : { background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }
                }
              >
                {km}km
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2.5 block text-[10px] font-bold uppercase tracking-widest ml-1 text-[rgba(255,255,255,0.28)]">Cidades Adicionais</label>
          <div className="flex gap-2">
            <input
              placeholder="Ex: Contagem, MG"
              value={novaCidade}
              onChange={(e) => setNovaCidade(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCidade()}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              type="button"
              onClick={addCidade}
              className="h-12 w-12 rounded-2xl flex items-center justify-center active:scale-90 transition-transform shrink-0 text-[#ff6500]"
              style={{ background: "rgba(255,101,0,0.1)" }}
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <AnimatePresence>
              {cidadesEntrega.map((cidade) => (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  key={cidade}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {cidade}
                  <button
                    type="button"
                    onClick={() => removeCidade(cidade)}
                    className="transition-colors p-0.5"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = "#f87171"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.3)"}
                  >
                    <X size={14} />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-bold text-white active:scale-[0.98] disabled:opacity-70 transition-all"
          style={{ background: "linear-gradient(135deg, #ff6500, #e05500)", boxShadow: "0 8px 24px rgba(255,101,0,0.35)" }}
        >
          {loading ? <LoadingSpinner size="sm" color="white" /> : <><Save size={18} /> Salvar alterações</>}
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-red-400 transition-colors"
          style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.15)" }}
        >
          <LogOut size={16} /> Sair da conta
        </button>
      </div>
    </div>
  );
}

function DarkField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest ml-1 text-[rgba(255,255,255,0.28)]">{label}</label>
      {children}
    </div>
  );
}
