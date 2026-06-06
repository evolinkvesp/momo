"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Send, Users, Clock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Historico = {
  id: string;
  titulo: string;
  mensagem: string;
  segmento: string;
  total_enviado: number;
  criado_em: string;
};

const SEGMENTOS = [
  { key: "ativos",          label: "Todos os usuários ativos (trial + premium)" },
  { key: "premium",         label: "Só usuários premium" },
  { key: "trial",           label: "Só usuários em trial" },
  { key: "trial_expirando", label: "Trial expirando em 2 dias" },
  { key: "sem_dose_10d",    label: "Sem dose nos últimos 10 dias" },
  { key: "sem_peso_7d",     label: "Sem peso registrado nos últimos 7 dias" },
];

const URL_OPCOES = [
  { value: "/",          label: "Início" },
  { value: "/doses",     label: "Doses" },
  { value: "/plano",     label: "Plano" },
  { value: "/estoque",   label: "Estoque" },
  { value: "/saude",     label: "Saúde" },
];

const SEGMENTO_LABEL: Record<string, string> = {
  ativos:          "Todos ativos",
  premium:         "Premium",
  trial:           "Trial",
  trial_expirando: "Trial expirando",
  sem_dose_10d:    "Sem dose 10d",
  sem_peso_7d:     "Sem peso 7d",
};

export function AdminNotificacoesClient({ historico: initialHistorico }: { historico: Historico[] }) {
  const [historico, setHistorico] = useState(initialHistorico);
  const [form, setForm] = useState({
    titulo: "",
    mensagem: "",
    url: "/",
    segmento: "ativos",
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ enviado: number; totalUsuarios: number } | null>(null);

  const tituloOk = form.titulo.length > 0 && form.titulo.length <= 50;
  const mensagemOk = form.mensagem.length > 0 && form.mensagem.length <= 150;

  async function handleEnviar() {
    if (!tituloOk || !mensagemOk) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/notificacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult({ enviado: data.enviado, totalUsuarios: data.totalUsuarios });
      toast.success(`Enviado para ${data.enviado} dispositivos`);

      setHistorico((prev) => [
        {
          id: Date.now().toString(),
          titulo: form.titulo,
          mensagem: form.mensagem,
          segmento: form.segmento,
          total_enviado: data.enviado,
          criado_em: new Date().toISOString(),
        },
        ...prev,
      ]);

      setForm({ titulo: "", mensagem: "", url: "/", segmento: "ativos" });
    } catch (e: any) {
      toast.error(e.message || "Erro ao enviar");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-black text-white tracking-tight">Notificações</h1>
        <p className="text-[rgba(255,255,255,0.35)] text-[13px] mt-0.5">Envie push notifications em massa</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div className="a-card-lg p-5 space-y-4">
            <h3 className="text-[14px] font-bold text-white">Nova notificação</h3>

            {/* Título */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-[rgba(255,255,255,0.4)] uppercase tracking-wide">Título</label>
                <span className={`text-[10px] font-bold ${form.titulo.length > 50 ? "text-[#ef4444]" : "text-[rgba(255,255,255,0.28)]"}`}>
                  {form.titulo.length}/50
                </span>
              </div>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value.slice(0, 50) }))}
                placeholder="Ex: 📅 Não esqueça sua dose!"
                className="a-input"
              />
            </div>

            {/* Mensagem */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-[rgba(255,255,255,0.4)] uppercase tracking-wide">Mensagem</label>
                <span className={`text-[10px] font-bold ${form.mensagem.length > 150 ? "text-[#ef4444]" : "text-[rgba(255,255,255,0.28)]"}`}>
                  {form.mensagem.length}/150
                </span>
              </div>
              <textarea
                value={form.mensagem}
                onChange={(e) => setForm((f) => ({ ...f, mensagem: e.target.value.slice(0, 150) }))}
                placeholder="Ex: Sua dose de hoje ainda não foi registrada. Clique para registrar agora."
                className="a-input resize-none h-20"
              />
            </div>

            {/* URL */}
            <div>
              <label className="text-[11px] font-bold text-[rgba(255,255,255,0.4)] uppercase tracking-wide mb-1.5 block">URL de destino</label>
              <select
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                className="a-input"
              >
                {URL_OPCOES.map((o) => (
                  <option key={o.value} value={o.value} style={{ background: "#1a1a1a" }}>
                    {o.label} ({o.value})
                  </option>
                ))}
              </select>
            </div>

            {/* Segmento */}
            <div>
              <label className="text-[11px] font-bold text-[rgba(255,255,255,0.4)] uppercase tracking-wide mb-2 block">
                Destinatários
              </label>
              <div className="space-y-2">
                {SEGMENTOS.map((s) => (
                  <label
                    key={s.key}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      form.segmento === s.key
                        ? "bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)]"
                        : "bg-[rgba(255,255,255,0.03)] border border-transparent hover:border-[rgba(255,255,255,0.07)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="segmento"
                      value={s.key}
                      checked={form.segmento === s.key}
                      onChange={() => setForm((f) => ({ ...f, segmento: s.key }))}
                      className="accent-[#ef4444]"
                    />
                    <span className="text-[12px] text-[rgba(255,255,255,0.65)]">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Send button */}
            <button
              onClick={handleEnviar}
              disabled={sending || !tituloOk || !mensagemOk}
              className="a-btn-red w-full flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <Clock size={15} className="animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <Send size={15} /> Enviar notificação
                </>
              )}
            </button>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.2)] rounded-xl p-3"
              >
                <CheckCircle size={15} className="text-[#4ade80] shrink-0" />
                <p className="text-[12px] text-[#4ade80]">
                  Enviado para <strong>{result.enviado}</strong> dispositivos de {result.totalUsuarios} usuário{result.totalUsuarios !== 1 ? "s" : ""}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Preview + History */}
        <div className="space-y-4">
          {/* Push preview */}
          <div className="a-card p-5">
            <h3 className="text-[12px] font-bold text-[rgba(255,255,255,0.3)] uppercase tracking-wide mb-3">Preview</h3>
            <div className="bg-[rgba(255,255,255,0.04)] rounded-2xl p-4 border border-[rgba(255,255,255,0.07)]">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-[rgba(239,68,68,0.15)] flex items-center justify-center shrink-0">
                  <Bell size={16} className="text-[#ef4444]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-white truncate">
                    {form.titulo || "Título da notificação"}
                  </p>
                  <p className="text-[11px] text-[rgba(255,255,255,0.45)] mt-0.5 line-clamp-2">
                    {form.mensagem || "Corpo da mensagem..."}
                  </p>
                  <p className="text-[10px] text-[rgba(255,255,255,0.25)] mt-1.5">
                    Momo · Agora • {form.url}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-[rgba(255,255,255,0.25)] mt-2 text-center">
              Segmento: <strong className="text-[rgba(255,255,255,0.5)]">{SEGMENTO_LABEL[form.segmento]}</strong>
            </p>
          </div>

          {/* History */}
          <div className="a-card p-5">
            <h3 className="text-[12px] font-bold text-[rgba(255,255,255,0.3)] uppercase tracking-wide mb-3">Histórico de envios</h3>
            {historico.length === 0 ? (
              <p className="text-[rgba(255,255,255,0.2)] text-[12px] text-center py-6">Nenhum envio registrado</p>
            ) : (
              <div className="space-y-2">
                {historico.map((h) => (
                  <div key={h.id} className="bg-[rgba(255,255,255,0.03)] rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-white truncate">{h.titulo}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="a-badge-gray">{SEGMENTO_LABEL[h.segmento] || h.segmento}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[12px] font-bold text-[#4ade80]">{h.total_enviado}</p>
                        <p className="text-[9px] text-[rgba(255,255,255,0.25)]">enviados</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-[rgba(255,255,255,0.2)] mt-1.5">
                      {format(new Date(h.criado_em), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
