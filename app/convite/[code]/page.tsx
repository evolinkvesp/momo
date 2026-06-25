import { createServiceClient } from "@/lib/supabase-server";
import Link from "next/link";
import {
  Activity,
  Bell,
  TrendingDown,
  Package,
  BookOpen,
  ArrowRight,
  Heart,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: { code: string };
}

const BENEFITS = [
  {
    icon: Bell,
    title: "Lembretes de dose",
    description: "Nunca perca o dia certo da aplicação.",
  },
  {
    icon: TrendingDown,
    title: "Gráficos de progresso",
    description: "Visualize sua perda de peso semana a semana.",
  },
  {
    icon: Activity,
    title: "Acompanhamento completo",
    description: "Registre sintomas, humor e medidas em um só lugar.",
  },
  {
    icon: Package,
    title: "Controle de estoque",
    description: "Saiba quando pedir mais ampolas antes de acabar.",
  },
  {
    icon: BookOpen,
    title: "Histórico para o médico",
    description: "Relatório completo do tratamento sempre à mão.",
  },
];

export default async function ConvitePublicPage({ params }: Props) {
  const supabase = createServiceClient();

  // Try to find the referrer by code
  const { data: referrer } = await supabase
    .from("profiles")
    .select("nome")
    .eq("referral_code", params.code)
    .single();

  const referrerName = referrer?.nome
    ? referrer.nome.split(" ")[0] // First name only
    : null;

  const signupHref = `/cadastro?ref=${encodeURIComponent(params.code)}`;

  return (
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{ background: "#0d0d0d", color: "#fff" }}
    >
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, #ff6500 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <main className="relative z-10 flex-1 px-6 py-14">
        <div className="mx-auto max-w-md space-y-8">

          {/* Brand */}
          <div className="text-center space-y-4">
            {/* Logo area */}
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem]"
              style={{
                background: "rgba(255,101,0,0.08)",
                border: "1px solid rgba(255,101,0,0.2)",
              }}
            >
              <Heart className="h-8 w-8" style={{ color: "#ff6500" }} />
            </div>

            {/* Invite badge — only shown when referrer found */}
            {referrerName && (
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-2"
                style={{
                  background: "rgba(255,101,0,0.08)",
                  border: "1px solid rgba(255,101,0,0.2)",
                }}
              >
                <span className="text-sm font-bold" style={{ color: "#ff6500" }}>
                  {referrerName} te convidou
                </span>
              </div>
            )}

            <h1
              className="text-4xl font-black tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-syne, sans-serif)" }}
            >
              Acompanhe seu tratamento sem complicação
            </h1>

            <p className="text-base font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              O Momo é o app gratuito para quem está em acompanhamento médico e quer manter tudo organizado — doses, peso, dieta e estoque.
            </p>
          </div>

          {/* Benefits */}
          <div
            className="rounded-[24px] p-5 space-y-3"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p
              className="text-[10px] font-black uppercase tracking-[0.2em] mb-4"
              style={{ color: "rgba(255,101,0,0.7)" }}
            >
              O que você ganha
            </p>

            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4">
                <div
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: "rgba(255,101,0,0.1)",
                    color: "#ff6500",
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Free badge */}
          <div
            className="rounded-2xl px-5 py-4 text-center"
            style={{
              background: "rgba(255,101,0,0.06)",
              border: "1px solid rgba(255,101,0,0.15)",
            }}
          >
            <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
              100% gratuito. Sem cartao de credito.
            </p>
          </div>

          {/* CTA */}
          <Link
            href={signupHref}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-full text-base font-bold text-white transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #ff6500, #cc5000)",
              boxShadow: "0 8px 32px rgba(255,101,0,0.3)",
            }}
          >
            Criar conta gratuita
            <ArrowRight className="h-5 w-5" />
          </Link>

          <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            Ao criar sua conta, voce concorda com os Termos de Uso.
          </p>
        </div>
      </main>
    </div>
  );
}
