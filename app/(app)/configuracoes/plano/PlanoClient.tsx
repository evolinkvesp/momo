"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Star, Calendar, CreditCard, AlertTriangle, ShieldCheck, TrendingUp, Utensils, Bell, Package, Zap, Check } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StripeCheckout } from "@/components/StripeCheckout";

type PlanType = "mensal" | "trimestral";

interface PlanoClientProps {
  planoAtivo: string;
  assinatura: any;
}

const DORES = [
  { icon: <AlertTriangle size={18} />, text: "Uma dose esquecida zera semanas de progresso — e você nem percebe" },
  { icon: <TrendingUp size={18} />, text: "Sem gráfico de peso, você não sabe se está perdendo gordura ou músculo" },
  { icon: <Utensils size={18} />, text: "A dieta errada sabota o efeito do Mounjaro sem você notar" },
];

const SOLUCOES = [
  { icon: <Bell size={16} />, titulo: "Nunca perca uma dose", desc: "Lembretes automáticos no dia e horário certos" },
  { icon: <TrendingUp size={16} />, titulo: "Veja seu progresso real", desc: "Gráficos de peso, medidas e sintomas semana a semana" },
  { icon: <Utensils size={16} />, titulo: "Receitas que não sabotam", desc: "Geradas por IA para sua fase do tratamento" },
  { icon: <Star size={16} />, titulo: "Histórico para o médico", desc: "Tudo registrado, pronto para a consulta" },
  { icon: <Package size={16} />, titulo: "Alerta de estoque", desc: "Saiba quando comprar antes de ficar sem ampola" },
];

const PLANOS = {
  mensal: {
    label: "Mensal",
    preco: "R$ 29,90",
    precoMes: "R$ 29,90/mês",
    detalhe: "7 dias grátis · cancele quando quiser",
    valorDisplay: "R$ 29,90",
    periodicidade: "mensal",
  },
  trimestral: {
    label: "Trimestral",
    preco: "R$ 69,90",
    precoMes: "R$ 23,30/mês",
    detalhe: "Economize 22% · sem período gratuito",
    economia: "22% OFF",
    valorDisplay: "R$ 69,90",
    periodicidade: "trimestral",
  },
};

export function PlanoClient({ planoAtivo, assinatura }: PlanoClientProps) {
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanType>("trimestral");

  const isPremium = planoAtivo === "premium" && assinatura?.status === "ativa";
  const isCancelScheduled = assinatura?.cancel_at_period_end === true;

  const planoContratado: PlanType = assinatura?.plano_tipo === "trimestral" ? "trimestral" : "mensal";
  const infoContratado = PLANOS[planoContratado];

  async function handlePortal() {
    setLoadingPortal(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPortalError(data.error || "Erro ao abrir portal.");
        setLoadingPortal(false);
      }
    } catch {
      setPortalError("Erro ao conectar com o servidor.");
      setLoadingPortal(false);
    }
  }

  if (isPremium) {
    return (
      <div className="space-y-6 pb-32">
        <PageHeader title="Meu Plano" />

        <div className="space-y-4 animate-fade-in">
          <div
            className="rounded-[24px] p-6 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1a0800, #2d1200)",
              border: "1px solid rgba(255,101,0,0.25)",
              boxShadow: "0 8px 24px rgba(255,101,0,0.15)",
            }}
          >
            <div className="absolute top-[-30px] right-[-30px] w-40 h-40 rounded-full opacity-10" style={{ background: "#ff6500", filter: "blur(40px)" }} />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,101,0,0.15)", border: "1px solid rgba(255,101,0,0.3)" }}>
                <Star size={22} style={{ color: "var(--color-ember)", fill: "var(--color-ember)" }} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Momo Premium</h2>
                <p className="text-xs font-medium text-white/60">
                  Assinatura {infoContratado.periodicidade === "trimestral" ? "Trimestral" : "Mensal"}
                  {planoContratado === "trimestral" && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-black" style={{ background: "rgba(255,101,0,0.2)", color: "#ff6500" }}>
                      <Zap size={7} fill="currentColor" /> 22% OFF
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl p-4 relative z-10" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--color-surface-border)" }}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <CreditCard size={15} />
                  <span>Status</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-success">Ativa</span>
              </div>

              {assinatura.current_period_end && (
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-white/60 min-w-0">
                    <Calendar size={15} className="shrink-0" />
                    <span className="truncate">Próxima renovação</span>
                  </div>
                  <span className="text-sm font-bold text-white shrink-0">
                    {format(parseISO(assinatura.current_period_end), "dd 'de' MMM, yyyy", { locale: ptBR })}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Star size={15} />
                  <span>Valor</span>
                </div>
                <span className="text-sm font-bold text-white">{infoContratado.valorDisplay}</span>
              </div>
            </div>
          </div>

          {isCancelScheduled ? (
            <div className="w-full py-3 px-4 rounded-full text-center text-sm font-medium" style={{ background: "var(--color-surface)", border: "1px solid var(--color-surface-border)", color: "var(--color-text-muted)" }}>
              Cancelamento agendado para {assinatura.current_period_end ? format(parseISO(assinatura.current_period_end), "dd/MM/yyyy", { locale: ptBR }) : "fim do período"}
            </div>
          ) : (
            <>
              <button
                onClick={handlePortal}
                disabled={loadingPortal}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-surface-border)", color: "var(--color-text-muted)" }}
              >
                {loadingPortal ? "Abrindo..." : "Gerenciar Assinatura"}
              </button>
              {portalError && <p className="text-xs text-center text-danger mt-1">{portalError}</p>}
            </>
          )}
        </div>
      </div>
    );
  }

  const planoAtual = PLANOS[plan];

  return (
    <div className="pb-32">
      <PageHeader title="Meu Plano" />

      <div className="space-y-5 animate-fade-in">
        {/* HERO */}
        <div
          className="rounded-[24px] p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1a0800 0%, #2d1200 60%, #1a0800 100%)",
            boxShadow: "0 12px 40px rgba(255,101,0,0.2)",
          }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: "var(--color-ember)", filter: "blur(50px)", transform: "translate(20%, -20%)" }} />
          <div className="relative z-10 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ember opacity-80">
              Acompanhamento Mounjaro
            </p>
            <h1 className="text-[22px] font-black leading-[1.2] text-white">
              Você investe R$ 1.500/mês no tratamento. Sabe se está funcionando?
            </h1>
            <p className="text-[13px] font-medium leading-relaxed text-white/60">
              Sem dados, você está apostando no escuro.
            </p>
          </div>
        </div>

        {/* DORES */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] ml-1 text-text-dim">
            O que acontece sem acompanhamento
          </p>
          {DORES.map((dor, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl p-4" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <span className="shrink-0 mt-0.5 text-danger">{dor.icon}</span>
              <p className="text-sm font-medium leading-snug text-text">{dor.text}</p>
            </div>
          ))}
        </div>

        {/* SOLUÇÕES */}
        <div className="rounded-[24px] p-5 space-y-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-surface-border)" }}>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-dim">O que o Momo resolve</p>
          {SOLUCOES.map((sol, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--color-ember-glow)", color: "var(--color-ember)" }}>
                {sol.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-text">{sol.titulo}</p>
                <p className="text-xs leading-snug mt-0.5 text-text-muted">{sol.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* SELETOR + CHECKOUT */}
        <div className="rounded-[24px] p-6 space-y-4" style={{ background: "var(--color-surface-mid)", border: "1px solid var(--color-surface-border)" }}>
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-text-dim">
              Escolha seu plano
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {(["mensal", "trimestral"] as PlanType[]).map((p) => {
                const info = PLANOS[p];
                const active = plan === p;
                return (
                  <button
                    key={p}
                    onClick={() => setPlan(p)}
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      padding: "14px 14px 12px",
                      borderRadius: 16,
                      border: active ? "2px solid #ff6500" : "1.5px solid rgba(255,255,255,0.08)",
                      background: active ? "rgba(255,101,0,0.1)" : "rgba(255,255,255,0.03)",
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                      textAlign: "left",
                    }}
                  >
                    {"economia" in info && (
                      <span
                        style={{
                          position: "absolute",
                          top: -10,
                          right: 10,
                          fontSize: 9,
                          fontWeight: 900,
                          letterSpacing: "0.08em",
                          padding: "3px 8px",
                          borderRadius: 99,
                          background: "linear-gradient(135deg,#ff6500,#e05500)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <Zap size={8} fill="currentColor" /> {info.economia}
                      </span>
                    )}
                    <span style={{ fontSize: 12, fontWeight: 800, color: active ? "#ff6500" : "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                      {info.label}
                    </span>
                    <span style={{ fontSize: 20, fontWeight: 900, color: active ? "#fff" : "rgba(255,255,255,0.7)", letterSpacing: "-0.5px", lineHeight: 1 }}>
                      {info.preco}
                    </span>
                    <span style={{ fontSize: 10, color: active ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.3)", marginTop: 3 }}>
                      {info.precoMes}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2.5 text-center text-[11px]" style={{ color: "rgba(255,101,0,0.7)" }}>
              {planoAtual.detalhe}
            </p>
          </div>

          <StripeCheckout plan={plan} />

          <div className="flex items-center justify-center gap-4">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-text-dim">
              <ShieldCheck size={13} className="text-ember" />
              Pagamento seguro
            </span>
            <span className="text-[11px] text-surface-border">·</span>
            <span className="text-[11px] font-medium text-text-dim">Cancele quando quiser</span>
          </div>
        </div>
      </div>
    </div>
  );
}
