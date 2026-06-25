"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Save, LogOut, Store, MapPin, X, Plus, Check, Truck, CreditCard, Image as ImageIcon, Camera } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const RAIOS = [10, 20, 30, 50, 100];
const TEMPOS_ENTREGA = [
  { label: "30 min", value: 30 },
  { label: "1h", value: 60 },
  { label: "2h", value: 120 },
  { label: "3h", value: 180 },
  { label: "1 dia", value: 1440 },
];
const FORMAS_PAGAMENTO_OPCOES = ["Pix", "Cartão de Crédito", "Cartão de Débito", "Dinheiro", "Boleto"];

const inputStyle = {
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid var(--color-surface-border)",
  color: "var(--color-text)",
  borderRadius: "16px",
  height: "48px",
  padding: "0 16px",
  fontSize: "14px",
  width: "100%",
  outline: "none",
  backdropFilter: "blur(12px)",
} as const;

// Formatters
const formatPhone = (val: string) => {
  const v = val.replace(/\D/g, "").slice(0, 11);
  if (v.length <= 2) return v;
  if (v.length <= 6) return `(${v.slice(0,2)}) ${v.slice(2)}`;
  if (v.length <= 10) return `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
  return `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
};

const formatCurrency = (val: string) => {
  const v = val.replace(/\D/g, "");
  if (!v) return "";
  const num = parseInt(v, 10) / 100;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
};

const unformatCurrency = (val: string) => {
  const v = val.replace(/\D/g, "");
  if (!v) return null;
  return parseInt(v, 10) / 100;
};

export function ConfigFornecedorClient({ initial }: { initial: any }) {
  const [activeTab, setActiveTab] = useState<'perfil' | 'logistica' | 'financeiro'>('perfil');

  const [form, setForm] = useState({
    nome_fantasia: initial.nome_fantasia || "",
    descricao: initial.descricao || "",
    whatsapp: formatPhone(initial.whatsapp || ""),
    telefone: formatPhone(initial.telefone || ""),
    prazo_entrega_dias: initial.prazo_entrega_dias?.toString() || "",
    entrega_gratis_acima: initial.entrega_gratis_acima ? formatCurrency(initial.entrega_gratis_acima.toString()) : "",
    chave_pix: initial.chave_pix || "",
    taxa_motoboy: initial.taxa_motoboy ? formatCurrency(initial.taxa_motoboy.toString()) : "",
    logo_url: initial.logo_url || "",
    endereco_cidade: initial.endereco_cidade || "",
    endereco_estado: initial.endereco_estado || "",
  });

  const [raioEntrega, setRaioEntrega] = useState<number>(initial.raio_entrega_km || 50);
  const [tempoEntregaMin, setTempoEntregaMin] = useState<number>(initial.tempo_entrega_minutos || 60);
  const [ofereceFreteFull, setOfereceFreteFull] = useState<boolean>(initial.oferece_frete_full || false);
  const [aceitaCod, setAceitaCod] = useState<boolean>(initial.aceita_cod || false);
  const [cidadesEntrega, setCidadesEntrega] = useState<string[]>(initial.cidades_entrega || []);
  const [formasPagamento, setFormasPagamento] = useState<string[]>(initial.formas_pagamento || []);
  const [novaCidade, setNovaCidade] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "whatsapp" || name === "telefone") {
      setForm({ ...form, [name]: formatPhone(value) });
    } else if (name === "entrega_gratis_acima" || name === "taxa_motoboy") {
      setForm({ ...form, [name]: formatCurrency(value) });
    } else if (name === "endereco_estado") {
      setForm({ ...form, [name]: value.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${initial.id}-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from("fornecedor-logos").upload(fileName, file);
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from("fornecedor-logos").getPublicUrl(fileName);
      setForm(f => ({ ...f, logo_url: publicUrl }));
      toast.success("Logo enviada!");
    } catch (error) {
      toast.error("Erro ao enviar logo");
    } finally {
      setUploadingLogo(false);
    }
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

  const togglePagamento = (pag: string) => {
    setFormasPagamento(prev =>
      prev.includes(pag) ? prev.filter(p => p !== pag) : [...prev, pag]
    );
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
        entrega_gratis_acima: unformatCurrency(form.entrega_gratis_acima),
        raio_entrega_km: raioEntrega,
        tempo_entrega_minutos: tempoEntregaMin,
        oferece_frete_full: ofereceFreteFull,
        aceita_cod: aceitaCod,
        taxa_motoboy: unformatCurrency(form.taxa_motoboy),
        cidades_entrega: cidadesEntrega,
        chave_pix: form.chave_pix || null,
        formas_pagamento: formasPagamento,
        logo_url: form.logo_url || null,
        endereco_cidade: form.endereco_cidade || null,
        endereco_estado: form.endereco_estado || null,
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

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: Store },
    { id: 'logistica', label: 'Logística', icon: Truck },
    { id: 'financeiro', label: 'Financeiro', icon: CreditCard },
  ] as const;

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div>
        <h2 className="text-[24px] font-[800] text-text tracking-[-0.5px]">Configurações</h2>
        <p className="text-[13px] font-medium text-muted mt-0.5">Gerencie o perfil da sua empresa</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-surface p-1 rounded-2xl border border-surface-border sticky top-0 z-10 backdrop-blur-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-bold transition-all ${
                isActive ? "text-white" : "text-text-dim hover:text-text hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-ember rounded-xl -z-10"
                  style={{ boxShadow: "var(--shadow-ember)" }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'perfil' && (
            <div className="f-card p-6 space-y-6 shadow-card bg-surface-mid/50 backdrop-blur-md">
              <div className="flex items-center gap-5 pb-6 border-b border-surface-border">
                <div className="relative group">
                  <div
                    className="h-20 w-20 rounded-2xl flex items-center justify-center bg-surface-mid border border-surface-border overflow-hidden shrink-0"
                  >
                    {form.logo_url ? (
                      <img src={form.logo_url} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon size={32} className="text-text-dim" />
                    )}
                    
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      {uploadingLogo ? (
                        <LoadingSpinner size="sm" color="white" />
                      ) : (
                        <Camera size={24} className="text-white" />
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                    </label>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-black text-text leading-tight">{initial.razao_social}</h2>
                  <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mt-1">CNPJ {formatCNPJ(initial.cnpj)}</p>
                </div>
              </div>

              <div className="space-y-5">
                <DarkField label="Nome Fantasia">
                  <input name="nome_fantasia" value={form.nome_fantasia} onChange={handleChange} style={inputStyle} placeholder="Como os clientes te conhecem" />
                </DarkField>
                <DarkField label="Descrição da Empresa">
                  <textarea
                    name="descricao"
                    value={form.descricao}
                    onChange={handleChange}
                    placeholder="Conte aos pacientes sobre seu diferencial, atendimento e prazos."
                    rows={4}
                    className="focus:ring-2 focus:ring-ember/20 transition-all"
                    style={{ ...inputStyle, height: "auto", padding: "12px 16px", resize: "none" }}
                  />
                </DarkField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DarkField label="WhatsApp">
                    <input name="whatsapp" value={form.whatsapp} onChange={handleChange} style={inputStyle} placeholder="(11) 90000-0000" />
                  </DarkField>
                  <DarkField label="Telefone Fixo (Opcional)">
                    <input name="telefone" value={form.telefone} onChange={handleChange} style={inputStyle} placeholder="(11) 4004-0000" />
                  </DarkField>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logistica' && (
            <div className="f-card p-6 space-y-6 shadow-card bg-surface-mid/50 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-ember animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Logística e Entrega</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DarkField label="Prazo médio (dias)">
                  <input name="prazo_entrega_dias" type="number" value={form.prazo_entrega_dias} onChange={handleChange} style={inputStyle} placeholder="Ex: 2" />
                </DarkField>
                <DarkField label="Frete Grátis > (R$)">
                  <input name="entrega_gratis_acima" value={form.entrega_gratis_acima} onChange={handleChange} style={inputStyle} placeholder="Ex: 300,00" />
                </DarkField>
              </div>

              <DarkField label="Tempo estimado de entrega">
                <div className="grid grid-cols-5 gap-2">
                  {TEMPOS_ENTREGA.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTempoEntregaMin(t.value)}
                      className="py-2.5 rounded-xl text-[11px] font-bold transition-all"
                      style={
                        tempoEntregaMin === t.value
                          ? { background: "var(--color-ember)", color: "white", boxShadow: "var(--shadow-ember)" }
                          : { background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--color-surface-border)", color: "var(--color-text-dim)" }
                      }
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </DarkField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Toggle
                  label="Motoboy / Frete Full"
                  description="Entregas no mesmo dia"
                  checked={ofereceFreteFull}
                  onChange={setOfereceFreteFull}
                />
                <Toggle
                  label="Pagamento na Entrega"
                  description="Cash on delivery (COD)"
                  checked={aceitaCod}
                  onChange={setAceitaCod}
                />
              </div>

              {ofereceFreteFull && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <DarkField label="Taxa do motoboy (R$)">
                    <input name="taxa_motoboy" value={form.taxa_motoboy} onChange={handleChange} style={inputStyle} placeholder="Ex: 15,00" />
                  </DarkField>
                </motion.div>
              )}

              <div className="h-px bg-surface-border" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <DarkField label="Sede / Cidade Base">
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={16} />
                      <input
                        name="endereco_cidade"
                        value={form.endereco_cidade}
                        onChange={handleChange}
                        placeholder="Ex: São Paulo"
                        style={{ ...inputStyle, paddingLeft: "44px" }}
                      />
                    </div>
                  </DarkField>
                </div>
                <DarkField label="Estado (UF)">
                  <input
                    name="endereco_estado"
                    value={form.endereco_estado}
                    onChange={handleChange}
                    placeholder="Ex: SP"
                    maxLength={2}
                    style={inputStyle}
                  />
                </DarkField>
              </div>

              <div>
                <label className="mb-2.5 block text-[10px] font-bold uppercase tracking-widest ml-1 text-text-dim">Raio de atendimento</label>
                <div className="grid grid-cols-5 gap-2">
                  {RAIOS.map((km) => (
                    <button
                      key={km}
                      type="button"
                      onClick={() => setRaioEntrega(km)}
                      className="py-2.5 rounded-xl text-[11px] font-bold transition-all"
                      style={
                        raioEntrega === km
                          ? { background: "var(--color-ember)", color: "white", boxShadow: "var(--shadow-ember)" }
                          : { background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--color-surface-border)", color: "var(--color-text-dim)" }
                      }
                    >
                      {km}km
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2.5 block text-[10px] font-bold uppercase tracking-widest ml-1 text-text-dim">Cidades Adicionais</label>
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
                    className="h-12 w-12 rounded-2xl flex items-center justify-center active:scale-90 transition-transform shrink-0 text-ember"
                    style={{ background: "var(--color-ember-glow)" }}
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-text bg-surface-mid border border-surface-border"
                      >
                        {cidade}
                        <button
                          type="button"
                          onClick={() => removeCidade(cidade)}
                          className="text-text-dim hover:text-danger transition-colors p-0.5"
                        >
                          <X size={14} />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financeiro' && (
            <div className="f-card p-6 space-y-6 shadow-card bg-surface-mid/50 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-ember animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Recebimentos</p>
              </div>

              <DarkField label="Chave PIX (Para Pagamento Antecipado/COD)">
                <input name="chave_pix" value={form.chave_pix} onChange={handleChange} style={inputStyle} placeholder="CPF, CNPJ, E-mail, Celular ou Aleatória" />
              </DarkField>

              <div>
                <label className="mb-2.5 block text-[10px] font-bold uppercase tracking-widest ml-1 text-text-dim">Formas de Pagamento Aceitas</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  {FORMAS_PAGAMENTO_OPCOES.map((pag) => {
                    const ativo = formasPagamento.includes(pag);
                    return (
                      <button
                        key={pag}
                        type="button"
                        onClick={() => togglePagamento(pag)}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-semibold transition-all text-left border"
                        style={
                          ativo
                            ? { background: "var(--color-ember-glow)", border: "1px solid var(--f-ember-bd)", color: "var(--color-ember)" }
                            : { background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--color-surface-border)", color: "var(--color-text-dim)" }
                        }
                      >
                        <div
                          className="h-5 w-5 rounded-md flex items-center justify-center shrink-0 transition-all border"
                          style={
                            ativo
                              ? { background: "var(--color-ember)", borderColor: "var(--color-ember)" }
                              : { borderColor: "var(--color-surface-border)" }
                          }
                        >
                          {ativo && <Check size={12} strokeWidth={3} className="text-white" />}
                        </div>
                        {pag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="space-y-3 pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-bold text-white active:scale-[0.98] disabled:opacity-70 transition-all"
          style={{ background: "linear-gradient(135deg, var(--color-ember), var(--color-ember-dim))", boxShadow: "var(--shadow-ember)" }}
        >
          {loading ? <LoadingSpinner size="sm" color="white" /> : <><Save size={18} /> Salvar alterações</>}
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-danger transition-colors bg-danger/5 border border-danger/15 hover:bg-danger/10"
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
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest ml-1 text-text-dim">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 p-4 rounded-2xl text-left w-full transition-all border"
      style={
        checked
          ? { background: "var(--color-ember-glow)", border: "1px solid var(--f-ember-bd)" }
          : { background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--color-surface-border)" }
      }
    >
      <div
        className="h-5 w-9 rounded-full relative shrink-0 transition-all"
        style={{ background: checked ? "var(--color-ember)" : "var(--color-surface-border)" }}
      >
        <div
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all shadow"
          style={{ left: checked ? "calc(100% - 18px)" : "2px" }}
        />
      </div>
      <div>
        <p className="text-[12px] font-bold" style={{ color: checked ? "var(--color-ember)" : "var(--color-text)" }}>{label}</p>
        <p className="text-[10px] text-text-dim mt-0.5">{description}</p>
      </div>
    </button>
  );
}

// Aux function that formats CNPJ
function formatCNPJ(val: string) {
  if (!val) return "";
  const v = val.replace(/\D/g, "").slice(0, 14);
  if (v.length <= 2) return v;
  if (v.length <= 5) return `${v.slice(0,2)}.${v.slice(2)}`;
  if (v.length <= 8) return `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5)}`;
  if (v.length <= 12) return `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}/${v.slice(8)}`;
  return `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}/${v.slice(8,12)}-${v.slice(12)}`;
}
