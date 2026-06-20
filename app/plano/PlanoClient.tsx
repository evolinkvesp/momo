"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, TrendingUp, Utensils, Bell, Star, Package, ShieldCheck, Check, ChevronLeft, Zap } from "lucide-react";
import { StripeCheckout } from "@/components/StripeCheckout";

type PlanType = "mensal" | "trimestral";

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
    trial: true,
  },
  trimestral: {
    label: "Trimestral",
    preco: "R$ 69,90",
    precoMes: "R$ 23,30/mês",
    detalhe: "Economize 22% · sem período gratuito",
    trial: false,
    economia: "22% OFF",
  },
};

export function PlanoClient({
  status,
  diasRestantesTrial,
  assinaturaExpiraEm,
}: {
  status: "trial" | "premium" | "expirado";
  diasRestantesTrial: number;
  assinaturaExpiraEm: string | null;
}) {
  const [syncing, setSyncing] = useState(false);
  const [plan, setPlan] = useState<PlanType>("trimestral");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1" && status !== "premium") {
      setSyncing(true);
      setTimeout(() => window.location.replace("/plano"), 2500);
    }
  }, []);

  if (syncing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6" style={{ background: "#0d0d0d" }}>
        <div className="h-10 w-10 animate-spin rounded-full border-4" style={{ borderColor: "rgba(255,101,0,0.2)", borderTopColor: "#ff6500" }} />
        <p className="text-base font-bold text-white">Ativando sua assinatura...</p>
      </div>
    );
  }

  if (status === "premium") {
    return <PremiumAtivo assinaturaExpiraEm={assinaturaExpiraEm} />;
  }

  const planoAtual = PLANOS[plan];

  return (
    <div className="min-h-screen bg-bg pb-12">
      {/* Header */}
      <div
        className="relative overflow-hidden px-5 pb-8"
        style={{
          background: "linear-gradient(135deg, #1a0800 0%, #2d1200 60%, #1a0800 100%)",
          paddingTop: "calc(env(safe-area-inset-top) + 20px)",
          boxShadow: "0 8px 32px rgba(255,101,0,0.18)",
        }}
      >
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full opacity-10" style={{ background: "#ff6500", filter: "blur(50px)", transform: "translate(20%, -20%)" }} />
        <a href="/" className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
          <ChevronLeft size={16} strokeWidth={2.5} />
          Voltar
        </a>
        <div className="relative z-10 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "rgba(255,101,0,0.85)" }}>
            Acompanhamento Mounjaro
          </p>
          <h1 className="text-[22px] font-black leading-[1.2] text-white">
            Você investe R$ 1.500/mês no tratamento. Sabe se está funcionando?
          </h1>
          <p className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
            {status === "trial"
              ? `Seu trial expira em ${diasRestantesTrial} dia${diasRestantesTrial === 1 ? "" : "s"}`
              : "Seu acesso expirou. Não perca sua evolução."}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md space-y-5 px-5 pt-6">
        {/* Dores */}
        <div className="space-y-2.5">
          <p className="ml-1 text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "var(--color-text-dim)" }}>
            O que acontece sem acompanhamento
          </p>
          {DORES.map((d, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl p-4" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <span className="mt-0.5 shrink-0" style={{ color: "#f87171" }}>{d.icon}</span>
              <p className="text-sm font-medium leading-snug" style={{ color: "var(--color-text)" }}>{d.text}</p>
            </div>
          ))}
        </div>

        {/* Soluções */}
        <div className="space-y-4 rounded-[24px] p-5" style={{ background: "var(--color-surface)", border: "1px solid var(--color-surface-border)" }}>
          <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "var(--color-text-dim)" }}>
            O que o Momo resolve
          </p>
          {SOLUCOES.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(255,101,0,0.1)", color: "#ff6500" }}>
                {s.icon}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--color-text)" }}>{s.titulo}</p>
                <p className="mt-0.5 text-xs leading-snug" style={{ color: "var(--color-text-muted)" }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Seletor de plano + Checkout */}
        <div className="space-y-4 rounded-[24px] p-6" style={{ background: "var(--color-surface-mid)", border: "1px solid var(--color-surface-border)" }}>
          {/* Seletor */}
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "var(--color-text-dim)" }}>
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

          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "var(--color-text-dim)" }}>
              <ShieldCheck size={13} style={{ color: "#ff6500" }} />
              Pagamento seguro
            </span>
            <span className="text-[11px]" style={{ color: "var(--color-surface-border)" }}>·</span>
            <span className="text-[11px] font-medium" style={{ color: "var(--color-text-dim)" }}>
              Cancele quando quiser
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PremiumAtivo({ assinaturaExpiraEm }: { assinaturaExpiraEm: string | null }) {
  const [loading, setLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const venc = assinaturaExpiraEm
    ? new Date(assinaturaExpiraEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : "Renovação automática";

  async function handlePortal() {
    setLoading(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPortalError(data.error || "Erro ao abrir portal.");
        setLoading(false);
      }
    } catch {
      setPortalError("Erro ao conectar com o servidor.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16" style={{ background: "#0d0d0d" }}>
      <div className="w-full max-w-sm rounded-[28px] p-8 text-center shadow-2xl" style={{ background: "#111", border: "1px solid rgba(255,101,0,0.15)" }}>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "rgba(255,101,0,0.12)", border: "1px solid rgba(255,101,0,0.25)" }}>
          <Star size={28} style={{ color: "#ff6500", fill: "#ff6500" }} />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider" style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80" }}>
          <Check size={13} strokeWidth={3} /> Premium ativo
        </span>
        <h1 className="mt-4 text-2xl font-black text-white">Sua assinatura está ativa</h1>
        <p className="mt-2 text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
          Você tem acesso total a todos os recursos do Momo.
        </p>
        <div className="mt-6 rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Próximo vencimento</p>
          <p className="mt-1 text-base font-bold text-white">{venc}</p>
        </div>
        <a href="/" className="mt-6 block w-full rounded-full py-3.5 text-sm font-black" style={{ background: "linear-gradient(135deg, #ff6500, #e05500)", color: "white", boxShadow: "0 4px 16px rgba(255,101,0,0.35)", textDecoration: "none" }}>
          Voltar ao app
        </a>
        <button onClick={handlePortal} disabled={loading} className="mt-3 block w-full rounded-full py-3.5 text-sm font-bold transition-transform active:scale-[0.98] disabled:opacity-60" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", background: "transparent" }}>
          {loading ? "Abrindo..." : "Gerenciar assinatura"}
        </button>
        {portalError && <p className="mt-2 text-xs text-red-400">{portalError}</p>}
      </div>
    </div>
  );
}
