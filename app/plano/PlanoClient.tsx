"use client";

import { useState } from "react";
import {
  Check,
  ShieldCheck,
  Star,
  ChevronDown,
  Leaf,
  Stethoscope,
  MessageCircle,
} from "lucide-react";

const CHECKOUT_URL = "https://pay.cakto.com.br/i75hqvn_913965";

const BENEFICIOS = [
  "Registro ilimitado de doses",
  "Acompanhamento de peso e saúde completo",
  "Assistente IA sem limite de perguntas",
  "Receitas personalizadas por fase do tratamento",
  "Marketplace de fornecedores em BH",
  "Notificações push personalizadas",
  "Exportar seus dados em CSV",
  "Grupo VIP no WhatsApp (bônus)",
  "Consulta com nutricionista (no plano anual)",
  "E-book Dieta para Mounjaro (no plano anual)",
];

const BONUS = [
  {
    icon: <Leaf size={22} />,
    titulo: "E-book Dieta para Mounjaro",
    desc: "Guia completo por fase",
    valor: "Valor: R$ 47 · Grátis no anual",
  },
  {
    icon: <Stethoscope size={22} />,
    titulo: "Consulta com Nutricionista",
    desc: "45 min online especializada",
    valor: "Valor: R$ 180 · Grátis no anual",
  },
  {
    icon: <MessageCircle size={22} />,
    titulo: "Grupo VIP WhatsApp",
    desc: "Suporte e comunidade",
    valor: "Exclusivo assinantes",
  },
];

const DEPOIMENTOS = [
  {
    nome: "Mariana S.",
    texto: "Perdi 11kg em 3 meses. O app me ajudou a manter a constância nas doses.",
  },
  {
    nome: "Rafael T.",
    texto: "As receitas por fase salvaram minha rotina. Vale cada centavo.",
  },
  {
    nome: "Juliana M.",
    texto: "O lembrete de dose e o acompanhamento de peso são essenciais pra mim.",
  },
];

const FAQ = [
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Você cancela a qualquer momento, sem multa e sem burocracia, direto no painel da Cakto.",
  },
  {
    q: "Vou perder meus dados se cancelar?",
    a: "Não. Seus dados ficam guardados por 30 dias após o cancelamento — é só reativar para recuperar tudo.",
  },
  {
    q: "Como funciona a garantia?",
    a: "Você tem 7 dias de garantia. Se não gostar, devolvemos 100% do valor, sem perguntas.",
  },
];

export function PlanoClient({
  email,
  status,
  diasRestantesTrial,
  assinaturaExpiraEm,
}: {
  email: string;
  status: "trial" | "premium" | "expirado";
  diasRestantesTrial: number;
  assinaturaExpiraEm: string | null;
}) {
  const checkoutLink = `${CHECKOUT_URL}?email=${encodeURIComponent(email)}`;

  function abrirCheckout() {
    window.open(checkoutLink, "_blank");
  }

  if (status === "premium") {
    return <PremiumAtivo assinaturaExpiraEm={assinaturaExpiraEm} />;
  }

  const headerSub =
    status === "trial"
      ? `Seu trial expira em ${diasRestantesTrial} dia${diasRestantesTrial === 1 ? "" : "s"}`
      : "Seu acesso expirou";

  return (
    <div className="min-h-screen bg-[#f2f2f7] pb-16">
      {/* Header gradiente verde */}
      <div className="bg-gradient-to-br from-[#1c4d2e] to-[#2d7a4f] px-6 pb-8 pt-[calc(env(safe-area-inset-top)+28px)] text-center text-white">
        <div className="text-2xl font-black tracking-tight">🌿 Momo</div>
        <p className="mt-1 text-sm font-medium text-white/70">{headerSub}</p>
      </div>

      <div className="mx-auto w-full max-w-md space-y-8 px-5 pt-8">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-[26px] font-black leading-tight tracking-tight text-slate-900">
            Continue sua jornada
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Não perca o progresso que você já fez.
          </p>
        </div>

        {/* Card de plano */}
        <div
          className="relative overflow-hidden rounded-[28px] p-8 text-white shadow-xl"
          style={{ background: "linear-gradient(135deg, #1c4d2e, #2d7a4f)" }}
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-950">
            <Star size={12} fill="currentColor" /> Mais escolhido
          </span>

          <h2 className="mt-4 text-xl font-bold">Momo Premium</h2>
          <div className="mt-1 flex items-end gap-1">
            <span className="text-[48px] font-black leading-none tracking-tight">R$ 29,90</span>
            <span className="mb-1 text-sm font-medium text-white/70">/mês</span>
          </div>
          <p className="mt-1 text-sm font-medium text-white/70">
            ou R$ 239/ano — economize R$ 119
          </p>

          <ul className="mt-6 space-y-2.5">
            {BENEFICIOS.map((b) => (
              <li key={b} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#4ade80]/20">
                  <Check size={13} strokeWidth={3} className="text-[#4ade80]" />
                </span>
                <span className="text-sm leading-snug text-white/90">{b}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={abrirCheckout}
            className="mt-7 w-full rounded-full bg-white py-4 text-sm font-black text-[#1c4d2e] shadow-lg transition-transform active:scale-[0.98]"
          >
            Assinar por R$ 29,90/mês
          </button>
          <button
            onClick={abrirCheckout}
            className="mt-3 w-full text-center text-[13px] font-bold text-white/80 underline-offset-2 hover:underline"
          >
            Ver plano anual com bônus →
          </button>

          <p className="mt-5 text-center text-[11px] font-medium text-white/60">
            🔒 Pagamento seguro via Cakto · Cancele quando quiser
          </p>
        </div>

        {/* Bônus do anual */}
        <section className="space-y-3">
          <h3 className="px-1 text-sm font-bold text-slate-900">
            No plano anual você também ganha:
          </h3>
          {BONUS.map((b) => (
            <div
              key={b.titulo}
              className="flex items-center gap-4 rounded-[20px] bg-white p-4 shadow-premium"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-forest">
                {b.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">{b.titulo}</p>
                <p className="text-[12px] font-medium text-slate-500">{b.desc}</p>
                <p className="mt-0.5 text-[11px] font-bold text-forest">{b.valor}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Garantia */}
        <section className="flex items-center gap-4 rounded-[20px] bg-surface p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest text-white">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-black text-forest">Garantia de 7 dias</p>
            <p className="text-[12px] font-medium text-slate-600">
              Se não gostar, devolvemos 100% do valor. Sem perguntas, sem burocracia.
            </p>
          </div>
        </section>

        {/* Depoimentos */}
        <section className="space-y-3">
          <h3 className="px-1 text-sm font-bold text-slate-900">Quem usa, recomenda</h3>
          {DEPOIMENTOS.map((d) => (
            <div key={d.nome} className="rounded-[20px] bg-white p-4 shadow-premium">
              <div className="mb-1 flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} fill="currentColor" />
                ))}
              </div>
              <p className="text-[13px] leading-snug text-slate-700">“{d.texto}”</p>
              <p className="mt-1.5 text-[11px] font-bold text-slate-400">{d.nome}</p>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section className="space-y-2">
          <h3 className="px-1 text-sm font-bold text-slate-900">Perguntas frequentes</h3>
          {FAQ.map((f) => (
            <FaqItem key={f.q} pergunta={f.q} resposta={f.a} />
          ))}
        </section>

        {/* CTA final */}
        <button
          onClick={abrirCheckout}
          className="w-full rounded-full bg-forest py-4 text-sm font-black text-white shadow-lg shadow-forest/20 transition-transform active:scale-[0.98]"
        >
          Assinar Momo Premium
        </button>
      </div>
    </div>
  );
}

function FaqItem({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-[16px] bg-white shadow-premium">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <span className="text-[13px] font-bold text-slate-900">{pergunta}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <p className="px-4 pb-4 text-[12px] leading-relaxed text-slate-500">{resposta}</p>}
    </div>
  );
}

function PremiumAtivo({ assinaturaExpiraEm }: { assinaturaExpiraEm: string | null }) {
  const venc = assinaturaExpiraEm
    ? new Date(assinaturaExpiraEm).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Renovação automática";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0d0d] px-6 py-16 text-center">
      <div className="w-full max-w-sm rounded-[28px] bg-[#111] p-8 shadow-2xl ring-1 ring-white/5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4ade80]/15 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#4ade80]">
          <Check size={13} strokeWidth={3} /> Premium ativo
        </span>

        <h1 className="mt-5 text-2xl font-black text-white">Sua assinatura está ativa</h1>
        <p className="mt-2 text-sm font-medium text-white/50">
          Você tem acesso total a todos os recursos do Momo.
        </p>

        <div className="mt-6 rounded-2xl bg-white/5 p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">
            Próximo vencimento
          </p>
          <p className="mt-1 text-base font-bold text-white">{venc}</p>
        </div>

        <a
          href="https://app.cakto.com.br/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 block w-full rounded-full bg-white py-3.5 text-sm font-black text-[#111] transition-transform active:scale-[0.98]"
        >
          Gerenciar assinatura
        </a>
        <a
          href="/"
          className="mt-3 block w-full rounded-full border border-white/15 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/5"
        >
          Voltar ao app
        </a>
      </div>
    </div>
  );
}
