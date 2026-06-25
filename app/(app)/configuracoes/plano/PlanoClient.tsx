"use client";

import { PageHeader } from "@/components/PageHeader";
import { Check } from "lucide-react";

export function PlanoClient() {
  return (
    <div className="space-y-6 pb-32">
      <PageHeader title="Meu Plano" />

      <div className="animate-fade-in">
        <div
          className="rounded-[24px] p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #180900, #2e1200)",
            border: "1px solid rgba(255,101,0,0.22)",
            boxShadow: "0 8px 28px rgba(255,101,0,0.14)",
          }}
        >
          <div
            className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full opacity-10"
            style={{ background: "#ff6500", filter: "blur(50px)" }}
          />

          <div className="relative z-10 flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(255,101,0,0.15)",
                border: "1px solid rgba(255,101,0,0.28)",
              }}
            >
              <Check size={22} style={{ color: "#ff6500" }} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Acesso Gratuito</h2>
              <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                Momo para pacientes
              </p>
            </div>
          </div>

          <div
            className="relative z-10 rounded-2xl p-4"
            style={{
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider"
                style={{ color: "#4ade80" }}
              >
                <Check size={12} strokeWidth={3} /> Ativo
              </span>
            </div>
            <p className="text-sm font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              O Momo é grátis para pacientes. Você tem acesso completo a doses,
              dieta, estoque e acompanhamento — sem nenhum custo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
