"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Store, ShieldCheck, X, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";

const RAIOS = [10, 20, 30, 50, 100];

const inputCls = "block h-12 w-full rounded-2xl px-4 text-sm text-white focus:outline-none transition-all";
const inputStyle = {
  background: "#1a1a1a",
  border: "1px solid rgba(255,255,255,0.07)",
} as const;

export default function FornecedorCadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    tipo: "farmacia",
    endereco_cidade: "",
    endereco_estado: "",
    prazo_entrega_dias: "",
    raio_entrega_km: 50,
  });

  const [cidadesEntrega, setCidadesEntrega] = useState<string[]>([]);
  const [novaCidade, setNovaCidade] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addCidade = () => {
    if (!novaCidade.trim()) return;
    if (cidadesEntrega.includes(novaCidade.trim())) {
      toast.error("Cidade já adicionada");
      return;
    }
    setCidadesEntrega([...cidadesEntrega, novaCidade.trim()]);
    setNovaCidade("");
  };

  const removeCidade = (cidade: string) => {
    setCidadesEntrega(cidadesEntrega.filter(c => c !== cidade));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.razao_social || !form.cnpj) {
      toast.error("Preencha a razão social e o CNPJ.");
      return;
    }
    if (form.endereco_estado && form.endereco_estado.length !== 2) {
      toast.error("UF deve ter 2 letras.");
      return;
    }
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("fornecedores").insert({
      user_id: session.user.id,
      razao_social: form.razao_social,
      nome_fantasia: form.nome_fantasia || null,
      cnpj: form.cnpj,
      tipo: form.tipo,
      endereco_cidade: form.endereco_cidade || null,
      endereco_estado: form.endereco_estado ? form.endereco_estado.toUpperCase() : null,
      raio_entrega_km: form.raio_entrega_km,
      cidades_entrega: cidadesEntrega,
      prazo_entrega_dias: form.prazo_entrega_dias ? Number(form.prazo_entrega_dias) : null,
      status: "pendente",
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Cadastro enviado! Aguarde a aprovação.");
    router.push("/fornecedor/aguardando");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-10" style={{ background: "#0d0d0d" }}>
      <div className="mx-auto w-full max-w-md pb-20">
        {/* Header */}
        <div className="mb-8 flex items-start gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-[#ff6500] shrink-0"
            style={{ background: "rgba(255,101,0,0.1)" }}
          >
            <Store size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Torne-se um Fornecedor</h1>
            <p className="text-sm text-[rgba(255,255,255,0.4)] mt-0.5">Complete os dados da sua empresa para começar a vender.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Data */}
          <div className="rounded-[24px] p-5 space-y-4" style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.28)]">Dados da Empresa</p>
            <DarkInput label="Razão Social" name="razao_social" value={form.razao_social} onChange={handleChange} placeholder="Nome jurídico da empresa" />
            <DarkInput label="Nome Fantasia" name="nome_fantasia" value={form.nome_fantasia} onChange={handleChange} placeholder="Como o cliente te vê" />
            <DarkInput label="CNPJ" name="cnpj" value={form.cnpj} onChange={handleChange} placeholder="00.000.000/0001-00" />

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.28)] ml-1">Tipo de Negócio</label>
              <div className="grid grid-cols-3 gap-2">
                {["farmacia", "distribuidor", "fabricante"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, tipo: t })}
                    className="rounded-xl py-3 text-[11px] font-bold capitalize transition-all"
                    style={
                      form.tipo === t
                        ? { background: "linear-gradient(135deg, #ff6500, #e05500)", color: "white" }
                        : { background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location & Delivery */}
          <div className="rounded-[24px] p-5 space-y-5" style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.28)]">Localização e Entrega</p>

            <div className="grid grid-cols-2 gap-4">
              <DarkInput label="Cidade" name="endereco_cidade" value={form.endereco_cidade} onChange={handleChange} placeholder="Ex: Belo Horizonte" />
              <DarkInput label="UF" name="endereco_estado" value={form.endereco_estado} onChange={handleChange} placeholder="MG" maxLength={2} />
            </div>

            <DarkInput label="Prazo médio de entrega (dias)" name="prazo_entrega_dias" type="number" value={form.prazo_entrega_dias} onChange={handleChange} placeholder="Ex: 3" />

            <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.28)] ml-1">Raio de entrega</label>
              <div className="flex flex-wrap gap-2">
                {RAIOS.map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => setForm({ ...form, raio_entrega_km: km })}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    style={
                      form.raio_entrega_km === km
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
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.28)] ml-1">Cidades adicionais (opcional)</label>
              <div className="flex gap-2">
                <input
                  placeholder="Ex: Contagem, MG"
                  value={novaCidade}
                  onChange={(e) => setNovaCidade(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCidade(); } }}
                  className={inputCls}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={addCidade}
                  className="h-12 w-12 rounded-2xl flex items-center justify-center active:scale-90 transition-transform text-[#ff6500]"
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      {cidade}
                      <button
                        type="button"
                        onClick={() => removeCidade(cidade)}
                        className="transition-colors"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                      >
                        <X size={14} />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="p-4 rounded-2xl flex gap-3" style={{ background: "rgba(255,101,0,0.06)", border: "1px solid rgba(255,101,0,0.15)" }}>
            <ShieldCheck className="w-5 h-5 text-[#ff6500] shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              Para garantir a segurança dos pacientes, novos fornecedores passam por uma análise documental manual antes de aparecerem na busca.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-bold text-white active:scale-95 disabled:opacity-70 transition-all"
            style={{ background: "linear-gradient(135deg, #ff6500, #e05500)", boxShadow: "0 8px 24px rgba(255,101,0,0.35)" }}
          >
            {loading ? <LoadingSpinner size="sm" color="white" /> : "Enviar cadastro"}
          </button>
        </form>
      </div>
    </div>
  );
}

function DarkInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest ml-1 text-[rgba(255,255,255,0.28)]">{label}</label>
      <input
        {...props}
        className="block h-12 w-full rounded-2xl px-4 text-sm text-white focus:outline-none transition-all"
        style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.07)" }}
      />
    </div>
  );
}
